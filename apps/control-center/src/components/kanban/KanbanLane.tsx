'use client'

import { useState } from 'react'
import KanbanCard from './KanbanCard'
import { statusLabel } from '@/lib/card-status'

interface CardData {
  id: string
  title: string
  slug: string
  status: string
  description: string | null
  epicName: string
}

interface KanbanLaneProps {
  status: string
  cards: CardData[]
  epicOptions: Array<{ id: string; name: string }>
  projectSlug: string
  onStatusChange: (cardId: string, newStatus: string) => void
  onAddCard: (title: string, epicId: string, laneStatus: string) => Promise<void>
}

export default function KanbanLane({
  status,
  cards,
  epicOptions,
  projectSlug,
  onStatusChange,
  onAddCard,
}: KanbanLaneProps) {
  const [showForm, setShowForm] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [title, setTitle] = useState('')
  const [epicId, setEpicId] = useState(epicOptions[0]?.id ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !epicId) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onAddCard(title.trim(), epicId, status)
      setTitle('')
      setEpicId(epicOptions[0]?.id ?? '')
      setShowForm(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add card')
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancel() {
    setShowForm(false)
    setTitle('')
    setEpicId(epicOptions[0]?.id ?? '')
    setFormError(null)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setDragOver(false)
        }
      }}
      onDrop={(e) => {
        e.preventDefault()
        const cardId = e.dataTransfer.getData('cardId')
        if (cardId) onStatusChange(cardId, status)
        setDragOver(false)
      }}
      style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        borderRadius: 'var(--cc-radius)',
        padding: '6px',
        margin: '-6px',
        background: dragOver ? 'rgba(212,132,10,0.04)' : 'transparent',
        border: dragOver ? '1px dashed var(--cc-accent-dim)' : '1px solid transparent',
        transition: 'background 100ms ease, border-color 100ms ease',
      }}
    >
      {/* Lane header */}
      <div
        style={{
          fontFamily: 'var(--cc-font-data)',
          fontSize: '10px',
          fontWeight: 500,
          color: 'var(--cc-text-dim)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          padding: '0 2px',
        }}
      >
        {statusLabel(status)}{' '}
        <span style={{ opacity: 0.6 }}>({cards.length})</span>
      </div>

      {/* Card list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            projectSlug={projectSlug}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      {/* New card form or button */}
      {showForm ? (
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '8px',
            background: 'var(--cc-surface)',
            border: '1px solid var(--cc-border)',
            borderRadius: 'var(--cc-radius)',
          }}
        >
          <input
            type="text"
            placeholder="Card title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            disabled={submitting}
            style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '12px',
              color: 'var(--cc-text)',
              background: 'var(--cc-surface2)',
              border: '1px solid var(--cc-border)',
              borderRadius: 'var(--cc-radius)',
              padding: '5px 8px',
              outline: 'none',
              width: '100%',
            }}
          />
          {epicOptions.length > 1 && (
            <select
              value={epicId}
              onChange={(e) => setEpicId(e.target.value)}
              disabled={submitting}
              style={{
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '11px',
                color: 'var(--cc-text)',
                background: 'var(--cc-surface2)',
                border: '1px solid var(--cc-border)',
                borderRadius: 'var(--cc-radius)',
                padding: '4px 6px',
                outline: 'none',
                width: '100%',
              }}
            >
              {epicOptions.map((epic) => (
                <option key={epic.id} value={epic.id}>
                  {epic.name}
                </option>
              ))}
            </select>
          )}
          {formError && (
            <div
              style={{
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '11px',
                color: 'var(--cc-red)',
              }}
            >
              {formError}
            </div>
          )}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !epicId}
              style={{
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '11px',
                fontWeight: 600,
                color: '#060911',
                background:
                  submitting || !title.trim() || !epicId
                    ? 'var(--cc-accent-dim)'
                    : 'var(--cc-accent)',
                border: 'none',
                borderRadius: 'var(--cc-radius)',
                padding: '4px 10px',
                cursor: submitting || !title.trim() || !epicId ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Adding…' : 'Add'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              style={{
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '11px',
                color: 'var(--cc-text-dim)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 6px',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => {
            if (epicOptions.length > 0) setEpicId(epicOptions[0].id)
            setShowForm(true)
          }}
          style={{
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '11px',
            color: 'var(--cc-text-dim)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            padding: '4px 2px',
            opacity: 0.6,
          }}
        >
          + New card
        </button>
      )}
    </div>
  )
}
