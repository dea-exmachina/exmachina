import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAuthedProject } from '@/lib/server/auth-guard'

// Mock the supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'

const mockCreateClient = vi.mocked(createClient)

function makeClient({
  user = null as object | null,
  project = null as object | null,
} = {}) {
  const getUser = vi.fn().mockResolvedValue({ data: { user } })
  const single = vi.fn().mockResolvedValue({ data: project, error: null })
  const eq = vi.fn().mockReturnValue({ single })
  const select = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ select })

  return {
    auth: { getUser },
    from,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getAuthedProject', () => {
  it('returns Unauthorized when user is null', async () => {
    const client = makeClient({ user: null })
    mockCreateClient.mockResolvedValue(client as never)

    const result = await getAuthedProject('test-slug')
    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('returns Forbidden when user has no tenant_id in app_metadata', async () => {
    const user = { id: 'u1', app_metadata: {} }
    const client = makeClient({ user })
    mockCreateClient.mockResolvedValue(client as never)

    const result = await getAuthedProject('test-slug')
    expect(result).toEqual({ error: 'Forbidden' })
  })

  it('returns Forbidden when project not found', async () => {
    const user = { id: 'u1', app_metadata: { tenant_id: 'tenant-1' } }
    const client = makeClient({ user, project: null })
    mockCreateClient.mockResolvedValue(client as never)

    const result = await getAuthedProject('test-slug')
    expect(result).toEqual({ error: 'Forbidden' })
  })

  it('returns Forbidden when project.tenant_id !== tenantId', async () => {
    const user = { id: 'u1', app_metadata: { tenant_id: 'tenant-1' } }
    const project = { id: 'p1', slug: 'test-slug', tenant_id: 'tenant-2', planning_step: 0 }
    const client = makeClient({ user, project })
    mockCreateClient.mockResolvedValue(client as never)

    const result = await getAuthedProject('test-slug')
    expect(result).toEqual({ error: 'Forbidden' })
  })

  it('returns supabase, user, tenantId, project when all checks pass', async () => {
    const user = { id: 'u1', app_metadata: { tenant_id: 'tenant-1' } }
    const project = {
      id: 'p1',
      slug: 'test-slug',
      tenant_id: 'tenant-1',
      planning_step: 0,
      name: 'Test',
      status: 'active',
      mission: null,
      goals: null,
      stack_context: null,
      project_md_path: 'projects/test-slug/project.md',
    }
    const client = makeClient({ user, project })
    mockCreateClient.mockResolvedValue(client as never)

    const result = await getAuthedProject('test-slug')
    expect(result).toMatchObject({
      user,
      tenantId: 'tenant-1',
      project,
    })
    expect('error' in result).toBe(false)
  })
})
