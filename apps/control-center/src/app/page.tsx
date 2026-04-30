import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'
import ProjectList from '@/components/projects/ProjectList'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, mission, slug, status, updated_at')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('projects fetch error:', error.message)
  }

  return (
    <AppShell user={user} pageTitle="Projects">
      <ProjectList projects={projects ?? []} />
    </AppShell>
  )
}
