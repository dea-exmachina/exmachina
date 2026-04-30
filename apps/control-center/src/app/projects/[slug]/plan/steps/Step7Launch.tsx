'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { launchProject } from '../actions'
import type { Json } from '@/types/database'

interface SprintData {
  name: string
  goal: string
  startsAt?: string
  endsAt?: string
}

interface EpicData {
  name: string
  cards: Array<{ title: string }>
}

interface Props {
  project: {
    id: string
    slug: string
    name: string
    mission: string | null
    goals: Json | null
    stack_context: string | null
  }
  sprint: SprintData
  epics: EpicData[]
}

function parseGoals(raw: Json | null): Array<{ id: string; text: string }> {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (g): g is { id: string; text: string } =>
      typeof g === 'object' &&
      g !== null &&
      'id' in g &&
      'text' in g &&
      typeof (g as Record<string, unknown>).id === 'string' &&
      typeof (g as Record<string, unknown>).text === 'string'
  )
}

export default function Step7Launch({ project, sprint, epics }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [launched, setLaunched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vaultWarning, setVaultWarning] = useState<string | null>(null)

  const goals = parseGoals(project.goals)

  async function handleLaunch() {
    if (loading || launched) return
    setLoading(true)
    setError(null)

    const result = await launchProject(project.slug, { sprint, epics })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result.vaultWarning) {
      setVaultWarning(result.vaultWarning)
    }

    setLaunched(true)

    if (result.redirect) {
      router.push(result.redirect)
    }
  }

  const sectionHeadingStyle: React.CSSProperties = {
    fontFamily: 'var(--cc-font-ui)',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--cc-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '6px',
  }

  const dividerStyle: React.CSSProperties = {
    borderTop: '1px solid var(--cc-border)',
    margin: '4px 0',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '560px' }}>
      <div style={{ fontFamily: 'var(--cc-font-ui)', fontSize: '13px', fontWeight: 500, color: 'var(--cc-text)' }}>
        Review & launch
      </div>

      {/* Mission */}
      <div>
        <div style={sectionHeadingStyle}>Mission</div>
        <div style={{ fontFamily: 'var(--cc-font-ui)', fontSize: '13px', color: 'var(--cc-text)' }}>
          {project.mission ?? <span style={{ color: 'var(--cc-text-dim)' }}>(not set)</span>}
        </div>
      </div>

      <div style={dividerStyle} />

      {/* Goals */}
      <div>
        <div style={sectionHeadingStyle}>Goals</div>
        {goals.length > 0 ? (
          <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {goals.map((g) => (
              <li key={g.id} style={{ fontFamily: 'var(--cc-font-ui)', fontSize: '13px', color: 'var(--cc-text)' }}>
                {g.text}
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ color: 'var(--cc-text-dim)', fontSize: '12px', fontFamily: 'var(--cc-font-ui)' }}>(none set)</div>
        )}
      </div>

      <div style={dividerStyle} />

      {/* Sprint */}
      <div>
        <div style={sectionHeadingStyle}>First sprint</div>
        <div style={{ fontFamily: 'var(--cc-font-ui)', fontSize: '13px', color: 'var(--cc-text)', marginBottom: '4px' }}>
          <strong>{sprint.name || <span style={{ color: 'var(--cc-text-dim)' }}>(unnamed)</span>}</strong>
        </div>
        <div style={{ fontFamily: 'var(--cc-font-ui)', fontSize: '12px', color: 'var(--cc-text-dim)', marginBottom: '4px' }}>
          {sprint.goal || '(no goal)'}
        </div>
        {(sprint.startsAt || sprint.endsAt) && (
          <div style={{ fontFamily: 'var(--cc-font-data)', fontSize: '11px', color: 'var(--cc-text-dim)' }}>
            {sprint.startsAt ?? '?'} → {sprint.endsAt ?? '?'}
          </div>
        )}
      </div>

      <div style={dividerStyle} />

      {/* Epics & Cards */}
      <div>
        <div style={sectionHeadingStyle}>Epics & cards</div>
        {epics.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {epics.map((epic, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'var(--cc-font-ui)', fontSize: '12px', fontWeight: 600, color: 'var(--cc-text)', marginBottom: '4px' }}>
                  {epic.name || `Epic ${i + 1}`}
                </div>
                {epic.cards.length > 0 ? (
                  <ul style={{ margin: 0, padding: '0 0 0 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {epic.cards.map((card, j) => (
                      <li key={j} style={{ fontFamily: 'var(--cc-font-ui)', fontSize: '12px', color: 'var(--cc-text-dim)' }}>
                        {card.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--cc-text-dim)', fontFamily: 'var(--cc-font-ui)' }}>(no cards)</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--cc-text-dim)', fontSize: '12px', fontFamily: 'var(--cc-font-ui)' }}>(no epics)</div>
        )}
      </div>

      <div style={dividerStyle} />

      {/* Vault warning */}
      {vaultWarning && (
        <div style={{
          border: '1px solid color-mix(in srgb, var(--cc-accent) 25%, transparent)',
          background: 'color-mix(in srgb, var(--cc-accent) 10%, transparent)',
          borderRadius: 'var(--cc-radius)',
          padding: '10px 14px',
          fontSize: '12px',
          fontFamily: 'var(--cc-font-ui)',
          color: 'var(--cc-text)',
        }}>
          {vaultWarning}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ color: 'var(--cc-red)', fontSize: '12px' }}>{error}</div>
      )}

      {/* Launch button */}
      <button
        onClick={handleLaunch}
        disabled={loading || launched}
        style={{
          background: 'var(--cc-accent)',
          color: '#060911',
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '12px',
          fontWeight: 600,
          padding: '7px 14px',
          borderRadius: 'var(--cc-radius)',
          border: 'none',
          cursor: loading || launched ? 'not-allowed' : 'pointer',
          alignSelf: 'flex-start',
          opacity: loading || launched ? 0.6 : 1,
        }}
      >
        {loading ? 'Launching…' : launched ? 'Launched' : 'Launch →'}
      </button>
    </div>
  )
}
