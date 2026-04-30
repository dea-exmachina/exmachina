'use server'

import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'
import { toSlug } from '@/lib/slug'
import { getAuthedProject } from '@/lib/server/auth-guard'

// ─── Step 1 ───────────────────────────────────────────────────────────────────

export async function saveStep1(
  slug: string,
  mission: string
): Promise<{ ok?: true; error?: string }> {
  const result = await getAuthedProject(slug)
  if ('error' in result && !('project' in result)) return { error: result.error }
  const { supabase, project } = result as Exclude<typeof result, { error: string }>

  const newStep = Math.max(project.planning_step ?? 0, 1)
  const { error } = await supabase
    .from('projects')
    .update({ mission, planning_step: newStep })
    .eq('id', project.id)

  if (error) return { error: error.message }
  return { ok: true }
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

export async function saveStep2(
  slug: string,
  goals: Array<{ id: string; text: string }>
): Promise<{ ok?: true; error?: string }> {
  const result = await getAuthedProject(slug)
  if ('error' in result && !('project' in result)) return { error: result.error }
  const { supabase, project } = result as Exclude<typeof result, { error: string }>

  const newStep = Math.max(project.planning_step ?? 0, 2)
  const { error } = await supabase
    .from('projects')
    .update({ goals: goals as unknown as import('@/types/database').Json, planning_step: newStep })
    .eq('id', project.id)

  if (error) return { error: error.message }
  return { ok: true }
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

export async function saveStep3(
  slug: string,
  stackContext: string
): Promise<{ ok?: true; error?: string }> {
  const result = await getAuthedProject(slug)
  if ('error' in result && !('project' in result)) return { error: result.error }
  const { supabase, project } = result as Exclude<typeof result, { error: string }>

  const newStep = Math.max(project.planning_step ?? 0, 3)
  const { error } = await supabase
    .from('projects')
    .update({ stack_context: stackContext, planning_step: newStep })
    .eq('id', project.id)

  if (error) return { error: error.message }
  return { ok: true }
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

export async function saveStep4(
  slug: string,
  agents: Array<{ name: string; role: string }>
): Promise<{ ok?: true; error?: string }> {
  const result = await getAuthedProject(slug)
  if ('error' in result && !('project' in result)) return { error: result.error }
  const { supabase, tenantId, project } = result as Exclude<typeof result, { error: string }>

  for (const agent of agents) {
    const uuidPrefix = crypto.randomUUID().slice(0, 6)
    const agentSlug = `${toSlug(agent.name)}-${uuidPrefix}`
    const identityPath = `agents/${agentSlug}/identity.md`
    const jdPath = `projects/${slug}/agents/${agentSlug}/jd.md`

    const { data: agentRow, error: agentError } = await supabase
      .from('agents')
      .insert({
        name: agent.name,
        role: agent.role,
        identity_path: identityPath,
        tenant_id: tenantId,
        is_promoted: false,
      })
      .select('id')
      .single()

    if (agentError || !agentRow) return { error: agentError?.message ?? 'Agent insert failed' }

    const { error: jdError } = await supabase.from('agent_jds').insert({
      role_title: agent.role,
      project_id: project.id,
      jd_path: jdPath,
      tenant_id: tenantId,
      hired_into_agent_id: agentRow.id,
    })

    if (jdError) return { error: jdError.message }
  }

  const newStep = Math.max(project.planning_step ?? 0, 4)
  const { error: stepError } = await supabase
    .from('projects')
    .update({ planning_step: newStep })
    .eq('id', project.id)

  if (stepError) return { error: stepError.message }
  return { ok: true }
}

// ─── Step 7 — Launch ──────────────────────────────────────────────────────────

interface SprintInput {
  name: string
  goal: string
  startsAt?: string
  endsAt?: string
}

interface EpicInput {
  name: string
  cards: Array<{ title: string }>
}

interface WizardState {
  sprint: SprintInput
  epics: EpicInput[]
}

export async function launchProject(
  slug: string,
  wizardState: WizardState
): Promise<{ redirect?: string; vaultWarning?: string; error?: string }> {
  const result = await getAuthedProject(slug)
  if ('error' in result && !('project' in result)) return { error: result.error }
  const { supabase, tenantId, project } = result as Exclude<typeof result, { error: string }>

  const sprintSlug = toSlug(wizardState.sprint.name)
  const sprintMdPath = `projects/${slug}/sprints/${sprintSlug}.md`

  const pEpics = wizardState.epics.map((epic) => {
    const epicSlug = toSlug(epic.name)
    const epicMdPath = `projects/${slug}/sprints/${sprintSlug}/${epicSlug}.md`
    return {
      name: epic.name,
      slug: epicSlug,
      epic_md_path: epicMdPath,
      cards: epic.cards.map((card) => {
        const cardSlug = toSlug(card.title)
        return {
          title: card.title,
          slug: cardSlug,
          card_md_path: `projects/${slug}/sprints/${sprintSlug}/${epicSlug}/${cardSlug}.md`,
        }
      }),
    }
  })

  const { error: rpcError } = await supabase.rpc('launch_project', {
    p_project_id: project.id,
    p_sprint_name: wizardState.sprint.name,
    p_sprint_slug: sprintSlug,
    p_sprint_goal: wizardState.sprint.goal,
    p_sprint_starts_at: wizardState.sprint.startsAt ?? null,
    p_sprint_ends_at: wizardState.sprint.endsAt ?? null,
    p_sprint_md_path: sprintMdPath,
    p_epics: pEpics,
    p_tenant_id: tenantId,
  })

  if (rpcError) return { error: rpcError.message }

  // Re-fetch project for latest field values
  const { data: freshProject } = await supabase
    .from('projects')
    .select('name, mission, goals, stack_context, project_md_path')
    .eq('id', project.id)
    .single()

  // Attempt vault file write
  try {
    const vaultRoot = process.env.CC_VAULT_ROOT
    if (!vaultRoot || !freshProject?.project_md_path) {
      throw new Error('CC_VAULT_ROOT or project_md_path not set')
    }

    const filePath = path.join(vaultRoot, freshProject.project_md_path)
    const dir = path.dirname(filePath)
    fs.mkdirSync(dir, { recursive: true })

    const goalsArray = Array.isArray(freshProject.goals)
      ? (freshProject.goals as Array<{ id: string; text: string }>)
      : []

    const goalsSection = goalsArray.length > 0
      ? goalsArray.map((g) => `- ${g.text}`).join('\n')
      : '- (none)'

    const epicsSection = wizardState.epics
      .map((epic) => {
        const cardLines = epic.cards.map((c) => `- ${c.title}`).join('\n')
        return `### Epic: ${epic.name}\n${cardLines}`
      })
      .join('\n\n')

    const content = `# ${freshProject.name}

## Mission
${freshProject.mission ?? ''}

## Goals
${goalsSection}

## Stack & Context
${freshProject.stack_context ?? ''}

## First Sprint: ${wizardState.sprint.name}
Goal: ${wizardState.sprint.goal}

## Initial Cards
${epicsSection}
`

    fs.writeFileSync(filePath, content, 'utf-8')
  } catch (err) {
    console.error('[launchProject] vault write failed:', err)
    revalidatePath(`/projects/${slug}`)
    return {
      redirect: `/projects/${slug}`,
      vaultWarning: 'Vault context file could not be written — create it manually or re-run.',
    }
  }

  revalidatePath(`/projects/${slug}`)
  return { redirect: `/projects/${slug}` }
}
