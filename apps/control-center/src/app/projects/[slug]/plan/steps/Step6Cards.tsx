'use client'

import { useState } from 'react'

interface CardRow {
  localId: string
  title: string
}

interface EpicRow {
  localId: string
  name: string
  cards: CardRow[]
}

interface Props {
  onNext: (epics: Array<{ name: string; cards: Array<{ title: string }> }>) => void
}

function newCard(): CardRow {
  return { localId: crypto.randomUUID(), title: '' }
}

function newEpic(): EpicRow {
  return { localId: crypto.randomUUID(), name: '', cards: [newCard()] }
}

export default function Step6Cards({ onNext }: Props) {
  const [epics, setEpics] = useState<EpicRow[]>([newEpic()])
  const [error, setError] = useState<string | null>(null)

  function addEpic() {
    setEpics((prev) => [...prev, newEpic()])
  }

  function removeEpic(epicId: string) {
    setEpics((prev) => prev.filter((e) => e.localId !== epicId))
  }

  function updateEpicName(epicId: string, name: string) {
    setEpics((prev) =>
      prev.map((e) => (e.localId === epicId ? { ...e, name } : e))
    )
  }

  function addCard(epicId: string) {
    setEpics((prev) =>
      prev.map((e) =>
        e.localId === epicId ? { ...e, cards: [...e.cards, newCard()] } : e
      )
    )
  }

  function removeCard(epicId: string, cardId: string) {
    setEpics((prev) =>
      prev.map((e) =>
        e.localId === epicId
          ? { ...e, cards: e.cards.filter((c) => c.localId !== cardId) }
          : e
      )
    )
  }

  function updateCard(epicId: string, cardId: string, title: string) {
    setEpics((prev) =>
      prev.map((e) =>
        e.localId === epicId
          ? {
              ...e,
              cards: e.cards.map((c) =>
                c.localId === cardId ? { ...c, title } : c
              ),
            }
          : e
      )
    )
  }

  function handleSubmit() {
    const filled = epics.filter((e) => e.name.trim().length > 0)
    if (filled.length === 0) {
      setError('Add at least one epic with a name.')
      return
    }
    setError(null)
    onNext(
      filled.map((e) => ({
        name: e.name.trim(),
        cards: e.cards
          .filter((c) => c.title.trim().length > 0)
          .map((c) => ({ title: c.title.trim() })),
      }))
    )
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--cc-surface)',
    border: '1px solid var(--cc-border)',
    borderRadius: 'var(--cc-radius)',
    padding: '8px 10px',
    fontFamily: 'var(--cc-font-ui)',
    fontSize: '13px',
    color: 'var(--cc-text)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '560px' }}>
      <div style={{ fontFamily: 'var(--cc-font-ui)', fontSize: '13px', fontWeight: 500, color: 'var(--cc-text)' }}>
        Epics & cards
      </div>

      {epics.map((epic, epicIdx) => (
        <div
          key={epic.localId}
          style={{
            border: '1px solid var(--cc-border)',
            borderRadius: 'var(--cc-radius)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--cc-font-data)', fontSize: '10px', color: 'var(--cc-text-dim)', flexShrink: 0 }}>
              EPIC {epicIdx + 1}
            </span>
            <input
              type="text"
              value={epic.name}
              onChange={(e) => updateEpicName(epic.localId, e.target.value)}
              placeholder="Epic name"
              style={{ ...inputStyle, flex: 1 }}
            />
            {epics.length > 1 && (
              <button
                onClick={() => removeEpic(epic.localId)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--cc-text-dim)',
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '8px' }}>
            {epic.cards.map((card) => (
              <div key={card.localId} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: 'var(--cc-text-dim)', fontSize: '11px', flexShrink: 0 }}>—</span>
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => updateCard(epic.localId, card.localId, e.target.value)}
                  placeholder="Card title"
                  style={{ ...inputStyle, flex: 1, fontSize: '12px', padding: '6px 8px' }}
                />
                {epic.cards.length > 1 && (
                  <button
                    onClick={() => removeCard(epic.localId, card.localId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--cc-text-dim)',
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
            <button
              onClick={() => addCard(epic.localId)}
              style={{
                background: 'none',
                border: '1px dashed var(--cc-border)',
                borderRadius: 'var(--cc-radius)',
                color: 'var(--cc-text-dim)',
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '11px',
                cursor: 'pointer',
                padding: '4px 8px',
                marginTop: '2px',
                alignSelf: 'flex-start',
              }}
            >
              + Add card
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addEpic}
        style={{
          background: 'none',
          border: '1px dashed var(--cc-border)',
          borderRadius: 'var(--cc-radius)',
          color: 'var(--cc-text-dim)',
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '12px',
          cursor: 'pointer',
          padding: '8px 12px',
        }}
      >
        + Add epic
      </button>

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
