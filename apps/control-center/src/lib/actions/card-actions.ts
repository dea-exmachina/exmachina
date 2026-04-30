'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isValidStatus } from '@/lib/card-status'

export async function updateCardStatus(
  cardId: string,
  newStatus: string,
): Promise<{ ok?: true; error?: string }> {
  if (!isValidStatus(newStatus)) {
    return { error: 'Invalid status' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('cards').update({ status: newStatus }).eq('id', cardId)

  if (error) return { error: error.message }
  return { ok: true }
}

export async function updateCard(
  cardId: string,
  fields: { title?: string; description?: string; assigned_agent_id?: string | null },
  projectSlug: string,
): Promise<{ ok?: true; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('cards').update(fields).eq('id', cardId)

  if (error) return { error: error.message }

  // Always invalidate card detail; invalidate kanban if title or agent changed
  revalidatePath(`/projects/${projectSlug}/cards/${cardId}`)
  if (fields.title !== undefined || fields.assigned_agent_id !== undefined) {
    revalidatePath(`/projects/${projectSlug}`)
  }

  return { ok: true }
}
