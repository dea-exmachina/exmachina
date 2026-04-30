'use client'

import { useState } from 'react'
import { saveStep2 } from '../actions'
import type { Json } from '@/types/database'

interface GoalRow {
  id: string
  text: string
}

interface Props {
  project: {
    id: string
    slug: string
    goals: Json | null
  }
  onNext: () => void
}

function parseGoals(raw: Json | null): GoalRow[] {
  if (!Array.isArray(raw)) return [{ id: crypto.randomUUID(), text: '' }]
  const valid = raw.filter(
    (g): g is { id: string; text: string } =>
      typeof g === 'object' &&
      g !== null &&
      'id' in g &&
      'text' in g &&
      typeof (g as Record<string, unknown>).id === 'string' &&
      typeof (g as Record<string, unknown>).text === 'string'
  )
  if (valid.length === 0) return [{ id: crypto.randomUUID(), text: '' }]
  return valid
}

export default function Step2Goals({ project, onNext }: Props) {
  const [goals, setGoals] = useState<GoalRow[]>(parseGoals(project.goals))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addGoal() {
    if (goals.length >= 3) return
    setGoals((prev) => [...prev, { id: crypto.randomUUID(), text: '' }])
  }

  function removeGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  function updateGoal(id: string, text: string) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, text } : g)))
  }

  async function handleSubmit() {
    const filled = goals.filter((g) => g.text.trim().length > 0)
    if (filled.length === 0) {
      setError('Add at least one goal.')
      return
    }
    setLoading(true)
    setError(null)
    const result = await saveStep2(project.slug, filled)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onNext()
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: 'var(--cc-surface)',
    border: '1px solid var(--cc-border)',
    borderRadius: 'var(--cc-radius)',
    padding: '8px 10px',
    fontFamily: 'var(--cc-font-ui)',
    fontSize: '13px',
    color: 'var(--cc-text)',
    outline: 'none',
    minWidth: 0,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '560px' }}>
      <div>
        <div style={{ fontFamily: 'var(--cc-font-ui)', fontSize: '13px', fontWeight: 500, color: 'var(--cc-text)', marginBottom: '4px' }}>
          Goals
        </div>
        <div style={{ color: 'var(--cc-text-dim)', fontSize: '12px', fontFamily: 'var(--cc-font-ui)', marginBottom: '10px' }}>
          Up to 3 concrete outcomes this project must deliver.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {goals.map((goal, idx) => (
            <div key={goal.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--cc-font-data)', fontSize: '11px', color: 'var(--cc-text-dim)', width: '16px', flexShrink: 0 }}>
                {idx + 1}
              </span>
              <input
                type="text"
                value={goal.text}
                onChange={(e) => updateGoal(goal.id, e.target.value)}
                placeholder="Goal description"
                style={inputStyle}
              />
              {goals.length > 1 && (
                <button
                  onClick={() => removeGoal(goal.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--cc-text-dim)',
                    fontFamily: 'var(--cc-font-ui)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    padding: '0 4px',
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {goals.length < 3 && (
          <button
            onClick={addGoal}
            style={{
              background: 'none',
              border: '1px dashed var(--cc-border)',
              borderRadius: 'var(--cc-radius)',
              color: 'var(--cc-text-dim)',
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '12px',
              cursor: 'pointer',
              padding: '6px 12px',
              marginTop: '8px',
              width: '100%',
            }}
          >
            + Add goal
          </button>
        )}
      </div>

      {error && (
        <div style={{ color: 'var(--cc-red)', fontSize: '12px' }}>{error}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          background: 'var(--cc-accent)',
          color: '#060911',
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '12px',
          fontWeight: 600,
          padding: '7px 14px',
          borderRadius: 'var(--cc-radius)',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          alignSelf: 'flex-start',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Saving…' : 'Continue →'}
      </button>
    </div>
  )
}
