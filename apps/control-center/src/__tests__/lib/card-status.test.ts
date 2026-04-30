import { describe, it, expect } from 'vitest'
import { isValidStatus, statusColor, statusLabel } from '@/lib/card-status'

describe('isValidStatus', () => {
  it("returns true for 'draft'", () => {
    expect(isValidStatus('draft')).toBe(true)
  })

  it("returns true for 'cancelled'", () => {
    expect(isValidStatus('cancelled')).toBe(true)
  })

  it("returns true for all lane statuses", () => {
    for (const s of ['ready', 'dispatched', 'in_review', 'closed', 'blocked']) {
      expect(isValidStatus(s)).toBe(true)
    }
  })

  it("returns false for an invalid status string", () => {
    expect(isValidStatus('invalid')).toBe(false)
  })

  it("returns false for empty string", () => {
    expect(isValidStatus('')).toBe(false)
  })
})

describe('statusColor', () => {
  it("returns var(--cc-green) for 'ready'", () => {
    expect(statusColor('ready')).toBe('var(--cc-green)')
  })

  it("returns var(--cc-red) for 'blocked'", () => {
    expect(statusColor('blocked')).toBe('var(--cc-red)')
  })

  it("returns var(--cc-accent) for 'dispatched'", () => {
    expect(statusColor('dispatched')).toBe('var(--cc-accent)')
  })

  it("returns var(--cc-gray) for unknown status", () => {
    expect(statusColor('unknown')).toBe('var(--cc-gray)')
  })
})

describe('statusLabel', () => {
  it("returns 'in review' for 'in_review'", () => {
    expect(statusLabel('in_review')).toBe('in review')
  })

  it("returns 'draft' for 'draft'", () => {
    expect(statusLabel('draft')).toBe('draft')
  })

  it("returns the status unchanged for all non-in_review values", () => {
    for (const s of ['ready', 'dispatched', 'closed', 'blocked', 'cancelled']) {
      expect(statusLabel(s)).toBe(s)
    }
  })
})
