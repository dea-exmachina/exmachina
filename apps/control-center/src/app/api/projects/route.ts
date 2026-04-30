import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toSlug } from '@/lib/slug'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenantId = user.app_metadata?.tenant_id as string | undefined
  if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 403 })

  const body = await request.json()
  const name: string = (body.name ?? '').trim()
  const mission: string = (body.mission ?? '').trim()

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const slug = toSlug(name)
  const projectMdPath = `projects/${slug}/PROJECT.md`

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name,
      mission: mission || null,
      slug,
      project_md_path: projectMdPath,
      scope: 'open',
      status: 'draft',
      tenant_id: tenantId,
    })
    .select('slug')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A project with that name already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ slug: data.slug }, { status: 201 })
}
