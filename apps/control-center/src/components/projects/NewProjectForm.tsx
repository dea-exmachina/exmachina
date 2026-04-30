'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProjectForm() {
  const [name, setName] = useState('')
  const [mission, setMission] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => { nameRef.current?.focus() }, [])

  async function submit(startPlanning: boolean) {
    if (!name.trim()) { setError('Project name is required'); return }
    setLoading(true)
    setError(null)

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), mission: mission.trim() }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    router.push(startPlanning ? `/projects/${json.slug}/plan` : `/projects/${json.slug}`)
  }

  return (
    <div style={{ maxWidth: '560px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          fontFamily: 'var(--cc-font-data)',
          fontSize: '10px',
          color: 'var(--cc-text-dim)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}>
          New project
        </div>
        <h1 style={{
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--cc-text)',
          margin: 0,
        }}>
          What are you building?
        </h1>
      </div>

      {/* Form card */}
      <div style={{
        background: 'var(--cc-surface)',
        border: '1px solid var(--cc-border)',
        borderRadius: 'var(--cc-radius)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        {/* Name */}
        <div>
          <label style={labelStyle}>Project name</label>
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit(false)}
            placeholder="J-O-B, exmachina CC, weekend project…"
            style={inputStyle}
          />
        </div>

        {/* Mission */}
        <div>
          <label style={labelStyle}>
            Mission <span style={{ color: 'var(--cc-text-dim)', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            type="text"
            value={mission}
            onChange={e => setMission(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit(false)}
            placeholder="One sentence on what this is and why it matters"
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '12px',
            color: 'var(--cc-red)',
            padding: '8px 10px',
            background: 'rgba(179,64,64,0.10)',
            border: '1px solid rgba(179,64,64,0.25)',
            borderRadius: 'var(--cc-radius)',
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
          <button
            onClick={() => submit(false)}
            disabled={loading}
            style={secondaryBtnStyle}
          >
            Save as placeholder
          </button>
          <button
            onClick={() => submit(true)}
            disabled={loading}
            style={primaryBtnStyle}
          >
            Start planning →
          </button>
        </div>

        <p style={{
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '11px',
          color: 'var(--cc-text-dim)',
          margin: 0,
        }}>
          Placeholder creates the project and holds your spot. You can start the planning session any time.
        </p>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--cc-font-ui)',
  fontSize: '12px',
  fontWeight: 500,
  color: 'var(--cc-text)',
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--cc-surface2)',
  border: '1px solid var(--cc-border)',
  borderRadius: 'var(--cc-radius)',
  padding: '9px 12px',
  fontFamily: 'var(--cc-font-ui)',
  fontSize: '13px',
  color: 'var(--cc-text)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 100ms',
}

const primaryBtnStyle: React.CSSProperties = {
  flex: 1,
  background: 'var(--cc-accent)',
  color: '#060911',
  fontFamily: 'var(--cc-font-ui)',
  fontSize: '13px',
  fontWeight: 600,
  padding: '10px 16px',
  border: 'none',
  borderRadius: 'var(--cc-radius)',
  cursor: 'pointer',
}

const secondaryBtnStyle: React.CSSProperties = {
  flex: 1,
  background: 'transparent',
  color: 'var(--cc-text)',
  fontFamily: 'var(--cc-font-ui)',
  fontSize: '13px',
  fontWeight: 500,
  padding: '10px 16px',
  border: '1px solid var(--cc-border)',
  borderRadius: 'var(--cc-radius)',
  cursor: 'pointer',
}
