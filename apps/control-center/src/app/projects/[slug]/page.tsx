import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import StartSprintForm from '@/components/projects/StartSprintForm'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const tenantId = user.app_metadata?.tenant_id as string | undefined
  if (!tenantId) redirect('/sign-in')

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, mission, slug, status, scope, planning_step, updated_at, tenant_id')
    .eq('slug', slug)
    .single()

  if (!project || project.tenant_id !== tenantId) notFound()

  const needsPlanning = project.status === 'draft'

  let sprint = null
  if (!needsPlanning) {
    const { data } = await supabase
      .from('sprints')
      .select(`
        id, name, goal,
        epics (
          id, name, slug,
          cards (id, title, slug, status, description, assigned_agent_id)
        )
      `)
      .eq('project_id', project.id)
      .eq('status', 'active')
      .single()
    sprint = data
  }

  return (
    <AppShell
      user={user}
      breadcrumbs={[
        { label: 'Projects', href: '/' },
        { label: project.name },
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Planning banner */}
        {needsPlanning && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'rgba(212,132,10,0.08)',
              border: '1px solid rgba(212,132,10,0.25)',
              borderRadius: 'var(--cc-radius)',
              gap: '16px',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--cc-font-ui)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--cc-accent)',
                  marginBottom: '2px',
                }}
              >
                Planning session pending
              </div>
              <div
                style={{
                  fontFamily: 'var(--cc-font-ui)',
                  fontSize: '12px',
                  color: 'var(--cc-text-dim)',
                }}
              >
                Define the guiding star, goals, team, and first sprint to make this project fully
                operational.
              </div>
            </div>
            <Link
              href={`/projects/${slug}/plan`}
              style={{
                flexShrink: 0,
                background: 'var(--cc-accent)',
                color: '#060911',
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '12px',
                fontWeight: 600,
                padding: '7px 14px',
                borderRadius: 'var(--cc-radius)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Start planning →
            </Link>
          </div>
        )}

        {/* Project meta */}
        <div
          style={{
            background: 'var(--cc-surface)',
            border: '1px solid var(--cc-border)',
            borderRadius: 'var(--cc-radius)',
            padding: '16px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--cc-text)',
              marginBottom: project.mission ? '4px' : 0,
            }}
          >
            {project.name}
          </div>
          {project.mission && (
            <div
              style={{
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '13px',
                color: 'var(--cc-text-dim)',
              }}
            >
              {project.mission}
            </div>
          )}
        </div>

        {/* Sub-nav tabs (only for active projects) */}
        {!needsPlanning && (
          <div
            style={{
              display: 'flex',
              gap: '0',
              borderBottom: '1px solid var(--cc-border)',
            }}
          >
            {[
              { label: 'Kanban', href: `/projects/${slug}` },
              { label: 'Council', href: `/projects/${slug}/council` },
            ].map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  fontFamily: 'var(--cc-font-ui)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--cc-text)',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderBottom: '2px solid var(--cc-accent)',
                  marginBottom: '-1px',
                  display: 'inline-block',
                }}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        )}

        {!needsPlanning && (
          sprint ? (
            <KanbanBoard
              sprint={sprint}
              projectSlug={project.slug}
              tenantId={tenantId}
            />
          ) : (
            <StartSprintForm projectSlug={slug} />
          )
        )}

      </div>
    </AppShell>
  )
}
