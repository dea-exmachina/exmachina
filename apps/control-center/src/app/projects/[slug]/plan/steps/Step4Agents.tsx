'use client'

import { useState } from 'react'
import { saveStep4 } from '../actions'

interface AgentRow {
  localId: string
  name: string
  role: string
}

interface Props {
  project: {
    id: string
    slug: string
  }
  onNext: () => void
}

export default function Step4Agents({ project, onNext }: Props) {
  const [agents, setAgents] = useState<AgentRow[]>([
    { localId: crypto.randomUUID(), name: '', role: '' },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addAgent() {
    setAgents((prev) => [...prev, { localId: crypto.randomUUID(), name: '', role: '' }])
  }

  function removeAgent(localId: string) {
    setAgents((prev) => prev.filter((a) => a.localId !== localId))
  }

  function updateAgent(localId: string, field: 'name' | 'role', value: string) {
    setAgents((prev) =>
      prev.map((a) => (a.localId === localId ? { ...a, [field]: value } : a))
    )
  }

  const filledAgents = agents.filter((a) => a.name.trim().length > 0 || a.role.trim().length > 0)
  const names = filledAgents.map((a) => a.name.trim().toLowerCase())
  const hasDuplicateName = names.some((n, i) => n.length > 0 && names.indexOf(n) !== i)

  async function handleSubmit() {
    const toSave = filledAgents
      .filter((a) => a.name.trim().length > 0 && a.role.trim().length > 0)

    setLoading(true)
    setError(null)
    const result = await saveStep4(project.slug, toSave.map((a) => ({ name: a.name.trim(), role: a.role.trim() })))
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
          Agents
        </div>
        <div style={{ color: 'var(--cc-text-dim)', fontSize: '12px', fontFamily: 'var(--cc-font-ui)', marginBottom: '10px' }}>
          Assign agent roles to this project. You can skip this and add agents later.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {agents.map((agent) => {
            const isDuplicate =
              agent.name.trim().length > 0 &&
              names.filter((n) => n === agent.name.trim().toLowerCase()).length > 1

            return (
              <div key={agent.localId} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={agent.name}
                    onChange={(e) => updateAgent(agent.localId, 'name', e.target.value)}
                    placeholder="Agent name"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={agent.role}
                    onChange={(e) => updateAgent(agent.localId, 'role', e.target.value)}
                    placeholder="Role / specialization"
                    style={inputStyle}
                  />
                  <button
                    onClick={() => removeAgent(agent.localId)}
                    disabled={agents.length === 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--cc-text-dim)',
                      fontFamily: 'var(--cc-font-ui)',
                      fontSize: '13px',
                      cursor: agents.length === 1 ? 'not-allowed' : 'pointer',
                      padding: '0 4px',
                      flexShrink: 0,
                      opacity: agents.length === 1 ? 0.3 : 1,
                    }}
                  >
                    ×
                  </button>
                </div>
                {isDuplicate && (
                  <div style={{
                    fontSize: '11px',
                    fontFamily: 'var(--cc-font-ui)',
                    color: 'var(--cc-accent)',
                    paddingLeft: '2px',
                  }}>
                    Duplicate agent name — only one will be saved.
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={addAgent}
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
          + Add agent
        </button>
      </div>

      {hasDuplicateName && (
        <div style={{
          border: '1px solid color-mix(in srgb, var(--cc-accent) 25%, transparent)',
          background: 'color-mix(in srgb, var(--cc-accent) 10%, transparent)',
          borderRadius: 'var(--cc-radius)',
          padding: '8px 12px',
          fontSize: '12px',
          fontFamily: 'var(--cc-font-ui)',
          color: 'var(--cc-text)',
        }}>
          Two or more agents share a display name. Rename to avoid confusion — only distinct names will be inserted.
        </div>
      )}

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
