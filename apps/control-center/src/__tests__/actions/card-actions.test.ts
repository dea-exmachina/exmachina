import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateCardStatus } from '@/lib/actions/card-actions'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'

const mockCreateClient = vi.mocked(createClient)

function makeClient({
  user = null as object | null,
  updateError = null as { message: string } | null,
} = {}) {
  const getUser = vi.fn().mockResolvedValue({ data: { user } })
  const updateFn = vi.fn().mockResolvedValue({ error: updateError })
  const eq = vi.fn().mockReturnValue({ update: updateFn, eq: vi.fn().mockReturnValue({ error: updateError }) })
  const update = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: updateError }) })
  // Simpler: chain all returns
  const fromCards = {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: updateError }),
    }),
  }
  const from = vi.fn().mockReturnValue(fromCards)

  return { auth: { getUser }, from, _updateMock: fromCards.update }
}

beforeEach(() => vi.clearAllMocks())

describe('updateCardStatus', () => {
  it('returns Invalid status for an invalid status without calling DB', async () => {
    const client = makeClient()
    mockCreateClient.mockResolvedValue(client as never)

    const result = await updateCardStatus('card-1', 'invalid_status')
    expect(result).toEqual({ error: 'Invalid status' })
    expect(client.from).not.toHaveBeenCalled()
  })

  it('returns Unauthorized when no user', async () => {
    const client = makeClient({ user: null })
    mockCreateClient.mockResolvedValue(client as never)

    const result = await updateCardStatus('card-1', 'ready')
    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('returns ok:true and calls update with correct status when authed', async () => {
    const user = { id: 'u1', app_metadata: { tenant_id: 'tenant-1' } }
    const client = makeClient({ user })
    mockCreateClient.mockResolvedValue(client as never)

    const result = await updateCardStatus('card-1', 'ready')
    expect(result).toEqual({ ok: true })
    expect(client.from).toHaveBeenCalledWith('cards')
    expect(client._updateMock).toHaveBeenCalledWith({ status: 'ready' })
  })
})
