# installer/

The bootstrap pipeline. Renders identity templates from `os/identity/` into a user's vault, writes the global Claude Code identity binding, and (in later phases) provisions Supabase + deploys the Control Center.

---

## Phases

| Phase | Script | What it does | v0.2.x milestone |
|-------|--------|--------------|------------------|
| **1 — Identity** | `phase1-identity.sh` | Prompts for user/dea names + vault path. Renders tier-0/1/2 templates. Scaffolds vault folders. Writes fenced block to `~/.claude/CLAUDE.md`. | **v0.2.0 (now)** |
| **2 — Supabase** | `phase2-supabase.sh` | Prompts for Supabase URL + service key. Applies migrations from `apps/control-center/supabase/migrations/`. Writes credentials to `<vault>/.env`. Configures Supabase MCP. | v0.2.1 |
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
- Phase 2+: Supabase CLI (auto-installed if missing)
- Phase 3: Vercel CLI (auto-installed if missing)

For Windows users without WSL: a PowerShell port of phase 1 lives at `installer/phase1-identity.ps1`. (Not yet implemented in v0.2.0 — Linux/macOS/WSL first.)

---

## Status

**v0.2.0 implementation is in progress.** This README is the spec; the scripts are being built out next.
