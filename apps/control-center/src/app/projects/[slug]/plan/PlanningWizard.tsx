'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Json } from '@/types/database'
import Step1GuidingStar from './steps/Step1GuidingStar'
import Step2Goals from './steps/Step2Goals'
import Step3Stack from './steps/Step3Stack'
import Step4Agents from './steps/Step4Agents'
import Step5Sprint from './steps/Step5Sprint'
import Step6Cards from './steps/Step6Cards'
import Step7Launch from './steps/Step7Launch'

interface SprintData {
  name: string
  goal: string
  startsAt?: string
  endsAt?: string
}

interface EpicData {
  name: string
  cards: Array<{ title: string }>
}

interface ProjectProp {
  id: string
  name: string
  slug: string
  mission: string | null
  goals: Json | null
  stack_context: string | null
  planning_step: number
}

interface Props {
  project: ProjectProp
  initialStep: number
}

const TOTAL_STEPS = 7

function WizardInner({ project, initialStep }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const stepFromUrl = parseInt(searchParams.get('step') ?? String(initialStep)) || initialStep
  const [step, setStep] = useState(stepFromUrl)
  const [sprintData, setSprintData] = useState<SprintData | null>(null)
  const [epicsData, setEpicsData] = useState<EpicData[]>([])

  function goToStep(n: number) {
    setStep(n)
    router.push(`/projects/${project.slug}/plan?step=${n}`)
  }

  function handleNext() {
    goToStep(step + 1)
  }

  function handleBack() {
    if (step > 1) goToStep(step - 1)
  }

  const progressStyle: React.CSSProperties = {
    fontFamily: 'var(--cc-font-data)',
    fontSize: '11px',
    color: 'var(--cc-text-dim)',
    marginBottom: '24px',
  }

  const calloutStyle: React.CSSProperties = {
    border: '1px solid var(--cc-accent)',
    backgroundColor: 'color-mix(in srgb, var(--cc-accent) 8%, transparent)',
    borderRadius: 'var(--cc-radius)',
    padding: '10px 14px',
    fontSize: '12px',
    fontFamily: 'var(--cc-font-ui)',
    color: 'var(--cc-text)',
    marginBottom: '16px',
  }

  const wrapperStyle: React.CSSProperties = {
    padding: '32px 40px',
    maxWidth: '600px',
  }

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <Step1GuidingStar
            project={{ id: project.id, slug: project.slug, mission: project.mission }}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <Step2Goals
            project={{ id: project.id, slug: project.slug, goals: project.goals }}
            onNext={handleNext}
          />
        )
      case 3:
        return (
          <Step3Stack
            project={{ id: project.id, slug: project.slug, stack_context: project.stack_context }}
            onNext={handleNext}
          />
        )
      case 4:
        return (
          <Step4Agents
            project={{ id: project.id, slug: project.slug }}
            onNext={handleNext}
          />
        )
      case 5:
        return (
          <>
            <div style={calloutStyle}>
              From here, complete the remaining steps in one sitting — your work is saved on launch.
            </div>
            <Step5Sprint
              onNext={(sprint) => {
                setSprintData(sprint)
                handleNext()
              }}
            />
          </>
        )
      case 6:
        return (
          <Step6Cards
            onNext={(epics) => {
              setEpicsData(epics)
              handleNext()
            }}
          />
        )
      case 7:
        return (
          <Step7Launch
            project={project}
            sprint={sprintData ?? { name: '', goal: '' }}
            epics={epicsData}
          />
        )
      default:
        return null
    }
  }

  return (
    <div style={wrapperStyle}>
      <div style={progressStyle}>
        Step {step} of {TOTAL_STEPS}
      </div>
      {step > 1 && step < 7 && (
        <button
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--cc-text-dim)',
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '12px',
            cursor: 'pointer',
            padding: '0',
            marginBottom: '16px',
          }}
        >
          ← Back
        </button>
      )}
      {renderStep()}
    </div>
  )
}

export default function PlanningWizard(props: Props) {
  return (
    <Suspense fallback={null}>
      <WizardInner {...props} />
    </Suspense>
  )
}
