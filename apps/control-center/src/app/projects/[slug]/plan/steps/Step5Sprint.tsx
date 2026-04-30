'use client'

import { useState } from 'react'

interface SprintData {
  name: string
  goal: string
  startsAt?: string
  endsAt?: string
}

interface Props {
  onNext: (sprint: SprintData) => void
}

export default function Step5Sprint({ onNext }: Props) {
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    if (!name.trim()) {
      setError('Sprint name is required.')
      return
    }
    if (!goal.trim()) {
      setError('Sprint goal is required.')
      return
    }
    setError(null)
    onNext({
      name: name.trim(),
      goal: goal.trim(),
      startsAt: startsAt || undefined,
      endsAt: endsAt || undefined,
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--cc-surface)',
    border: '1px solid var(--cc-border)',
    borderRadius: 'var(--cc-radius)',
    padding: '8px 10px',
    fontFamily: 'var(--cc-font-ui)',
    fontSize: '13px',
    color: 'var(--cc-text)',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    color: 'var(--cc-text-dim)',
    fontSize: '12px',
    fontFamily: 'var(--cc-font-ui)',
    display: 'block',
    marginBottom: '4px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '560px' }}>
      <div style={{ fontFamily: 'var(--cc-font-ui)', fontSize: '13px', fontWeight: 500, color: 'var(--cc-text)' }}>
        First sprint
      </div>

      <div>
        <label htmlFor="sprint-name" style={labelStyle}>Sprint name</label>
        <input
          id="sprint-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sprint 1 — Foundation"
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="sprint-goal" style={labelStyle}>Sprint goal</label>
        <input
          id="sprint-goal"
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. Ship auth and the core data model."
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="sprint-starts" style={labelStyle}>Start date (optional)</label>
          <input
            id="sprint-starts"
            type="date"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="sprint-ends" style={labelStyle}>End date (optional)</label>
          <input
            id="sprint-ends"
            type="date"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {error && (
        <div style={{ color: 'var(--cc-red)', fontSize: '12px' }}>{error}</div>
      )}

      <button
        onClick={handleSubmit}
        style={{
          background: 'var(--cc-accent)',
          color: '#060911',
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '12px',
          fontWeight: 600,
          padding: '7px 14px',
          borderRadius: 'var(--cc-radius)',
          border: 'none',
          cursor: 'pointer',
          alignSelf: 'flex-start',
        }}
      >
        Continue →
      </button>
    </div>
  )
}
