'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Settings } from 'lucide-react'

function NavItem({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  const pathname = usePathname()
  // "Projects" is active for "/" and all "/projects/*" routes
  const active =
    href === '/'
      ? pathname === '/' || pathname.startsWith('/projects')
      : pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        fontFamily: 'var(--cc-font-ui)',
        fontSize: '13px',
        fontWeight: active ? 500 : 400,
        color: active ? 'var(--cc-text)' : 'var(--cc-text-dim)',
        textDecoration: 'none',
        borderLeft: active ? '2px solid var(--cc-accent)' : '2px solid transparent',
        transition: 'color 100ms, background 100ms',
      }}
    >
      {icon}
      {label}
    </Link>
  )
}

export default function SidebarNav() {
  return (
    <>
      <nav style={{ padding: '8px 0', flex: 1 }}>
        <NavItem href="/" icon={<LayoutDashboard size={14} />} label="Projects" />
      </nav>
      <div style={{ borderTop: '1px solid var(--cc-border)', padding: '4px 0' }}>
        <NavItem href="/settings" icon={<Settings size={14} />} label="Settings" />
      </div>
    </>
  )
}
