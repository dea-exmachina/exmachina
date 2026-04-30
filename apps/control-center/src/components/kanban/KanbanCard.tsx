'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LANES, statusColor, statusLabel } from '@/lib/card-status'

interface KanbanCardProps {
  card: {
    id: string
    title: string
    slug: string
    status: string
    description: string | null
    epicName: string
  }
  projectSlug: string
  onStatusChange: (cardId: string, newStatus: string) => void
}

export default function KanbanCard({ card, projectSlug, onStatusChange }: KanbanCardProps) {
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [badgeEditing, setBadgeEditing] = useState(false)

  const color = statusColor(card.status)
  const isBlocked = card.status === 'blocked'

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('cardId', card.id)
        e.dataTransfer.effectAllowed = 'move'
        setDragging(true)
      }}
      onDragEnd={() => setDragging(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--cc-surface)',
        border: `1px solid ${hovered && !dragging ? 'var(--cc-accent-dim)' : 'var(--cc-border)'}`,
        borderRadius: 'var(--cc-radius)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        cursor: dragging ? 'grabbing' : 'grab',
        opacity: dragging ? 0.5 : 1,
        transition: 'border-color 120ms ease, opacity 120ms ease',
        userSelect: 'none',
      }}
    >
      {/* Blocked indicator */}
      {isBlocked && (
        <div
          style={{
            fontFamily: 'var(--cc-font-data)',
            fontSize: '10px',
            color: 'var(--cc-red)',
            letterSpacing: '0.04em',
          }}
        >
          ⚠ blocked
        </div>
      )}

      {/* Title — links to card detail, not draggable */}
      <Link
        href={`/projects/${projectSlug}/cards/${card.id}`}
        draggable={false}
        onClick={(e) => e.stopPropagation()}
        style={{
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '13px',
          color: 'var(--cc-text)',
          lineHeight: '1.35',
          textDecoration: 'none',
        }}
      >
        {card.title}
      </Link>

      {/* Footer row: epic name + status badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginTop: '2px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '11px',
            color: 'var(--cc-text-dim)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {card.epicName}
        </div>

        {/* Status badge — click to open select */}
        {badgeEditing ? (
          <select
            autoFocus
            value={card.status}
            onBlur={() => setBadgeEditing(false)}
            onChange={(e) => {
              onStatusChange(card.id, e.target.value)
              setBadgeEditing(false)
            }}
            style={{
              fontFamily: 'var(--cc-font-data)',
              fontSize: '10px',
              background: 'var(--cc-surface2)',
              color: 'var(--cc-text)',
              border: '1px solid var(--cc-border)',
              borderRadius: 'var(--cc-radius)',
              padding: '2px 4px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {LANES.map((lane) => (
              <option key={lane} value={lane}>
                {statusLabel(lane)}
              </option>
            ))}
            <option value="blocked">blocked</option>
          </select>
        ) : (
          <button
            onClick={() => setBadgeEditing(true)}
            title="Change status"
            style={{
              fontFamily: 'var(--cc-font-data)',
              fontSize: '10px',
              color: color,
              background: `color-mix(in srgb, ${color} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
              borderRadius: 'var(--cc-radius)',
              padding: '2px 6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              lineHeight: '1.4',
            }}
          >
            {isBlocked ? 'blocked' : statusLabel(card.status)}
          </button>
        )}
      </div>
    </div>
  )
}
