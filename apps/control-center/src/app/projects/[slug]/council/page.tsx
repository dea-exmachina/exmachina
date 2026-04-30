import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'
import { ConveneForm, RecordDecisionForm } from '@/components/council/ConveneForm'

export default async function CouncilPage({
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
    .select('id, name, slug, tenant_id')
    .eq('slug', slug)
    .single()

  if (!project || project.tenant_id !== tenantId) notFound()

  // Default board — nullable, graceful empty state
  const { data: board } = await supabase
    .from('boards')
    .select(`
      id, name,
      board_members (
        id, construct_name, seat, is_chair, display_order
      )
    `)
    .eq('tenant_id', tenantId)
    .eq('is_default', true)
    .maybeSingle()

  // Council reviews for this project, newest first
  const { data: reviews } = await supabase
    .from('council_reviews')
    .select('id, trigger, synthesis, human_decision, human_decision_at, created_at')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })

  const boardMembers = board?.board_members
    ? ([...board.board_members] as Array<{
        id: string
        construct_name: string
        seat: string
        is_chair: boolean
        display_order: number
      }>).sort((a, b) => a.display_order - b.display_order)
    : []

  return (
    <AppShell
      user={user}
      breadcrumbs={[
        { label: 'Projects', href: '/' },
        { label: project.name, href: `/projects/${slug}` },
        { label: 'Council' },
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Sub-nav tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--cc-border)' }}>
          {[
            { label: 'Kanban', href: `/projects/${slug}` },
            { label: 'Council', href: `/projects/${slug}/council` },
          ].map((tab) => {
            const isActive = tab.href === `/projects/${slug}/council`
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  fontFamily: 'var(--cc-font-ui)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: isActive ? 'var(--cc-text)' : 'var(--cc-text-dim)',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderBottom: isActive ? '2px solid var(--cc-accent)' : '2px solid transparent',
                  marginBottom: '-1px',
                  display: 'inline-block',
                }}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Two-column layout: reviews left, board right */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

          {/* Left: reviews list + convene form */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  fontFamily: 'var(--cc-font-data)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--cc-text-dim)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Reviews
              </div>
              <ConveneForm projectSlug={slug} />
            </div>

            {!reviews || reviews.length === 0 ? (
              <div
                style={{
                  fontFamily: 'var(--cc-font-ui)',
                  fontSize: '13px',
                  color: 'var(--cc-text-dim)',
                  padding: '24px 0',
                  textAlign: 'center',
                }}
              >
                No reviews yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.map((review) => {
                  const isPending = !review.human_decision
                  const statusColor = isPending ? 'var(--cc-yellow)' : 'var(--cc-green)'
                  const statusLabel = isPending ? 'pending' : review.human_decision

                  return (
                    <div
                      key={review.id}
                      style={{
                        background: 'var(--cc-surface)',
                        border: '1px solid var(--cc-border)',
                        borderRadius: 'var(--cc-radius)',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      {/* Review header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--cc-font-data)',
                            fontSize: '10px',
                            color: statusColor,
                            background: `color-mix(in srgb, ${statusColor} 10%, transparent)`,
                            border: `1px solid color-mix(in srgb, ${statusColor} 25%, transparent)`,
                            borderRadius: 'var(--cc-radius)',
                            padding: '2px 6px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {statusLabel}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--cc-font-data)',
                            fontSize: '10px',
                            color: 'var(--cc-text-dim)',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {review.trigger}
                        </span>
                        <span
                          style={{
                            marginLeft: 'auto',
                            fontFamily: 'var(--cc-font-data)',
                            fontSize: '10px',
                            color: 'var(--cc-text-dim)',
                          }}
                        >
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Synthesis / context */}
                      {review.synthesis && (
                        <div
                          style={{
                            fontFamily: 'var(--cc-font-ui)',
                            fontSize: '12px',
                            color: 'var(--cc-text)',
                          }}
                        >
                          {review.synthesis}
                        </div>
                      )}

                      {/* Record decision form (only for pending) */}
                      {isPending && (
                        <RecordDecisionForm reviewId={review.id} projectSlug={slug} />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: board panel */}
          <div
            style={{
              width: '220px',
              flexShrink: 0,
              background: 'var(--cc-surface)',
              border: '1px solid var(--cc-border)',
              borderRadius: 'var(--cc-radius)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--cc-font-data)',
                fontSize: '10px',
                fontWeight: 500,
                color: 'var(--cc-text-dim)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Board
            </div>

            {!board ? (
              <div
                style={{
                  fontFamily: 'var(--cc-font-ui)',
                  fontSize: '12px',
                  color: 'var(--cc-text-dim)',
                }}
              >
                No board configured.
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontFamily: 'var(--cc-font-ui)',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--cc-text)',
                  }}
                >
                  {board.name}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {boardMembers.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {m.is_chair && (
                        <span
                          style={{
                            fontFamily: 'var(--cc-font-data)',
                            fontSize: '9px',
                            color: 'var(--cc-accent)',
                            letterSpacing: '0.06em',
                          }}
                        >
                          ★
                        </span>
                      )}
                      <div>
                        <div
                          style={{
                            fontFamily: 'var(--cc-font-ui)',
                            fontSize: '12px',
                            color: 'var(--cc-text)',
                          }}
                        >
                          {m.construct_name}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--cc-font-data)',
                            fontSize: '10px',
                            color: 'var(--cc-text-dim)',
                          }}
                        >
                          {m.seat}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </AppShell>
  )
}
