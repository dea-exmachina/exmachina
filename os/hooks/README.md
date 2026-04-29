# Hooks

Structural enforcement for exmachina. Five rules that prevent catastrophic mistakes — secrets in commits, identity drift, destructive operations, force-pushes to main, hardcoded secrets in code.

These are **hookify-format** rules (`.local.md` files with YAML frontmatter). The hookify plugin (Anthropic-maintained) is a prerequisite. Install it via Claude Code first if missing.

---

## Why These Five (the Philosophy)

The v0.1 system shipped 15 enforcement mechanisms. Most were advisory — they wrote "remember to do X" into CLAUDE.md and decayed under load. The five that worked were **structural**: they ran outside the model, used regex matching, and blocked or warned at tool-use time without depending on Claude remembering anything.

This folder ships only those five. Advisory rules belong in identity/wisdom files where they're at least scoped to where they apply.

| Rule | Event | Action | Why structural matters |
|------|-------|--------|------------------------|
| `block-secrets-edit` | file | **block** | Secrets in git are non-reversible. Never trust the model to remember. |
| `warn-identity-edit` | file | warn | Identity files are high-stakes. Warn before edit so the user sees the change. |
| `block-destructive-ops` | bash | **block** | `rm -rf /`, `mkfs`, `dd if=` cascade catastrophically. Block, don't warn. |
| `warn-force-push-main` | bash | warn | Force-push to main is rarely correct. Warn so a human approves. |
| `warn-hardcoded-secret` | file | warn | Detects API-key-shaped strings in content being written. |

---

## Files in This Folder

| File | What it is |
|------|------------|
| `hookify.block-secrets-edit.local.md` | Block edits to `.env`, `*.key`, `*.pem`, `credentials*`, `service-account*.json` |
| `hookify.warn-identity-edit.local.md` | Warn before editing files in `identity/` |
| `hookify.block-destructive-ops.local.md` | Block `rm -rf /`, `dd if=`, `mkfs`, `format` |
| `hookify.warn-force-push-main.local.md` | Warn on `git push --force` to main / master |
| `hookify.warn-hardcoded-secret.local.md` | Warn when written content matches API-key shapes |

---

## Installation

Phase 1 of the installer (when this lands in the script — currently in `phase1-identity.sh` as a TODO) offers to install these into one of two scopes:

- **User-scope**: `~/.claude/hookify.<rule>.local.md` (active everywhere)
- **Vault-scope**: `<vault>/.claude/hookify.<rule>.local.md` (active only when CC opens that vault)

Default: vault-scope. Reason: the rules reference paths that exist in vaults (`identity/`, etc.), and a user might run multiple vaults with different rule sets.

---

## Customizing

These rules are starting points. Users will tune them — adjust paths, change `block` to `warn`, add domain-specific patterns. The `.local.md` files are owned by the user once installed; the installer's `--update` mode does NOT overwrite local rule edits unless `--force` is passed.

---

## What's NOT Here

- **Per-project hooks** — those go in the project's own `.claude/hookify.*.local.md`, not the OS layer.
- **Advisory reminders** — those belong in identity / wisdom / project docs.
- **Aspirational quality gates** — Cynefin, design hierarchy, framework discipline, etc. live in the Council and frameworks library, not as hooks. Hooks enforce; councils deliberate.
