'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { startSprint } from '@/app/projects/[slug]/actions'

interface StartSprintFormProps {
  projectSlug: string
}

export default function StartSprintForm({ projectSlug }: StartSprintFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)
    const result = await startSprint(projectSlug, name, goal)
    if (result.error) {
      setError(
        result.error === 'active_sprint_exists'
          ? 'An active sprint already exists for this project.'
          : result.error,
      )
      setSubmitting(false)
      return
    }
    router.refresh()
  }

  return (
    <div
      style={{
        background: 'var(--cc-surface)',
        border: '1px solid var(--cc-border)',
        borderRadius: 'var(--cc-radius)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '480px',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--cc-text)',
            marginBottom: '4px',
          }}
        >
          No active sprint yet
        </div>
        <div
          style={{
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '12px',
            color: 'var(--cc-text-dim)',
          }}
        >
          Start a sprint to open the kanban board.
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontFamily: 'var(--cc-font-data)',
              fontSize: '10px',
              fontWeight: 500,
              color: 'var(--cc-text-dim)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Sprint name *
          </label>
          <input
            type="text"
            placeholder="Sprint 1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={submitting}
            style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '13px',
              color: 'var(--cc-text)',
              background: 'var(--cc-surface2)',
              border: '1px solid var(--cc-border)',
              borderRadius: 'var(--cc-radius)',
              padding: '7px 10px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontFamily: 'var(--cc-font-data)',
              fontSize: '10px',
              fontWeight: 500,
              color: 'var(--cc-text-dim)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Goal (optional)
          </label>
          <input
            type="text"
            placeholder="What does this sprint accomplish?"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={submitting}
            style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '13px',
              color: 'var(--cc-text)',
              background: 'var(--cc-surface2)',
              border: '1px solid var(--cc-border)',
              borderRadius: 'var(--cc-radius)',
              padding: '7px 10px',
              outline: 'none',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '12px',
              color: 'var(--cc-red)',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          style={{
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '12px',
            fontWeight: 600,
            color: '#060911',
            background: submitting || !name.trim() ? 'var(--cc-accent-dim)' : 'var(--cc-accent)',
            border: 'none',
            borderRadius: 'var(--cc-radius)',
            padding: '8px 16px',
            cursor: submitting || !name.trim() ? 'not-allowed' : 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          {submitting ? 'Starting…' : 'Start sprint'}
        </button>
      </form>
    </div>
  )
}
