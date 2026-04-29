#!/usr/bin/env bash
# phase1-identity.sh — exmachina installer Phase 1: Identity layer
#
# Prompts for user/dea/vault details, renders identity templates, scaffolds
# the vault, and writes a fenced exmachina block to ~/.claude/CLAUDE.md.
#
# Idempotent: re-running fixes drift without duplicating content.
# Modes: bootstrap (default) | --adopt | --update | --dry-run

set -euo pipefail

# ─── Locate exmachina ────────────────────────────────────────────────────────
EXMACHINA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATES_DIR="$EXMACHINA_DIR/os/identity"
RENDER="$EXMACHINA_DIR/installer/render.mjs"
VERSION="$(cat "$EXMACHINA_DIR/VERSION" 2>/dev/null || echo "0.2.0")"

# ─── Parse flags ─────────────────────────────────────────────────────────────
MODE="bootstrap"
DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --adopt) MODE="adopt" ;;
    --update) MODE="update" ;;
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      cat <<'EOF'
phase1-identity.sh — Render identity templates into a vault.

Usage:
  phase1-identity.sh [--adopt | --update] [--dry-run]

Modes:
  (default)   bootstrap — target dir is empty or new
  --adopt     overlay onto existing populated vault, ask before any move
  --update    re-render against existing answers (after `git pull`)
  --dry-run   show what would happen, write nothing

EOF
      exit 0
      ;;
    *) echo "phase1: unknown flag $arg" >&2; exit 1 ;;
  esac
done

# ─── Pre-flight checks ───────────────────────────────────────────────────────
command -v node >/dev/null || { echo "phase1: Node 20+ required, not found" >&2; exit 1; }
command -v git >/dev/null  || { echo "phase1: git required, not found" >&2; exit 1; }
[ -f "$RENDER" ] || { echo "phase1: render.mjs missing at $RENDER" >&2; exit 1; }

# ─── Banner ──────────────────────────────────────────────────────────────────
cat <<EOF

  exmachina — installer phase 1 (identity)
  ────────────────────────────────────────
  exmachina version: $VERSION
  exmachina source:  $EXMACHINA_DIR
  mode:              $MODE$([ "$DRY_RUN" = 1 ] && echo " (dry-run)")

EOF

# ─── Prompt helpers ──────────────────────────────────────────────────────────
ask() {
  local prompt="$1"; local default="${2:-}"; local var
  if [ -n "$default" ]; then
    read -r -p "$prompt [$default]: " var
    echo "${var:-$default}"
  else
    while [ -z "${var:-}" ]; do read -r -p "$prompt: " var; done
    echo "$var"
  fi
}

ask_yn() {
  local prompt="$1"; local default="${2:-n}"; local var
  read -r -p "$prompt [y/n] (default: $default): " var
  var="${var:-$default}"
  case "$var" in y|Y|yes|YES) return 0 ;; *) return 1 ;; esac
}

# ─── Gather answers ──────────────────────────────────────────────────────────
echo ""
echo "▶ Tell me about you and your AI partner."
echo ""

USER_NAME="$(ask 'Your name')"
USER_PRONOUNS="$(ask 'Your pronouns' 'they/them')"
USER_EMAIL="$(ask 'Your email' '')"
AI_NAME="$(ask "What should your AI partner be called" 'dea')"
AI_NAME_LOWER="$(echo "$AI_NAME" | tr '[:upper:]' '[:lower:]')"
AI_PRONOUNS="$(ask "${AI_NAME}'s pronouns" 'she/her')"

echo ""
echo "▶ Where should your vault live?"
echo ""
echo "  This is a folder/git repo that holds your identity files,"
echo "  projects, logs, and customizations. We recommend creating it"
echo "  via the GitHub Template Repository at"
echo "  https://github.com/dea-exmachina/vault-template"
echo "  and pointing here at the local clone."
echo ""

DEFAULT_VAULT="$HOME/vault"
[ -n "${VAULT:-}" ] && DEFAULT_VAULT="$VAULT"
VAULT_PATH="$(ask 'Vault path (absolute)' "$DEFAULT_VAULT")"
VAULT_PATH="$(cd "$(dirname "$VAULT_PATH")" 2>/dev/null && pwd)/$(basename "$VAULT_PATH")"
VAULT_NAME="$(basename "$VAULT_PATH")"

# ─── Mode validation ─────────────────────────────────────────────────────────
if [ -d "$VAULT_PATH" ] && [ -n "$(ls -A "$VAULT_PATH" 2>/dev/null)" ]; then
  if [ "$MODE" = "bootstrap" ]; then
    echo ""
    echo "  $VAULT_PATH exists and is not empty."
    echo "  This looks like an existing vault. Switch to --adopt mode? (recommended)"
    if ask_yn "  Use --adopt mode" "y"; then
      MODE="adopt"
    else
      echo "  Aborting. Pass --adopt to overlay onto existing content."
      exit 1
    fi
  fi
elif [ "$MODE" = "adopt" ]; then
  echo ""
  echo "  $VAULT_PATH does not exist or is empty. Cannot --adopt nothing."
  echo "  Switching to bootstrap mode."
  MODE="bootstrap"
fi

# ─── Build answers JSON ──────────────────────────────────────────────────────
INSTALL_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
ANSWERS_FILE="$(mktemp)"
trap 'rm -f "$ANSWERS_FILE"' EXIT

