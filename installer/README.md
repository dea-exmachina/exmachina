# installer/

The bootstrap pipeline. Renders identity templates from `os/identity/` into a user's vault, writes the global Claude Code identity binding, and (in later phases) provisions Supabase + deploys the Control Center.

---

## Phases

| Phase | Script | What it does | v0.2.x milestone |
|-------|--------|--------------|------------------|
| **1 — Identity** | `phase1-identity.sh` | Prompts for user/dea names + vault path. Renders tier-0/1/2 templates. Scaffolds vault folders. Writes fenced block to `~/.claude/CLAUDE.md`. | **v0.2.0 (now)** |
| **2 — Supabase** | `phase2-supabase.sh` | Links a Supabase project, applies migrations from `apps/control-center/supabase/migrations/`, generates TypeScript types, writes credentials to vault-scope `.env`, registers a per-tenant Supabase MCP at `<vault>/.mcp.json`, optionally seeds the tenants row. **v0.2.1 (shipped)** | v0.2.1 |
| **3 — Control Center** | `phase3-cc.sh` | Deploys CC to Vercel via CLI. Wires CC to the user's Supabase project. | v0.2.2 |

`install.sh` at the repo root chains the phases. Each phase is independent and idempotent — re-running fixes drift, doesn't duplicate.

---

## Operating Modes

| Mode | Flag | Use when |
|------|------|----------|
| **bootstrap** | (default) | Target vault directory is empty or doesn't exist yet. Full scaffold. |
| **adopt** | `--adopt` | Target directory exists and has user content (e.g., George's existing Atalas vault). Overlays scaffold without overwriting user data. Suggest-and-confirm before any move. |
| **update** | `--update` | Re-renders templates against the user's existing answers. Used after a `git pull` of exmachina to refresh tier-0/1 files. Preserves user customizations within fenced blocks. |
| **dry-run** | `--dry-run` | Shows what would happen without writing. Useful for review before adopt or update. |

---

## Required Tools

The installer is bash-first, with Node helpers for template rendering. Required on the user's machine:

- bash 4+ (Linux, macOS, WSL on Windows)
- Node 20+ (for template rendering — `installer/render.mjs`)
- git
- Claude Code installed (we don't install this — it's a prerequisite)
- Phase 2+: Supabase CLI **>= 2.0.0** (must be installed manually; `phase2-supabase.sh` checks the version and fails fast if missing or too old)
- Phase 3: Vercel CLI (auto-installed if missing)

For Windows users without WSL: a PowerShell port of phase 1 lives at `installer/phase1-identity.ps1`. (Not yet implemented in v0.2.0 — Linux/macOS/WSL first.)

---

---

## Phase 2 Reference

`phase2-supabase.sh` flags:

| Flag | Effect |
|------|--------|
| (default) | Full bootstrap: link → push migrations → gen types → write `.env` → register vault-scope MCP |
| `--link-only` | Link the Supabase project; skip everything else |
| `--skip-mcp` | Skip MCP registration entirely |
| `--use-plugin-mcp` | User has the Claude Code `plugin:supabase` MCP at user-scope; skip writing `.mcp.json`. Vault metadata still gets written so dea can resolve `project_ref` from inside the vault. |
| `--seed-tenant` | After migrations, seed a `tenants` row + principal `users` row |
| `--dry-run` | Show plan, write nothing |

### MCP modes (pick one)

The Supabase MCP can be wired two ways. Phase 2 supports both; pick based on what the user already has installed:

| Mode | When | What gets written |
|------|------|-------------------|
| **plugin** (`--use-plugin-mcp`) | User has `/plugins` → `plugin:supabase` connected. The plugin runs at user-scope and sees all the user's Supabase projects. | Only vault metadata. Dea resolves `project_id` from `.exmachina/version.json` on each MCP call. |
| **vault-scope** (default) | No plugin; vault should pin to one project. | `<vault>/.mcp.json` with a `npx @supabase/mcp-server-supabase --project-ref=<ref>` server. Requires a Personal Access Token (PAT) from supabase.com/dashboard/account/tokens — **not** the service role key. |
| **skipped** (`--skip-mcp`) | Setting up offline / wiring MCP manually later | Nothing for MCP. Other Phase 2 outputs still happen. |

The `mcp_mode` is recorded in `<vault>/.exmachina/version.json` so dea knows which path is in use.

Outputs in the vault:
- `<vault>/.env` — mode 600, gitignored, holds Supabase URL + keys + tenant slug
- `<vault>/.mcp.json` — per-vault MCP server registration (Claude Code reads this on launch)
- `<vault>/.exmachina/types/database.ts` — generated TypeScript types from the schema
- `<vault>/.exmachina/version.json` — phase2 metadata appended

Idempotent. Re-running updates `.env` keys in place, refreshes types, merges MCP entries.

---

## Status

- **Phase 1**: shipped in v0.2.0.
- **Phase 2**: shipped in v0.2.1.
- **Phase 3**: planned for v0.2.2.
