'use client'

import { useState } from 'react'
import { saveStep1 } from '../actions'

interface Props {
  project: {
    id: string
    slug: string
    mission: string | null
  }
  onNext: () => void
}

export default function Step1GuidingStar({ project, onNext }: Props) {
  const [mission, setMission] = useState(project.mission ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    const result = await saveStep1(project.slug, mission)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onNext()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '560px' }}>
      <div>
        <div style={{ fontFamily: 'var(--cc-font-ui)', fontSize: '13px', fontWeight: 500, color: 'var(--cc-text)', marginBottom: '4px' }}>
          Guiding star
        </div>
        <label
          htmlFor="mission"
          style={{ color: 'var(--cc-text-dim)', fontSize: '12px', fontFamily: 'var(--cc-font-ui)', display: 'block', marginBottom: '6px' }}
        >
          Write one sentence that defines what this project is here to do. This becomes the anchor for every decision.
        </label>
        <textarea
          id="mission"
          rows={3}
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          placeholder="e.g. Ship a self-serve dashboard so customers can manage their own billing."
          style={{
            width: '100%',
            background: 'var(--cc-surface)',
            border: '1px solid var(--cc-border)',
            borderRadius: 'var(--cc-radius)',
            padding: '8px 10px',
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '13px',
            color: 'var(--cc-text)',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {error && (
        <div style={{ color: 'var(--cc-red)', fontSize: '12px' }}>{error}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || mission.trim().length === 0}
        style={{
          background: 'var(--cc-accent)',
          color: '#060911',
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '12px',
          fontWeight: 600,
          padding: '7px 14px',
          borderRadius: 'var(--cc-radius)',
          border: 'none',
          cursor: loading || mission.trim().length === 0 ? 'not-allowed' : 'pointer',
          alignSelf: 'flex-start',
          opacity: loading || mission.trim().length === 0 ? 0.6 : 1,
        }}
      >
        {loading ? 'Saving…' : 'Continue →'}
      </button>
    </div>
  )
}