cat > "$ANSWERS_FILE" <<EOF
{
  "user_name": "$USER_NAME",
  "user_pronouns": "$USER_PRONOUNS",
  "user_email": "$USER_EMAIL",
  "user_location": "",
  "user_org_role": "Principal of own work — full Chief-of-Staff scope; no external organization permissions",
  "user_working_style": "(edit identity/user.md to calibrate)",
  "user_domains": "(edit identity/user.md to enumerate)",
  "user_boundaries": "(edit identity/user.md to define)",
  "ai_name": "$AI_NAME",
  "ai_name_lowercase": "$AI_NAME_LOWER",
  "ai_pronouns": "$AI_PRONOUNS",
  "vault_path": "$VAULT_PATH",
  "vault_name": "$VAULT_NAME",
  "exmachina_version": "$VERSION",
  "install_date": "$INSTALL_DATE",
  "project_name": "",
  "project_one_line_mission": "",
  "project_voice_rules": "",
  "role_specialization": "",
  "work_title": ""
}
EOF

# ─── Plan the writes ─────────────────────────────────────────────────────────
declare -A WRITES
# Tier 1 — vault CLAUDE.md
WRITES["$TEMPLATES_DIR/tier-1.vault.template.md"]="$VAULT_PATH/CLAUDE.md"
# dea identity (the @ target of tier-1)
WRITES["$TEMPLATES_DIR/dea.template.md"]="$VAULT_PATH/identity/$AI_NAME_LOWER.md"
# user identity
WRITES["$TEMPLATES_DIR/user.template.md"]="$VAULT_PATH/identity/user.md"
# wisdom (loaded on demand)
WRITES["$TEMPLATES_DIR/dea-wisdom.template.md"]="$VAULT_PATH/identity/${AI_NAME_LOWER}-wisdom.md"

# ─── Show plan ───────────────────────────────────────────────────────────────
echo ""
echo "▶ Plan"
echo ""
echo "  Vault: $VAULT_PATH ($MODE mode)"
echo "  Templates to render:"
for src in "${!WRITES[@]}"; do
  dst="${WRITES[$src]}"
  status="(new)"
  [ -f "$dst" ] && status="(exists — will skip in adopt; rerender in update; overwrite in bootstrap)"
  echo "    - $(basename "$src") → ${dst#$VAULT_PATH/} $status"
done
echo "  Vault scaffold (dirs): identity/ projects/ council/ inbox/ logging/"
echo "  Global block: ~/.claude/CLAUDE.md (append fenced exmachina block)"
echo ""

if [ "$DRY_RUN" = 1 ]; then
  echo "  --dry-run: not writing. Exit."
  exit 0
fi

if ! ask_yn "  Proceed" "y"; then
  echo "  Aborted by user."
  exit 0
fi

# ─── Write ───────────────────────────────────────────────────────────────────
mkdir -p "$VAULT_PATH"/{identity,projects,council,inbox,logging,.exmachina}

for src in "${!WRITES[@]}"; do
  dst="${WRITES[$src]}"
  if [ -f "$dst" ]; then
    case "$MODE" in
      adopt)
        echo "  skip (exists, adopt mode): ${dst#$VAULT_PATH/}"
        continue
        ;;
      bootstrap)
        : # overwrite
        ;;
      update)
        : # re-render
        ;;
    esac
  fi
  mkdir -p "$(dirname "$dst")"
  node "$RENDER" "$src" "$ANSWERS_FILE" "$dst" 2>&1 | grep -v "^render: wrote" || true
  echo "  wrote: ${dst#$VAULT_PATH/}"
done

# Install metadata
cat > "$VAULT_PATH/.exmachina/version.json" <<EOF
{
  "exmachina_version": "$VERSION",
  "installed_at": "$INSTALL_DATE",
  "mode": "$MODE",
  "ai_name": "$AI_NAME",
  "user_name": "$USER_NAME"
}
EOF

# ─── Write the global fenced block ───────────────────────────────────────────
GLOBAL_CLAUDE="$HOME/.claude/CLAUDE.md"
mkdir -p "$(dirname "$GLOBAL_CLAUDE")"
GLOBAL_RENDERED="$(node "$RENDER" "$TEMPLATES_DIR/tier-0.global.template.md" "$ANSWERS_FILE")"

if [ -f "$GLOBAL_CLAUDE" ]; then
  # Strip any existing exmachina block (idempotency).
  TMPFILE="$(mktemp)"
  awk '
    BEGIN { skip = 0 }
    /<!-- exmachina:start/ { skip = 1; next }
    /<!-- exmachina:end -->/ { skip = 0; next }
    skip == 0 { print }
  ' "$GLOBAL_CLAUDE" > "$TMPFILE"
  # Append fresh block.
  printf "\n%s\n" "$GLOBAL_RENDERED" >> "$TMPFILE"
  mv "$TMPFILE" "$GLOBAL_CLAUDE"
  echo "  updated: ~/.claude/CLAUDE.md (fenced exmachina block refreshed)"
else
  printf "%s\n" "$GLOBAL_RENDERED" > "$GLOBAL_CLAUDE"
  echo "  created: ~/.claude/CLAUDE.md (with fenced exmachina block)"
fi

# ─── Done ────────────────────────────────────────────────────────────────────
cat <<EOF

  ✓ Phase 1 complete.

  Vault: $VAULT_PATH
  AI partner: $AI_NAME

  Next steps:
    1. cd "$VAULT_PATH"
    2. Open Claude Code in this folder
    3. Try: "good morning"
    4. Edit identity/user.md to calibrate working style, domains, boundaries

  When you're ready for the workspace database (kanban, projects, calendar):
    Run installer/phase2-supabase.sh — coming in v0.2.1.

EOF
