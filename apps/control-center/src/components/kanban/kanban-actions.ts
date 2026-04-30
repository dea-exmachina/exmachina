'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { toSlug } from '@/lib/slug'
import { isValidStatus } from '@/lib/card-status'

export async function createCard(params: {
  title: string
  epicId: string
  status: string
  projectSlug: string
}): Promise<
  | { id: string; slug: string; error?: never }
  | { error: string; id?: never; slug?: never }
> {
  if (!isValidStatus(params.status)) {
    return { error: 'Invalid status' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Resolve tenant_id from auth metadata
  const tenantId = user.app_metadata?.tenant_id as string | undefined
  if (!tenantId) return { error: 'No tenant found for user' }

  // Fetch the epic to verify it exists and get sprint_id
  const { data: epic, error: epicError } = await supabase
    .from('epics')
    .select('id, slug, sprint_id, tenant_id')
    .eq('id', params.epicId)
    .single()

  if (epicError || !epic) {
    return { error: epicError?.message ?? 'Epic not found' }
  }

  const slug = toSlug(params.title)
  const cardMdPath = `cards/${slug}.md`

  const { data: card, error: insertError } = await supabase
    .from('cards')
    .insert({
      title: params.title,
      slug,
      status: params.status,
      epic_id: params.epicId,
      tenant_id: tenantId,
      card_md_path: cardMdPath,
    })
    .select('id, slug')
    .single()

  if (insertError || !card) {
    return { error: insertError?.message ?? 'Insert failed' }
  }

  revalidatePath(`/projects/${params.projectSlug}`)

  return { id: card.id, slug: card.slug }
}
