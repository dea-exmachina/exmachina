'use client'

import { useState } from 'react'
import { createCouncilReview, recordDecision } from '@/app/projects/[slug]/council/actions'

interface ConveneFormProps {
  projectSlug: string
}

export function ConveneForm({ projectSlug }: ConveneFormProps) {
  const [open, setOpen] = useState(false)
  const [trigger, setTrigger] = useState<'pre-decision' | 'post-epic'>('pre-decision')
  const [synthesis, setSynthesis] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vaultWarning, setVaultWarning] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await createCouncilReview(projectSlug, trigger, synthesis)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.vaultWarning) setVaultWarning(result.vaultWarning)
    setOpen(false)
    setSynthesis('')
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '12px',
          fontWeight: 600,
          color: '#060911',
          background: 'var(--cc-accent)',
          border: 'none',
          borderRadius: 'var(--cc-radius)',
          padding: '7px 14px',
          cursor: 'pointer',
          alignSelf: 'flex-start',
        }}
      >
        Convene review
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {vaultWarning && (
        <div
          style={{
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '12px',
            color: 'var(--cc-yellow)',
            background: 'rgba(212,200,10,0.06)',
            border: '1px solid rgba(212,200,10,0.2)',
            borderRadius: 'var(--cc-radius)',
            padding: '8px 12px',
          }}
        >
          ⚠ {vaultWarning}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'var(--cc-surface)',
          border: '1px solid var(--cc-border)',
          borderRadius: 'var(--cc-radius)',
          padding: '16px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--cc-text)',
          }}
        >
          Convene review
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
            Trigger type
          </label>
          <select
            value={trigger}
            onChange={(e) => setTrigger(e.target.value as 'pre-decision' | 'post-epic')}
            disabled={submitting}
            style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '12px',
              color: 'var(--cc-text)',
              background: 'var(--cc-surface2)',
              border: '1px solid var(--cc-border)',
              borderRadius: 'var(--cc-radius)',
              padding: '6px 8px',
              outline: 'none',
            }}
          >
            <option value="pre-decision">Pre-decision</option>
            <option value="post-epic">Post-epic</option>
          </select>
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
            Context
          </label>
          <textarea
            rows={3}
            placeholder="What decision or review is this for?"
            value={synthesis}
            onChange={(e) => setSynthesis(e.target.value)}
            disabled={submitting}
            style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '12px',
              color: 'var(--cc-text)',
              background: 'var(--cc-surface2)',
              border: '1px solid var(--cc-border)',
              borderRadius: 'var(--cc-radius)',
              padding: '7px 10px',
              outline: 'none',
              resize: 'vertical',
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

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#060911',
              background: submitting ? 'var(--cc-accent-dim)' : 'var(--cc-accent)',
              border: 'none',
              borderRadius: 'var(--cc-radius)',
              padding: '6px 14px',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Convening…' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setSynthesis('')
              setError(null)
            }}
            disabled={submitting}
            style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '12px',
              color: 'var(--cc-text-dim)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

interface RecordDecisionFormProps {
  reviewId: string
  projectSlug: string
}

export function RecordDecisionForm({ reviewId, projectSlug }: RecordDecisionFormProps) {
  const [decision, setDecision] = useState<'approve' | 'modify' | 'reject'>('approve')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await recordDecision(projectSlug, reviewId, decision, notes)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div
        style={{
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '12px',
          color: 'var(--cc-green)',
        }}
      >
        Decision recorded.
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '12px',
        background: 'var(--cc-surface2)',
        border: '1px solid var(--cc-border)',
        borderRadius: 'var(--cc-radius)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--cc-font-data)',
          fontSize: '10px',
          fontWeight: 500,
          color: 'var(--cc-text-dim)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        Record decision
      </div>

      <select
        value={decision}
        onChange={(e) => setDecision(e.target.value as 'approve' | 'modify' | 'reject')}
        disabled={submitting}
        style={{
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '12px',
          color: 'var(--cc-text)',
          background: 'var(--cc-surface)',
          border: '1px solid var(--cc-border)',
          borderRadius: 'var(--cc-radius)',
          padding: '5px 8px',
          outline: 'none',
        }}
      >
        <option value="approve">Approve</option>
        <option value="modify">Modify</option>
        <option value="reject">Reject</option>
      </select>

      <textarea
        rows={2}
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={submitting}
        style={{
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '12px',
          color: 'var(--cc-text)',
          background: 'var(--cc-surface)',
          border: '1px solid var(--cc-border)',
          borderRadius: 'var(--cc-radius)',
          padding: '6px 8px',
          outline: 'none',
          resize: 'vertical',
        }}
      />

      {error && (
        <div style={{ fontFamily: 'var(--cc-font-ui)', fontSize: '11px', color: 'var(--cc-red)' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '11px',
          fontWeight: 600,
          color: '#060911',
          background: submitting ? 'var(--cc-accent-dim)' : 'var(--cc-accent)',
          border: 'none',
          borderRadius: 'var(--cc-radius)',
          padding: '5px 12px',
          cursor: submitting ? 'not-allowed' : 'pointer',
          alignSelf: 'flex-start',
        }}
      >
        {submitting ? 'Saving…' : 'Record decision'}
      </button>
    </form>
  )
}
