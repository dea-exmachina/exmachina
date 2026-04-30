import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'
import PlanningWizard from './PlanningWizard'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ step?: string }>
}

export default async function PlanPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { step } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, slug, status, planning_step, mission, goals, stack_context')
    .eq('slug', slug)
    .single()

  if (!project) {
    notFound()
  }

  if (project.status === 'active') {
    redirect(`/projects/${slug}`)
  }

  if (project.status !== 'draft') {
    redirect(`/projects/${slug}`)
  }

  const parsedStep = parseInt(step ?? '1') || 1
  const maxAllowed = Math.min((project.planning_step ?? 0) + 1, 7)
  const initialStep = Math.min(Math.max(parsedStep, 1), maxAllowed)

  return (
    <AppShell user={user} pageTitle={project.name}>
      <PlanningWizard project={project} initialStep={initialStep} />
    </AppShell>
  )
}
