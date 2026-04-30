'use server'

import { revalidatePath } from 'next/cache'
import { toSlug } from '@/lib/slug'
import { getAuthedProject } from '@/lib/server/auth-guard'

export async function startSprint(
  slug: string,
  name: string,
  goal: string,
): Promise<{ ok?: true; error?: string }> {
  const result = await getAuthedProject(slug)
  if ('error' in result) return { error: result.error }
  const { supabase, tenantId, project } = result

  // Guard: no active sprint already running
  const { data: existing } = await supabase
    .from('sprints')
    .select('id')
    .eq('project_id', project.id)
    .eq('status', 'active')
    .maybeSingle()

  if (existing) return { error: 'active_sprint_exists' }

  const sprintSlug = toSlug(name)
  const sprintMdPath = `projects/${slug}/sprints/${sprintSlug}.md`

  const { error } = await supabase.from('sprints').insert({
    project_id: project.id,
    tenant_id: tenantId,
    name: name.trim(),
    slug: sprintSlug,
    goal: goal.trim() || null,
    status: 'active',
    sprint_md_path: sprintMdPath,
  })

  if (error) return { error: error.message }

  revalidatePath(`/projects/${slug}`)
  return { ok: true }
}

export async function closeSprint(
  slug: string,
  sprintId: string,
): Promise<{ ok?: true; error?: string }> {
  const result = await getAuthedProject(slug)
  if ('error' in result) return { error: result.error }
  const { supabase, project } = result

  // Verify sprint belongs to this project
  const { data: sprint } = await supabase
    .from('sprints')
    .select('id, status')
    .eq('id', sprintId)
    .eq('project_id', project.id)
    .maybeSingle()

  if (!sprint) return { error: 'Sprint not found' }
  if (sprint.status !== 'active') return { error: 'Sprint is not active' }

  const { error } = await supabase
    .from('sprints')
    .update({ status: 'closed' })
    .eq('id', sprintId)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${slug}`)
  return { ok: true }
}
