'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Database } from '@/types/database'

type Project = Pick<
  Database['public']['Tables']['projects']['Row'],
  'id' | 'name' | 'mission' | 'slug' | 'status' | 'updated_at'
>

interface ProjectListProps {
  projects: Project[]
}

function statusColor(status: string): string {
  switch (status) {
    case 'active':     return 'var(--cc-green)'
    case 'approved':   return 'var(--cc-yellow)'
    case 'draft':      return 'var(--cc-accent)'
    case 'archived':   return 'var(--cc-gray)'
    default:           return 'var(--cc-gray)'
  }
}

function statusLabel(status: string): string {
  return status.replace(/_/g, '-').toUpperCase()
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', gap: '16px' }}>
        <div style={{
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--cc-text)',
        }}>
          No projects yet
        </div>
        <div style={{
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '13px',
          color: 'var(--cc-text-dim)',
          textAlign: 'center',
          maxWidth: '320px',
        }}>
          Create a placeholder in seconds, or walk through a planning session to scope it out fully.
        </div>
        <Link
          href="/projects/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--cc-accent)',
            color: '#060911',
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '13px',
            fontWeight: 600,
            padding: '9px 18px',
            borderRadius: 'var(--cc-radius)',
            textDecoration: 'none',
            marginTop: '4px',
          }}
        >
          <Plus size={13} />
          Create your first project
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Section header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{
          fontFamily: 'var(--cc-font-data)',
          fontSize: '10px',
          fontWeight: 500,
          color: 'var(--cc-text-dim)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </div>
        <Link
          href="/projects/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'var(--cc-accent)',
            color: '#060911',
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '12px',
            fontWeight: 600,
            padding: '5px 11px',
            borderRadius: 'var(--cc-radius)',
            textDecoration: 'none',
          }}
        >
          <Plus size={12} />
          New project
        </Link>
      </div>

      {/* Project rows */}
      <div style={{
        background: 'var(--cc-surface)',
        border: '1px solid var(--cc-border)',
        borderRadius: 'var(--cc-radius)',
        overflow: 'hidden',
      }}>
        {projects.map((project, i) => (
          <ProjectRow key={project.id} project={project} isLast={i === projects.length - 1} />
        ))}
      </div>
    </div>
  )
}

function ProjectRow({ project, isLast }: { project: Project; isLast: boolean }) {
  const color = statusColor(project.status)

  return (
    <Link
      href={`/projects/${project.slug}`}
      style={{
        display: 'block',
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--cc-border)',
        textDecoration: 'none',
        transition: 'background 100ms',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--cc-surface2)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Name */}
      <div style={{
        fontFamily: 'var(--cc-font-ui)',
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--cc-text)',
        marginBottom: '2px',
      }}>
        {project.name}
      </div>

      {/* Mission */}
      {project.mission && (
        <div style={{
          fontFamily: 'var(--cc-font-ui)',
          fontSize: '12px',
          color: 'var(--cc-text-dim)',
          marginBottom: '8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {project.mission}
        </div>
      )}

      {/* Meta row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        fontFamily: 'var(--cc-font-data)',
        fontSize: '11px',
        color: 'var(--cc-text-dim)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {/* Status chip */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '2px 7px',
          borderRadius: 'var(--cc-radius)',
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.03em',
          border: `1px solid ${color}40`,
          background: `${color}1A`,
          color,
        }}>
          <span style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: color,
            display: 'inline-block',
          }} />
          {statusLabel(project.status)}
        </span>

        <span>{relativeTime(project.updated_at)}</span>
      </div>
    </Link>
  )
}
