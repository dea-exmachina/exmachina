export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  const isTenantMissing = error === 'tenant_missing'

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
        width: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          fontFamily: 'var(--cc-font-data)',
          fontSize: '10px',
          color: 'var(--cc-accent)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          exmachina — setup required
        </div>

        {isTenantMissing && (
          <>
            <h1 style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--cc-text)',
              margin: 0,
            }}>
              Workspace not configured
            </h1>
            <p style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '13px',
              color: 'var(--cc-text-dim)',
              lineHeight: '1.6',
              margin: 0,
            }}>
              Your account is authenticated but not linked to a workspace.
              This usually means the installer hasn&apos;t completed Phase 2,
              or your <code style={{ fontFamily: 'var(--cc-font-data)', color: 'var(--cc-text)' }}>tenant_id</code> wasn&apos;t
              set in your user profile.
            </p>
            <div style={{
              background: 'var(--cc-surface2)',
              border: '1px solid var(--cc-border)',
              borderRadius: 'var(--cc-radius)',
              padding: '12px 14px',
              fontFamily: 'var(--cc-font-data)',
              fontSize: '11px',
              color: 'var(--cc-text-dim)',
              lineHeight: '1.8',
            }}>
              <div>Error code: <span style={{ color: 'var(--cc-red)' }}>tenant_missing</span></div>
              <div>Action: contact your workspace admin or re-run the installer.</div>
            </div>
          </>
        )}

        {!isTenantMissing && (
          <>
            <h1 style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--cc-text)',
              margin: 0,
            }}>
              Setup incomplete
            </h1>
            <p style={{
              fontFamily: 'var(--cc-font-ui)',
              fontSize: '13px',
              color: 'var(--cc-text-dim)',
              lineHeight: '1.6',
              margin: 0,
            }}>
              Something is missing from your workspace configuration.
              Re-running the installer should resolve this.
            </p>
            {error && (
              <div style={{
                fontFamily: 'var(--cc-font-data)',
                fontSize: '11px',
                color: 'var(--cc-red)',
              }}>
                Error: {error}
              </div>
            )}
          </>
        )}

        <a
          href="/sign-in"
          style={{
            fontFamily: 'var(--cc-font-ui)',
            fontSize: '12px',
            color: 'var(--cc-text-dim)',
            textDecoration: 'none',
            marginTop: '4px',
          }}
        >
          ← Back to sign in
        </a>
      </div>
    </div>
  )
}
