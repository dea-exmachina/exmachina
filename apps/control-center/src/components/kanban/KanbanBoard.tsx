'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import KanbanLane from './KanbanLane'
import { updateCardStatus } from '@/lib/actions/card-actions'
import { createCard } from './kanban-actions'
import { createClient } from '@/lib/supabase/client'
import { LANES } from '@/lib/card-status'
import CloseSprintButton from '@/components/projects/CloseSprintButton'

interface FlatCard {
  id: string
  title: string
  slug: string
  status: string
  description: string | null
  epicName: string
  epicId: string
}

interface SprintData {
  id: string
  name: string
  goal: string | null
  epics: Array<{
    id: string
    name: string
    slug: string
    cards: Array<{
      id: string
      title: string
      slug: string
      status: string
      description: string | null
      assigned_agent_id: string | null
    }>
  }>
}

interface KanbanBoardProps {
  sprint: SprintData
  projectSlug: string
  tenantId: string
}

export default function KanbanBoard({ sprint, projectSlug, tenantId }: KanbanBoardProps) {
  const router = useRouter()
  const pendingCardIds = useRef<Set<string>>(new Set())

  // Flatten all cards from all epics, attaching epicName and epicId
  const initialCards: FlatCard[] = sprint.epics.flatMap((epic) =>
    epic.cards
      .filter((c) => c.status !== 'cancelled')
      .map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        status: c.status,
        description: c.description,
        epicName: epic.name,
        epicId: epic.id,
      })),
  )

  const [cards, setCards] = useState<FlatCard[]>(initialCards)
  const epicOptions = sprint.epics.map((e) => ({ id: e.id, name: e.name }))

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const epicIds = new Set(sprint.epics.map((e) => e.id))

    const channel = supabase
      .channel('cards-sprint-' + sprint.id)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const newRow = payload.new as Record<string, unknown> | null
          const oldRow = payload.old as Record<string, unknown> | null
          const cardId = (newRow?.id ?? oldRow?.id) as string | undefined
          if (!cardId) return

          // Suppress echo of our own optimistic updates
          if (pendingCardIds.current.has(cardId)) return

          // Only handle cards in this sprint's epics
          const epicId = (newRow?.epic_id ?? oldRow?.epic_id) as string | undefined
          if (!epicId || !epicIds.has(epicId)) return

          if (payload.eventType === 'UPDATE') {
            setCards((prev) =>
              prev.map((c) =>
                c.id === cardId
                  ? {
                      ...c,
                      status: (newRow?.status as string) ?? c.status,
                      title: (newRow?.title as string) ?? c.title,
                      description: (newRow?.description as string | null) ?? c.description,
                    }
                  : c,
              ),
            )
          } else if (payload.eventType === 'INSERT') {
            // Need epicName from server — refresh
            router.refresh()
          } else if (payload.eventType === 'DELETE') {
            setCards((prev) => prev.filter((c) => c.id !== cardId))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sprint.id, tenantId, sprint.epics, router])

  async function handleStatusChange(cardId: string, newStatus: string) {
    const prevCards = cards
    pendingCardIds.current.add(cardId)
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, status: newStatus } : c)))
    try {
      await updateCardStatus(cardId, newStatus)
    } catch {
      setCards(prevCards) // rollback on error
    } finally {
      pendingCardIds.current.delete(cardId)
    }
  }

  async function handleAddCard(title: string, epicId: string, laneStatus: string) {
    const result = await createCard({
      title,
      epicId,
      status: laneStatus,
      projectSlug,
    })
    if ('error' in result && result.error) {
      throw new Error(result.error)
    }
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Sprint header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div
            style={{
              fontFamily: 'var(--cc-font-data)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--cc-text)',
            }}
          >
            {sprint.name}
          </div>
          {sprint.goal && (
            <div
              style={{
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '12px',
                color: 'var(--cc-text-dim)',
              }}
            >
              {sprint.goal}
            </div>
          )}
        </div>
        <CloseSprintButton
          sprintId={sprint.id}
          sprintName={sprint.name}
          projectSlug={projectSlug}
        />
      </div>

      {/* Lane grid */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          overflowX: 'auto',
        }}
      >
        {LANES.map((lane) => {
          // Blocked cards show in draft lane
          const laneCards = cards.filter((c) => {
            if (c.status === 'blocked') return lane === 'draft'
            return c.status === lane
          })

          return (
            <KanbanLane
              key={lane}
              status={lane}
              cards={laneCards}
              epicOptions={epicOptions}
              projectSlug={projectSlug}
              onStatusChange={handleStatusChange}
              onAddCard={handleAddCard}
            />
          )
        })}
      </div>
    </div>
  )
}
