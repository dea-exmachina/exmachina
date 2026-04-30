'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { statusColor, statusLabel, VALID_STATUSES } from '@/lib/card-status'
import { updateCard, updateCardStatus } from '@/lib/actions/card-actions'

interface Agent {
  id: string
  name: string
  role: string
}

interface CardDetailProps {
  card: {
    id: string
    title: string
    description: string | null
    slug: string
    status: string
    assigned_agent_id: string | null
    created_at: string
    updated_at: string
    epicName: string
    epicSlug: string
    sprintName: string
  }
  projectSlug: string
  projectName: string
  agents: Agent[]
}

export default function CardDetail({ card, projectSlug, projectName, agents }: CardDetailProps) {
  const router = useRouter()

  // Title edit
  const [titleEditing, setTitleEditing] = useState(false)
  const [titleValue, setTitleValue] = useState(card.title)
  const [titleSaving, setTitleSaving] = useState(false)

  // Description edit
  const [descEditing, setDescEditing] = useState(false)
  const [descValue, setDescValue] = useState(card.description ?? '')
  const [descSaving, setDescSaving] = useState(false)

  // Status
  const [statusEditing, setStatusEditing] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(card.status)

  // Agent
  const [agentSaving, setAgentSaving] = useState(false)
  const [currentAgentId, setCurrentAgentId] = useState(card.assigned_agent_id ?? '')

  const color = statusColor(currentStatus)

  async function saveTitle() {
    if (!titleValue.trim() || titleValue === card.title) {
      setTitleValue(card.title)
      setTitleEditing(false)
      return
    }
    setTitleSaving(true)
    await updateCard(card.id, { title: titleValue.trim() }, projectSlug)
    setTitleSaving(false)
    setTitleEditing(false)
    router.refresh()
  }

  async function saveDescription() {
    const newDesc = descValue.trim() || null
    if (newDesc === (card.description ?? null)) {
      setDescEditing(false)
      return
    }
    setDescSaving(true)
    await updateCard(card.id, { description: newDesc ?? undefined }, projectSlug)
    setDescSaving(false)
    setDescEditing(false)
    router.refresh()
  }

  async function handleStatusChange(newStatus: string) {
    setStatusEditing(false)
    if (newStatus === currentStatus) return
    const prev = currentStatus
    setCurrentStatus(newStatus)
    const result = await updateCardStatus(card.id, newStatus)
    if (result.error) setCurrentStatus(prev)
  }

  async function handleAgentChange(newAgentId: string) {
    const prev = currentAgentId
    setCurrentAgentId(newAgentId)
    setAgentSaving(true)
    const result = await updateCard(
      card.id,
      { assigned_agent_id: newAgentId || null },
      projectSlug,
    )
    if (result.error) setCurrentAgentId(prev)
    setAgentSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
      {/* Breadcrumb trail */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '12px',
          color: 'var(--cc-text-dim)',
        }}
      >
        <Link
          href={`/projects/${projectSlug}`}
          style={{ color: 'var(--cc-text-dim)', textDecoration: 'none' }}
        >
          {projectName}
        </Link>
        <span>/</span>
        <span>{card.epicName}</span>
        <span>/</span>
        <span style={{ color: 'var(--cc-text)' }}>{titleValue}</span>
      </div>

      {/* Card body */}
      <div
        style={{
          background: 'var(--cc-surface)',
          border: '1px solid var(--cc-border)',
          borderRadius: 'var(--cc-radius)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Title */}
        <div>
          {titleEditing ? (
            <input
              autoFocus
              value={titleValue}
              disabled={titleSaving}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitle()
                if (e.key === 'Escape') {
                  setTitleValue(card.title)
                  setTitleEditing(false)
                }
              }}
              style={{
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--cc-text)',
                background: 'var(--cc-surface2)',
                border: '1px solid var(--cc-accent-dim)',
                borderRadius: 'var(--cc-radius)',
                padding: '4px 8px',
                outline: 'none',
                width: '100%',
              }}
            />
          ) : (
            <div
              onClick={() => setTitleEditing(true)}
              title="Click to edit"
              style={{
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--cc-text)',
                cursor: 'text',
                borderRadius: 'var(--cc-radius)',
                padding: '4px 8px',
                marginLeft: '-8px',
                border: '1px solid transparent',
                transition: 'border-color 100ms',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--cc-border)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'
              }}
            >
              {titleValue}
            </div>
          )}
        </div>

        {/* Meta row: status + sprint + epic */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Status badge */}
          {statusEditing ? (
            <select
              autoFocus
              value={currentStatus}
              onBlur={() => setStatusEditing(false)}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{
                fontFamily: 'var(--cc-font-data)',
                fontSize: '11px',
                background: 'var(--cc-surface2)',
                color: 'var(--cc-text)',
                border: '1px solid var(--cc-border)',
                borderRadius: 'var(--cc-radius)',
                padding: '3px 6px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {VALID_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setStatusEditing(true)}
              title="Change status"
              style={{
                fontFamily: 'var(--cc-font-data)',
                fontSize: '11px',
                color: color,
                background: `color-mix(in srgb, ${color} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
                borderRadius: 'var(--cc-radius)',
                padding: '3px 8px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {statusLabel(currentStatus)}
            </button>
          )}

          <span
            style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '12px',
              color: 'var(--cc-text-dim)',
            }}
          >
            {card.sprintName}
          </span>
          <span
            style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '12px',
              color: 'var(--cc-text-dim)',
            }}
          >
            {card.epicName}
          </span>
        </div>

        {/* Description */}
        <div>
          <div
            style={{
              fontFamily: 'var(--cc-font-data)',
              fontSize: '10px',
              fontWeight: 500,
              color: 'var(--cc-text-dim)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Description
          </div>
          {descEditing ? (
            <textarea
              autoFocus
              value={descValue}
              disabled={descSaving}
              rows={6}
              onChange={(e) => setDescValue(e.target.value)}
              onBlur={saveDescription}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setDescValue(card.description ?? '')
                  setDescEditing(false)
                }
              }}
              style={{
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '13px',
                color: 'var(--cc-text)',
                background: 'var(--cc-surface2)',
                border: '1px solid var(--cc-accent-dim)',
                borderRadius: 'var(--cc-radius)',
                padding: '8px',
                outline: 'none',
                width: '100%',
                resize: 'vertical',
              }}
            />
          ) : (
            <div
              onClick={() => setDescEditing(true)}
              title="Click to edit"
              style={{
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '13px',
                color: descValue ? 'var(--cc-text)' : 'var(--cc-text-dim)',
                cursor: 'text',
                minHeight: '48px',
                padding: '8px',
                borderRadius: 'var(--cc-radius)',
                border: '1px solid transparent',
                whiteSpace: 'pre-wrap',
                transition: 'border-color 100ms',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--cc-border)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'
              }}
            >
              {descValue || 'Add a description…'}
            </div>
          )}
        </div>

        {/* Agent assignment */}
        {agents.length > 0 && (
          <div>
            <div
              style={{
                fontFamily: 'var(--cc-font-data)',
                fontSize: '10px',
                fontWeight: 500,
                color: 'var(--cc-text-dim)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Assigned agent
            </div>
            <select
              value={currentAgentId}
              disabled={agentSaving}
              onChange={(e) => handleAgentChange(e.target.value)}
              style={{
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '12px',
                color: 'var(--cc-text)',
                background: 'var(--cc-surface2)',
                border: '1px solid var(--cc-border)',
                borderRadius: 'var(--cc-radius)',
                padding: '5px 8px',
                outline: 'none',
                cursor: 'pointer',
                opacity: agentSaving ? 0.6 : 1,
              }}
            >
              <option value="">Unassigned</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.role}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Footer meta */}
      <div
        style={{
          fontFamily: 'var(--cc-font-data)',
          fontSize: '11px',
          color: 'var(--cc-text-dim)',
          display: 'flex',
          gap: '16px',
        }}
      >
        <span>created {new Date(card.created_at).toLocaleDateString()}</span>
        <span>updated {new Date(card.updated_at).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
