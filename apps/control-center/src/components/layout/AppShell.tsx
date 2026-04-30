import type { User } from '@supabase/supabase-js'
import { Zap } from 'lucide-react'
import Link from 'next/link'
import SidebarNav from './SidebarNav'

export interface Breadcrumb {
  label: string
  href?: string
}

interface AppShellProps {
  children: React.ReactNode
  user: User
  pageTitle?: string
  breadcrumbs?: Breadcrumb[]
}

export default function AppShell({
  children,
  user,
  pageTitle = 'Projects',
  breadcrumbs,
}: AppShellProps) {
  const tenantSlug =
    (user.app_metadata?.tenant_id as string | undefined)?.slice(0, 8) ?? 'workspace'
  const initials = user.email?.slice(0, 2).toUpperCase() ?? 'GG'

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--cc-bg)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 'var(--cc-sidebar-w)',
          flexShrink: 0,
          background: 'var(--cc-surface)',
          borderRight: '1px solid var(--cc-border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--cc-border)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--cc-font-data)',
              fontSize: '10px',
              color: 'var(--cc-accent)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '2px',
            }}
          >
            exmachina
          </div>
          <div
            style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--cc-text)',
            }}
          >
            Control Center
          </div>
        </div>

        {/* Nav — client component with usePathname */}
        <SidebarNav />

        {/* Agent status */}
        <div
          style={{
            borderTop: '1px solid var(--cc-border)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Zap size={12} style={{ color: 'var(--cc-text-dim)' }} />
          <span
            style={{
              fontFamily: 'var(--cc-font-data)',
              fontSize: '11px',
              color: 'var(--cc-text-dim)',
            }}
          >
            Agents offline
          </span>
          <div
            style={{
              marginLeft: 'auto',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--cc-gray)',
            }}
          />
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header
          style={{
            height: '44px',
            flexShrink: 0,
            background: 'var(--cc-surface)',
            borderBottom: '1px solid var(--cc-border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--cc-font-data)',
              fontSize: '12px',
              color: 'var(--cc-text-dim)',
            }}
          >
            {tenantSlug}
          </span>

          {/* Breadcrumbs or pageTitle */}
          {breadcrumbs && breadcrumbs.length > 0 ? (
            breadcrumbs.map((crumb, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--cc-border)', fontSize: '12px' }}>/</span>
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    style={{
                      fontFamily: 'var(--cc-font-ui)',
                      fontSize: '13px',
                      fontWeight: i === breadcrumbs.length - 1 ? 500 : 400,
                      color:
                        i === breadcrumbs.length - 1 ? 'var(--cc-text)' : 'var(--cc-text-dim)',
                      textDecoration: 'none',
                    }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    style={{
                      fontFamily: 'var(--cc-font-ui)',
                      fontSize: '13px',
                      fontWeight: i === breadcrumbs.length - 1 ? 500 : 400,
                      color:
                        i === breadcrumbs.length - 1 ? 'var(--cc-text)' : 'var(--cc-text-dim)',
                    }}
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            ))
          ) : (
            <>
              <span style={{ color: 'var(--cc-border)', fontSize: '12px' }}>/</span>
              <span
                style={{
                  fontFamily: 'var(--cc-font-ui)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--cc-text)',
                }}
              >
                {pageTitle}
              </span>
            </>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              style={{
                fontFamily: 'var(--cc-font-data)',
                fontSize: '11px',
                color: 'var(--cc-text-dim)',
                background: 'var(--cc-surface2)',
                border: '1px solid var(--cc-border)',
                borderRadius: 'var(--cc-radius)',
                padding: '3px 8px',
                cursor: 'pointer',
              }}
            >
              ⌘K
            </button>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'var(--cc-accent-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--cc-text)',
              }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>{children}</main>
      </div>
    </div>
  )
}
