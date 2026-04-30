import { describe, it, expect, vi, beforeEach } from 'vitest'
import { startSprint } from '@/app/projects/[slug]/actions'

vi.mock('@/lib/server/auth-guard', () => ({
  getAuthedProject: vi.fn(),
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { getAuthedProject } from '@/lib/server/auth-guard'

const mockGetAuthedProject = vi.mocked(getAuthedProject)

function makeSupabase({
  existingSprint = null as object | null,
  insertError = null as { message: string } | null,
} = {}) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: existingSprint, error: null })
  const eq2 = vi.fn().mockReturnValue({ maybeSingle })
  const eq1 = vi.fn().mockReturnValue({ eq: eq2 })
  const select = vi.fn().mockReturnValue({ eq: eq1 })

  const insertResult = vi.fn().mockResolvedValue({ error: insertError })
  const insertFrom = {
    select,
    insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: insertError }) }) }),
  }

  // Simpler combined mock
  const sprintInsert = vi.fn().mockResolvedValue({ error: insertError })
  const from = vi.fn().mockImplementation((table: string) => {
    if (table === 'sprints') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ maybeSingle }),
          }),
        }),
        insert: vi.fn().mockReturnValue(sprintInsert()),
      }
    }
    return {}
  })

  return { from, _sprintInsert: sprintInsert }
}

beforeEach(() => vi.clearAllMocks())

describe('startSprint', () => {
  it('returns Unauthorized when getAuthedProject returns error', async () => {
    mockGetAuthedProject.mockResolvedValue({ error: 'Unauthorized' } as never)
    const result = await startSprint('j-o-b', 'Sprint 1', 'goal')
    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('returns active_sprint_exists when an active sprint exists', async () => {
    const supabase = makeSupabase({ existingSprint: { id: 'existing-sprint' } })
    mockGetAuthedProject.mockResolvedValue({
      supabase,
      tenantId: 'tenant-1',
      user: { id: 'u1' },
      project: { id: 'p1', slug: 'j-o-b', tenant_id: 'tenant-1' },
    } as never)

    const result = await startSprint('j-o-b', 'Sprint 1', 'goal')
    expect(result).toEqual({ error: 'active_sprint_exists' })
  })

  it('returns ok:true and inserts with status active when no active sprint exists', async () => {
    const insertFn = vi.fn().mockResolvedValue({ error: null })
    const supabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'sprints') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: null }),
                }),
              }),
            }),
            insert: insertFn,
          }
        }
        return {}
      }),
    }

    mockGetAuthedProject.mockResolvedValue({
      supabase,
      tenantId: 'tenant-1',
      user: { id: 'u1' },
      project: { id: 'p1', slug: 'j-o-b', tenant_id: 'tenant-1' },
    } as never)

    const result = await startSprint('j-o-b', 'Sprint 1', 'Test goal')
    expect(result).toEqual({ ok: true })
    expect(insertFn).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active', name: 'Sprint 1' }),
    )
  })
})
