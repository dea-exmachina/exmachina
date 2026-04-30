'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { closeSprint } from '@/app/projects/[slug]/actions'

interface CloseSprintButtonProps {
  sprintId: string
  sprintName: string
  projectSlug: string
}

export default function CloseSprintButton({
  sprintId,
  sprintName,
  projectSlug,
}: CloseSprintButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClose() {
    setLoading(true)
    setError(null)
    const result = await closeSprint(projectSlug, sprintId)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      setConfirming(false)
      return
    }
    router.refresh()
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '12px',
            color: 'var(--cc-text-dim)',
          }}
        >
          Close &ldquo;{sprintName}&rdquo;?
        </span>
        <button
          onClick={handleClose}
          disabled={loading}
          style={{
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '12px',
            fontWeight: 600,
            color: '#060911',
            background: 'var(--cc-accent)',
            border: 'none',
            borderRadius: 'var(--cc-radius)',
            padding: '4px 10px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Closing…' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          style={{
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '12px',
            color: 'var(--cc-text-dim)',
            background: 'none',
            border: '1px solid var(--cc-border)',
            borderRadius: 'var(--cc-radius)',
            padding: '4px 10px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        {error && (
          <span
            style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '12px',
              color: '#e05c5c',
            }}
          >
            {error}
          </span>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        fontFamily: 'var(--cc-font-ui)',
        fontSize: '12px',
        color: 'var(--cc-text-dim)',
        background: 'none',
        border: '1px solid var(--cc-border)',
        borderRadius: 'var(--cc-radius)',
        padding: '4px 10px',
        cursor: 'pointer',
      }}
    >
      Close sprint
    </button>
  )
}
