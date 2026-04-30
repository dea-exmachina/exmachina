import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'
import CardDetail from './CardDetail'

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ slug: string; cardId: string }>
}) {
  const { slug, cardId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const tenantId = user.app_metadata?.tenant_id as string | undefined
  if (!tenantId) redirect('/sign-in')

  // Load project
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, slug, tenant_id')
    .eq('slug', slug)
    .single()

  if (!project || project.tenant_id !== tenantId) notFound()

  // Load card by ID, verify it belongs to this project via epic → sprint
  const { data: card } = await supabase
    .from('cards')
    .select(`
      id, title, description, slug, status, assigned_agent_id, created_at, updated_at,
      epics!inner (
        id, name, slug,
        sprints!inner ( id, name, project_id )
      )
    `)
    .eq('id', cardId)
    .eq('epics.sprints.project_id', project.id)
    .maybeSingle()

  if (!card) notFound()

  // TypeScript: access joined relations
  const epic = Array.isArray(card.epics) ? card.epics[0] : card.epics as {
    id: string; name: string; slug: string;
    sprints: { id: string; name: string; project_id: string } | Array<{ id: string; name: string; project_id: string }>
  }
  const sprint = Array.isArray(epic.sprints) ? epic.sprints[0] : epic.sprints as { id: string; name: string; project_id: string }

  // Load project-scoped agents via agent_jds
  const { data: agentJds } = await supabase
    .from('agent_jds')
    .select('hired_into_agent_id')
    .eq('project_id', project.id)
    .not('hired_into_agent_id', 'is', null)

  const agentIds = (agentJds ?? [])
    .map((j) => j.hired_into_agent_id)
    .filter(Boolean) as string[]

  const agents =
    agentIds.length > 0
      ? ((
          await supabase
            .from('agents')
            .select('id, name, role')
            .in('id', agentIds)
            .order('name')
        ).data ?? [])
      : []

  return (
    <AppShell
      user={user}
      breadcrumbs={[
        { label: 'Projects', href: '/' },
        { label: project.name, href: `/projects/${slug}` },
        { label: card.title },
      ]}
    >
      <CardDetail
        card={{
          id: card.id,
          title: card.title,
          description: card.description,
          slug: card.slug,
          status: card.status,
          assigned_agent_id: card.assigned_agent_id,
          created_at: card.created_at,
          updated_at: card.updated_at,
          epicName: epic.name,
          epicSlug: epic.slug,
          sprintName: sprint.name,
        }}
        projectSlug={slug}
        projectName={project.name}
        agents={agents}
      />
    </AppShell>
  )
}
