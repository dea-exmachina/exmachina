'use client'

import { Suspense, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('error') === 'auth_failed') {
      setError('Authentication failed. The link may have expired.')
    }
  }, [searchParams])

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (typeof window !== 'undefined' && 'credentials' in navigator && 'PasswordCredential' in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const PasswordCredential = (window as any).PasswordCredential
        const cred = new PasswordCredential({ id: email, password, name: email })
        await navigator.credentials.store(cred)
      } catch {
        // Credential Management API not supported — non-blocking
      }
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cc-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--cc-surface)',
        border: '1px solid var(--cc-border)',
        borderRadius: 'var(--cc-radius)',
        padding: '32px',
        width: '360px',
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontFamily: 'var(--cc-font-data)',
            fontSize: '10px',
            color: 'var(--cc-accent)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            exmachina
          </div>
          <h1 style={{
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--cc-text)',
            margin: 0,
          }}>
            Control Center
          </h1>
        </div>

        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '12px',
              color: 'var(--cc-text-dim)',
              marginBottom: '4px',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
              required
              style={{
                width: '100%',
                background: 'var(--cc-surface2)',
                border: '1px solid var(--cc-border)',
                borderRadius: 'var(--cc-radius)',
                padding: '8px 10px',
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '13px',
                color: 'var(--cc-text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '12px',
              color: 'var(--cc-text-dim)',
              marginBottom: '4px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{
                width: '100%',
                background: 'var(--cc-surface2)',
                border: '1px solid var(--cc-border)',
                borderRadius: 'var(--cc-radius)',
                padding: '8px 10px',
                fontFamily: 'var(--cc-font-ui)',
                fontSize: '13px',
                color: 'var(--cc-text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '12px',
              color: 'var(--cc-red)',
              padding: '8px 10px',
              background: 'rgba(179, 64, 64, 0.1)',
              border: '1px solid rgba(179, 64, 64, 0.25)',
              borderRadius: 'var(--cc-radius)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--cc-accent)',
              color: '#060911',
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '13px',
              fontWeight: 600,
              padding: '10px',
              border: 'none',
              borderRadius: 'var(--cc-radius)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '4px',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  )
}
