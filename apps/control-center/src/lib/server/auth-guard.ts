// No 'use server' directive — plain async utility importable from any server action
import { createClient } from '@/lib/supabase/server'

export async function getAuthedProject(slug: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' as const }

  const tenantId = user.app_metadata?.tenant_id as string | undefined
  if (!tenantId) return { error: 'Forbidden' as const }

  const { data: project } = await supabase
    .from('projects')
    .select(
      'id, name, slug, status, planning_step, mission, goals, stack_context, project_md_path, tenant_id',
    )
    .eq('slug', slug)
    .single()

  if (!project || project.tenant_id !== tenantId) return { error: 'Forbidden' as const }

  return { supabase, user, tenantId, project }
}
