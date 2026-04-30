'use client'

import { useState } from 'react'
import { saveStep3 } from '../actions'

interface Props {
  project: {
    id: string
    slug: string
    stack_context: string | null
  }
  onNext: () => void
}

export default function Step3Stack({ project, onNext }: Props) {
  const [stackContext, setStackContext] = useState(project.stack_context ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    const result = await saveStep3(project.slug, stackContext)
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
          Stack & context
        </div>
        <label
          htmlFor="stack"
          style={{ color: 'var(--cc-text-dim)', fontSize: '12px', fontFamily: 'var(--cc-font-ui)', display: 'block', marginBottom: '6px' }}
        >
          Describe the tech stack, architecture decisions, constraints, and any context agents need to do good work.
        </label>
        <textarea
          id="stack"
          rows={8}
          value={stackContext}
          onChange={(e) => setStackContext(e.target.value)}
          placeholder="e.g. Next.js 15 App Router, Supabase (Postgres + RLS), TypeScript strict, deployed on Vercel. No external auth provider — using Supabase Auth. Monorepo with pnpm workspaces."
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
