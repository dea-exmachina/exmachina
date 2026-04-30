'use server'

import { mkdirSync, writeFileSync, appendFileSync, existsSync } from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'
import { getAuthedProject } from '@/lib/server/auth-guard'

export async function createCouncilReview(
  slug: string,
  trigger: 'pre-decision' | 'post-epic',
  synthesis: string,
): Promise<{ ok?: true; reviewId?: string; vaultWarning?: string; error?: string }> {
  const result = await getAuthedProject(slug)
  if ('error' in result) return { error: result.error }
  const { supabase, tenantId, project } = result

  // Look up the default board (nullable — if none, board_id is null)
  const { data: board } = await supabase
    .from('boards')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('is_default', true)
    .maybeSingle()

  // Generate a short review ID prefix for vault path (we get the id after insert)
  // Insert first, then write vault file with the real ID
  const artifactDir = `projects/${slug}/council`

  const { data: review, error: insertError } = await supabase
    .from('council_reviews')
    .insert({
      tenant_id: tenantId,
      project_id: project.id,
      board_id: board?.id ?? null,
      trigger,
      synthesis: synthesis.trim() || null,
      artifact_path: `${artifactDir}/pending.md`, // temp; updated below
    })
    .select('id')
    .single()

  if (insertError || !review) return { error: insertError?.message ?? 'Insert failed' }

  const idPrefix = review.id.slice(0, 8)
  const artifactPath = `${artifactDir}/${idPrefix}.md`

  // Update with real artifact path
  await supabase
    .from('council_reviews')
    .update({ artifact_path: artifactPath })
    .eq('id', review.id)

  // Non-blocking vault write
  let vaultWarning: string | undefined
  try {
    const vaultRoot = process.env.CC_VAULT_ROOT
    if (!vaultRoot) throw new Error('CC_VAULT_ROOT not set')

    const filePath = path.join(vaultRoot, artifactPath)
    mkdirSync(path.dirname(filePath), { recursive: true })

    const content = `# Council Review — ${trigger}
Project: ${project.name}
ID: ${review.id}
Created: ${new Date().toISOString()}

## Context
${synthesis.trim() || '(none provided)'}

## Status
pending
`
    writeFileSync(filePath, content, 'utf-8')
  } catch (err) {
    console.error('[createCouncilReview] vault write failed:', err)
    vaultWarning = 'Vault file could not be written — create it manually if needed.'
  }

  revalidatePath(`/projects/${slug}/council`)
  return { ok: true, reviewId: review.id, ...(vaultWarning ? { vaultWarning } : {}) }
}

export async function recordDecision(
  slug: string,
  reviewId: string,
  decision: 'approve' | 'modify' | 'reject',
  notes: string,
): Promise<{ ok?: true; error?: string }> {
  const result = await getAuthedProject(slug)
  if ('error' in result) return { error: result.error }
  const { supabase } = result

  // Load the review to get artifact_path
  const { data: review } = await supabase
    .from('council_reviews')
    .select('id, artifact_path, synthesis')
    .eq('id', reviewId)
    .maybeSingle()

  if (!review) return { error: 'Review not found' }

  const { error: updateError } = await supabase
    .from('council_reviews')
    .update({
      human_decision: decision,
      human_decision_at: new Date().toISOString(),
      synthesis: notes.trim() || review.synthesis,
    })
    .eq('id', reviewId)

  if (updateError) return { error: updateError.message }

  // Non-blocking vault append
  try {
    const vaultRoot = process.env.CC_VAULT_ROOT
    if (!vaultRoot) throw new Error('CC_VAULT_ROOT not set')

    const filePath = path.join(vaultRoot, review.artifact_path)

    // If file doesn't exist, create from scratch then append
    if (!existsSync(filePath)) {
      mkdirSync(path.dirname(filePath), { recursive: true })
      writeFileSync(
        filePath,
        `# Council Review\nID: ${reviewId}\n\n`,
        'utf-8',
      )
    }

    const decisionBlock = `\n\n## Decision\n${new Date().toISOString()}\n**${decision}**\n${notes.trim() || '(no notes)'}\n`
    appendFileSync(filePath, decisionBlock, 'utf-8')
  } catch (err) {
    console.error('[recordDecision] vault write failed:', err)
    // Non-blocking — still return ok
  }

  revalidatePath(`/projects/${slug}/council`)
  return { ok: true }
}
