import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCouncilReview, recordDecision } from '@/app/projects/[slug]/council/actions'

const { mockWriteFileSync, mockMkdirSync, mockAppendFileSync, mockExistsSync } = vi.hoisted(() => ({
  mockWriteFileSync: vi.fn(),
  mockMkdirSync: vi.fn(),
  mockAppendFileSync: vi.fn(),
  mockExistsSync: vi.fn().mockReturnValue(true),
}))

vi.mock('@/lib/server/auth-guard', () => ({
  getAuthedProject: vi.fn(),
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))
vi.mock('fs', () => ({
  default: {
    mkdirSync: mockMkdirSync,
    writeFileSync: mockWriteFileSync,
    appendFileSync: mockAppendFileSync,
    existsSync: mockExistsSync,
  },
  mkdirSync: mockMkdirSync,
  writeFileSync: mockWriteFileSync,
  appendFileSync: mockAppendFileSync,
  existsSync: mockExistsSync,
}))

import { getAuthedProject } from '@/lib/server/auth-guard'

const mockGetAuthedProject = vi.mocked(getAuthedProject)

function makeInsertSupabase({
  insertData = { id: 'review-abc-12345678' } as object | null,
  insertError = null as { message: string } | null,
  boardData = null as object | null,
} = {}) {
  const boardMaybeSingle = vi.fn().mockResolvedValue({ data: boardData })
  const reviewInsertSingle = vi.fn().mockResolvedValue({ data: insertData, error: insertError })
  const reviewUpdate = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  })

  const from = vi.fn().mockImplementation((table: string) => {
    if (table === 'boards') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ maybeSingle: boardMaybeSingle }),
          }),
        }),
      }
    }
    if (table === 'council_reviews') {
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({ single: reviewInsertSingle }),
        }),
        update: reviewUpdate,
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: 'review-abc-12345678', artifact_path: 'projects/slug/council/review-abc.md', synthesis: null },
            }),
          }),
        }),
      }
    }
    return {}
  })

  return { from }
}

function makeAuthResult(supabase: object) {
  return {
    supabase,
    tenantId: 'tenant-1',
    user: { id: 'u1' },
    project: { id: 'p1', slug: 'exmachina-v022', name: 'Exmachina', tenant_id: 'tenant-1' },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.CC_VAULT_ROOT = '/tmp/vault'
})

describe('createCouncilReview', () => {
  it('returns Unauthorized when getAuthedProject returns error', async () => {
    mockGetAuthedProject.mockResolvedValue({ error: 'Unauthorized' } as never)
    const result = await createCouncilReview('slug', 'pre-decision', 'context')
    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('returns ok:true with vaultWarning when vault write throws', async () => {
    const supabase = makeInsertSupabase()
    mockGetAuthedProject.mockResolvedValue(makeAuthResult(supabase) as never)
    mockWriteFileSync.mockImplementationOnce(() => {
      throw new Error('disk full')
    })

    const result = await createCouncilReview('exmachina-v022', 'pre-decision', 'context')
    expect(result.ok).toBe(true)
    expect(result.vaultWarning).toBeDefined()
    expect(result.reviewId).toBeDefined()
  })

  it('returns ok:true with reviewId on success and calls INSERT', async () => {
    const supabase = makeInsertSupabase()
    mockGetAuthedProject.mockResolvedValue(makeAuthResult(supabase) as never)

    const result = await createCouncilReview('exmachina-v022', 'pre-decision', 'Test decision')
    expect(result.ok).toBe(true)
    expect(result.reviewId).toBe('review-abc-12345678')
    expect(supabase.from).toHaveBeenCalledWith('council_reviews')
  })
})

describe('recordDecision', () => {
  it('still returns ok:true when vault file write fails (non-blocking)', async () => {
    const supabase = makeInsertSupabase()
    // Make update work
    const updateEq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq: updateEq })
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === 'council_reviews') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: 'review-abc',
                  artifact_path: 'projects/slug/council/review-abc.md',
                  synthesis: null,
                },
              }),
            }),
          }),
          update,
        }
      }
      return {}
    })

    mockGetAuthedProject.mockResolvedValue(makeAuthResult(supabase) as never)
    mockAppendFileSync.mockImplementationOnce(() => {
      throw new Error('disk full')
    })

    const result = await recordDecision('exmachina-v022', 'review-abc', 'approve', 'notes')
    expect(result).toEqual({ ok: true })
  })

  it('creates vault file from scratch when existsSync returns false', async () => {
    mockExistsSync.mockReturnValueOnce(false)

    const supabase = makeInsertSupabase()
    supabase.from = vi.fn().mockImplementation((table: string) => {
      if (table === 'council_reviews') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: 'review-abc',
                  artifact_path: 'projects/slug/council/review-abc.md',
                  synthesis: null,
                },
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        }
      }
      return {}
    })

    mockGetAuthedProject.mockResolvedValue(makeAuthResult(supabase) as never)

    const result = await recordDecision('exmachina-v022', 'review-abc', 'approve', 'notes')
    expect(result).toEqual({ ok: true })
    expect(mockWriteFileSync).toHaveBeenCalled()
    expect(mockAppendFileSync).toHaveBeenCalled()
  })
})
