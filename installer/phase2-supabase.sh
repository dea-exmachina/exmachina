#!/usr/bin/env bash
# phase2-supabase.sh — exmachina installer Phase 2: Workspace database
#
# Provisions the per-tenant Supabase workspace: links a project, applies the
# v0.2.1 migration suite, generates TypeScript types, writes a vault-scope
# .env, registers the Supabase MCP for this vault, and optionally seeds a
# tenants row.
#
# Idempotent: re-running updates the link, re-pushes migrations, refreshes
# types, and rewrites .env / .mcp.json without duplicating entries.
#
# Modes: bootstrap (default) | --link-only | --dry-run | --skip-mcp | --seed-tenant

set -euo pipefail

# ─── Locate exmachina ────────────────────────────────────────────────────────
EXMACHINA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUPABASE_DIR="$EXMACHINA_DIR/apps/control-center/supabase"
VERSION="$(cat "$EXMACHINA_DIR/VERSION" 2>/dev/null || echo "0.2.1")"

# Pinned minimum Supabase CLI version (per v0.2.1 lock-in plan D2).
SUPABASE_CLI_MIN="2.0.0"

# ─── Parse flags ─────────────────────────────────────────────────────────────
MODE="bootstrap"
DRY_RUN=0
SKIP_MCP=0
SEED_TENANT=0
USE_PLUGIN_MCP=0
for arg in "$@"; do
  case "$arg" in
    --link-only)        MODE="link-only" ;;
    --dry-run)          DRY_RUN=1 ;;
    --skip-mcp)         SKIP_MCP=1 ;;
    --seed-tenant)      SEED_TENANT=1 ;;
    --use-plugin-mcp)   USE_PLUGIN_MCP=1 ;;
    -h|--help)
      cat <<'EOF'
phase2-supabase.sh — Provision the workspace database for a tenant.

Usage:
  phase2-supabase.sh [--link-only] [--skip-mcp] [--use-plugin-mcp]
                     [--seed-tenant] [--dry-run]

Flags:
  (default)         bootstrap — link, push migrations, gen types, write .env, register MCP
  --link-only       only link the project; skip migrations + types + MCP
  --skip-mcp        skip MCP registration entirely (manual wire later)
  --use-plugin-mcp  user already has the Claude Code plugin:supabase MCP at
                    user-scope; skip writing a vault-scope .mcp.json. Vault metadata
                    (.exmachina/version.json phase2 block) still gets written so dea
                    can resolve project_ref from inside the vault.
  --seed-tenant     also seed a tenants row + first user row after migrations
  --dry-run         show plan, write nothing, run no migrations

Prereqs:
  - Phase 1 has run against the target vault (.exmachina/version.json exists)
  - Supabase CLI >= $SUPABASE_CLI_MIN on PATH
  - A Supabase project (URL, project ref, anon key, service role key) ready

EOF
      exit 0
      ;;
    *) echo "phase2: unknown flag $arg" >&2; exit 1 ;;
  esac
done

# ─── Prompt helpers (mirror Phase 1) ─────────────────────────────────────────
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

ask_secret() {
  local prompt="$1"; local var
  while [ -z "${var:-}" ]; do read -r -s -p "$prompt: " var; echo "" >&2; done
  echo "$var"
}

ask_yn() {
  local prompt="$1"; local default="${2:-n}"; local var
  read -r -p "$prompt [y/n] (default: $default): " var
  var="${var:-$default}"
  case "$var" in y|Y|yes|YES) return 0 ;; *) return 1 ;; esac
}

# ─── Pre-flight checks ───────────────────────────────────────────────────────
command -v node     >/dev/null || { echo "phase2: Node 20+ required, not found" >&2; exit 1; }
command -v git      >/dev/null || { echo "phase2: git required, not found" >&2; exit 1; }
command -v supabase >/dev/null || {
  echo "phase2: Supabase CLI not found." >&2
  echo "       Install: https://supabase.com/docs/guides/cli/getting-started" >&2
  exit 1
}

# Version pin check (lock-in D2)
SUPABASE_CLI_VER="$(supabase --version 2>/dev/null | awk '{print $NF}' | sed 's/^v//')"
ver_ge() {  # ver_ge "$have" "$need" → 0 if have >= need
  [ "$(printf '%s\n%s' "$2" "$1" | sort -V | head -n1)" = "$2" ]
}
if ! ver_ge "$SUPABASE_CLI_VER" "$SUPABASE_CLI_MIN"; then
  echo "phase2: Supabase CLI $SUPABASE_CLI_VER < required $SUPABASE_CLI_MIN" >&2
  echo "       Upgrade: https://supabase.com/docs/guides/cli/getting-started" >&2
  exit 1
fi

# Migration directory check
[ -d "$SUPABASE_DIR/migrations" ] || {
  echo "phase2: migrations dir missing at $SUPABASE_DIR/migrations" >&2
  exit 1
}

# ─── Banner ──────────────────────────────────────────────────────────────────
cat <<EOF

  exmachina — installer phase 2 (workspace database)
  ──────────────────────────────────────────────────
  exmachina version:  $VERSION
  exmachina source:   $EXMACHINA_DIR
  supabase CLI:       $SUPABASE_CLI_VER (min $SUPABASE_CLI_MIN ✓)
  mode:               $MODE$([ "$DRY_RUN" = 1 ] && echo " (dry-run)")

EOF

# ─── Locate the target vault ─────────────────────────────────────────────────
echo "▶ Which vault is this for?"
echo ""

DEFAULT_VAULT="${VAULT:-$HOME/vault}"
if [ -f "$PWD/.exmachina/version.json" ]; then
  DEFAULT_VAULT="$PWD"
fi
VAULT_PATH="$(ask 'Vault path (absolute)' "$DEFAULT_VAULT")"
VAULT_PATH="$(cd "$(dirname "$VAULT_PATH")" 2>/dev/null && pwd)/$(basename "$VAULT_PATH")"

[ -f "$VAULT_PATH/.exmachina/version.json" ] || {
  echo "phase2: $VAULT_PATH does not look like an exmachina vault (no .exmachina/version.json)." >&2
  echo "       Run Phase 1 first: bash installer/phase1-identity.sh" >&2
  exit 1
}
VAULT_NAME="$(basename "$VAULT_PATH")"

# ─── Gather Supabase credentials ─────────────────────────────────────────────
echo ""
echo "▶ Supabase project credentials"
echo ""
echo "  Per-tenant model: this vault links to ONE Supabase project."
echo "  Get these from https://supabase.com/dashboard → your project → Settings → API."
echo ""

SUPABASE_PROJECT_REF="$(ask 'Project ref (the abc123 part of the URL)')"
SUPABASE_URL="$(ask 'Project URL' "https://${SUPABASE_PROJECT_REF}.supabase.co")"
SUPABASE_ANON_KEY="$(ask_secret 'Anon (publishable) key')"
SUPABASE_SERVICE_KEY="$(ask_secret 'Service role (secret) key')"

# PAT only needed when registering a vault-scope MCP (not when --use-plugin-mcp
# or --skip-mcp). The MCP server authenticates with a Personal Access Token
# from https://supabase.com/dashboard/account/tokens — NOT the service role key.
SUPABASE_PAT=""
if [ "$SKIP_MCP" = 0 ] && [ "$USE_PLUGIN_MCP" = 0 ]; then
  echo ""
  echo "  Vault-scope MCP needs a Personal Access Token (PAT), not the service"
  echo "  role key. Get one at https://supabase.com/dashboard/account/tokens"
  SUPABASE_PAT="$(ask_secret 'Supabase Personal Access Token (sbp_...)')"
fi

echo ""
echo "▶ Tenant identity"
echo ""

TENANT_NAME="$(ask 'Tenant name (display)' "$VAULT_NAME")"
DEFAULT_SLUG="$(echo "$VAULT_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-\|-$//g')"
TENANT_SLUG="$(ask 'Tenant slug (lowercase, alphanumeric + dash)' "$DEFAULT_SLUG")"

# ─── Plan ────────────────────────────────────────────────────────────────────
echo ""
echo "▶ Plan"
echo ""
echo "  Vault:              $VAULT_PATH ($MODE mode)"
echo "  Supabase project:   $SUPABASE_URL (ref: $SUPABASE_PROJECT_REF)"
echo "  Tenant:             $TENANT_NAME (slug: $TENANT_SLUG)"
echo "  Migrations source:  $SUPABASE_DIR/migrations"
echo "  Migrations to apply: $(ls -1 "$SUPABASE_DIR/migrations"/*.sql 2>/dev/null | wc -l | tr -d ' ') file(s)"
echo "  Steps:"
echo "    1. supabase link --project-ref $SUPABASE_PROJECT_REF"
case "$MODE" in
  bootstrap)
    echo "    2. supabase db push (apply migrations)"
    echo "    3. supabase gen types typescript --linked > $VAULT_PATH/.exmachina/types/database.ts"
    echo "    4. write $VAULT_PATH/.env (gitignored)"
    if [ "$SKIP_MCP" = 1 ]; then
      echo "    5. (MCP registration skipped — --skip-mcp)"
    elif [ "$USE_PLUGIN_MCP" = 1 ]; then
      echo "    5. (vault-scope .mcp.json skipped — using user-scope plugin:supabase)"
    else
      echo "    5. register vault-scope MCP at $VAULT_PATH/.mcp.json"
    fi
    [ "$SEED_TENANT" = 1 ] && echo "    6. seed tenants + users rows"
    ;;
  link-only)
    echo "    (link only — no migrations, no types, no MCP, no .env)"
    ;;
esac
echo ""

if [ "$DRY_RUN" = 1 ]; then
  echo "  --dry-run: not writing. Exit."
  exit 0
fi

if ! ask_yn "  Proceed" "y"; then
  echo "  Aborted by user."
  exit 0
fi

# ─── Step 1: Link the project ────────────────────────────────────────────────
echo ""
echo "▶ Linking Supabase project"
(cd "$SUPABASE_DIR/.." && supabase link --project-ref "$SUPABASE_PROJECT_REF")

if [ "$MODE" = "link-only" ]; then
  echo ""
  echo "  ✓ Link complete. Migrations and config not applied (link-only)."
  exit 0
fi

# ─── Step 2: Apply migrations ────────────────────────────────────────────────
echo ""
echo "▶ Applying migrations"
echo "  (this is non-destructive; existing migrations in the remote are untouched)"
(cd "$SUPABASE_DIR/.." && supabase db push)

# ─── Step 3: Generate TypeScript types ───────────────────────────────────────
TYPES_DIR="$VAULT_PATH/.exmachina/types"
mkdir -p "$TYPES_DIR"
echo ""
echo "▶ Generating TypeScript types → ${TYPES_DIR#$VAULT_PATH/}/database.ts"
(cd "$SUPABASE_DIR/.." && supabase gen types typescript --linked > "$TYPES_DIR/database.ts")
echo "  wrote: ${TYPES_DIR#$VAULT_PATH/}/database.ts"

# ─── Step 4: Write vault-scope .env ──────────────────────────────────────────
ENV_FILE="$VAULT_PATH/.env"
GITIGNORE="$VAULT_PATH/.gitignore"

# Idempotent .env update — set or replace each key without duplicating.
upsert_env() {
  local key="$1"; local val="$2"; local file="$3"
  touch "$file"
  if grep -q "^${key}=" "$file"; then
    # macOS sed and GNU sed differ; use a portable approach via awk.
    local tmp; tmp="$(mktemp)"
    awk -v k="$key" -v v="$val" 'BEGIN{FS=OFS="="} $1==k {print k "=" v; next} {print}' "$file" > "$tmp"
    mv "$tmp" "$file"
  else
    printf '%s=%s\n' "$key" "$val" >> "$file"
  fi
}

echo ""
echo "▶ Writing $VAULT_PATH/.env (vault-scope credentials)"
upsert_env "EXMACHINA_TENANT_SLUG" "$TENANT_SLUG" "$ENV_FILE"
upsert_env "EXMACHINA_TENANT_NAME" "\"$TENANT_NAME\"" "$ENV_FILE"
upsert_env "SUPABASE_URL" "$SUPABASE_URL" "$ENV_FILE"
upsert_env "SUPABASE_PROJECT_REF" "$SUPABASE_PROJECT_REF" "$ENV_FILE"
upsert_env "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "$ENV_FILE"
upsert_env "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_KEY" "$ENV_FILE"
chmod 600 "$ENV_FILE" 2>/dev/null || true

# Ensure .env is gitignored.
if [ -f "$GITIGNORE" ]; then
  grep -qxF '.env' "$GITIGNORE" || echo '.env' >> "$GITIGNORE"
else
  echo '.env' > "$GITIGNORE"
fi
echo "  wrote: .env (mode 600); .gitignore covers it"

# ─── Step 5: Register vault-scope MCP (or note plugin-MCP path) ─────────────
MCP_MODE="vault-scope"
if [ "$SKIP_MCP" = 1 ]; then
  MCP_MODE="skipped"
  echo ""
  echo "▶ MCP registration skipped (--skip-mcp). Wire manually later."
elif [ "$USE_PLUGIN_MCP" = 1 ]; then
  MCP_MODE="plugin"
  echo ""
  echo "▶ Using user-scope plugin:supabase MCP. No vault-scope .mcp.json written."
  echo "  dea will resolve the project_ref from $VAULT_PATH/.exmachina/version.json"
  echo "  on session start; pass it to MCP tool calls as the project_id argument."
else
  MCP_FILE="$VAULT_PATH/.mcp.json"
  echo ""
  echo "▶ Registering Supabase MCP at $VAULT_PATH/.mcp.json"

  MCP_NAME="supabase-${TENANT_SLUG}"
  # The Supabase MCP server expects a Personal Access Token in
  # SUPABASE_ACCESS_TOKEN, NOT the service role key. The PAT scopes to the
  # user's account; --project-ref pins the MCP to a single project.
  if [ -f "$MCP_FILE" ]; then
    node - "$MCP_FILE" "$MCP_NAME" "$SUPABASE_PROJECT_REF" "$SUPABASE_PAT" <<'JS'
const fs = require('fs');
const [, , file, name, ref, token] = process.argv;
let cfg;
try { cfg = JSON.parse(fs.readFileSync(file, 'utf8')); }
catch { cfg = {}; }
cfg.mcpServers = cfg.mcpServers || {};
cfg.mcpServers[name] = {
  command: "npx",
  args: ["-y", "@supabase/mcp-server-supabase@latest", `--project-ref=${ref}`],
  env: { SUPABASE_ACCESS_TOKEN: token }
};
fs.writeFileSync(file, JSON.stringify(cfg, null, 2) + "\n");
JS
  else
    cat > "$MCP_FILE" <<EOF
{
  "mcpServers": {
    "$MCP_NAME": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=$SUPABASE_PROJECT_REF"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "$SUPABASE_PAT"
      }
    }
  }
}
EOF
  fi
  chmod 600 "$MCP_FILE" 2>/dev/null || true
  echo "  registered: $MCP_NAME"
  echo "  Note: when CC opens a vault subfolder (project mode), verify the vault-root .mcp.json still loads."
  echo "        Day 6 acceptance check; document fallback if scope is launch-dir-only."
fi

# ─── Step 6: Optionally seed tenant row + default Council board ──────────────
# `--seed-tenant` writes:
#   - one tenants row (this vault's tenant)
#   - one principal users row
#   - one default Council board (is_default=true)
#   - the 6 default constructs as board_members (Kerrigan/Chair, Architect,
#     Abathur, Keeper, Zagara, Overseer) — every exmachina tenant gets these
#     as the starting cast. The user can add/remove/replace constructs after.
#
# Idempotent: ON CONFLICT clauses make re-runs safe.
if [ "$SEED_TENANT" = 1 ]; then
  echo ""
  echo "▶ Seeding tenant + principal user + default Council"

  TENANT_UUID="$(node -e "console.log(crypto.randomUUID())")"
  BOARD_UUID="$(node -e "console.log(crypto.randomUUID())")"
  USER_NAME="$(node -e "
    const fs=require('fs');
    try { const v=JSON.parse(fs.readFileSync('$VAULT_PATH/.exmachina/version.json','utf8'));
          console.log(v.user_name||''); } catch { console.log(''); }
  ")"

  if [ -z "$USER_NAME" ]; then
    USER_NAME="$(ask 'Display name for the principal user')"
  fi
  USER_EMAIL="$(ask 'Email for the principal user')"

  SEED_SQL="$(mktemp)"
  trap 'rm -f "$SEED_SQL"' EXIT
  cat > "$SEED_SQL" <<EOF
-- Tenant
INSERT INTO public.tenants (id, name, slug, governance_level, vault_path)
VALUES ('$TENANT_UUID', '$TENANT_NAME', '$TENANT_SLUG', 'tenant', '$VAULT_PATH')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, vault_path = EXCLUDED.vault_path
RETURNING id;

-- Principal user (id is a placeholder uuid; reconciles with auth.users.id on sign-in)
INSERT INTO public.users (id, tenant_id, email, display_name, role)
VALUES (gen_random_uuid(), '$TENANT_UUID', '$USER_EMAIL', '$USER_NAME', 'principal')
ON CONFLICT (tenant_id, email) DO UPDATE SET display_name = EXCLUDED.display_name;

-- Default Council board
INSERT INTO public.boards (id, tenant_id, name, slug, is_default)
VALUES ('$BOARD_UUID', '$TENANT_UUID', 'Council', 'council', true)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- The 6 default constructs (Kerrigan as Chair). Identity paths point at the
-- council/constructs/*.md files that Phase 1 lays down (or that the user has
-- since edited). Tenants can replace this cast freely after install.
INSERT INTO public.board_members
  (tenant_id, board_id, construct_name, seat, is_chair, identity_path, display_order)
VALUES
  ('$TENANT_UUID', '$BOARD_UUID', 'Kerrigan',  'Chair',         true,  'council/constructs/kerrigan.md', 0),
  ('$TENANT_UUID', '$BOARD_UUID', 'Architect', 'Architecture',  false, 'council/constructs/architect.md', 1),
  ('$TENANT_UUID', '$BOARD_UUID', 'Abathur',   'Knowledge',     false, 'council/constructs/abathur.md', 2),
  ('$TENANT_UUID', '$BOARD_UUID', 'Keeper',    'Trust',         false, 'council/constructs/keeper.md', 3),
  ('$TENANT_UUID', '$BOARD_UUID', 'Zagara',    'Flow',          false, 'council/constructs/zagara.md', 4),
  ('$TENANT_UUID', '$BOARD_UUID', 'Overseer',  'External',      false, 'council/constructs/overseer.md', 5)
ON CONFLICT (board_id, construct_name) DO NOTHING;
EOF

  (cd "$SUPABASE_DIR/.." && supabase db execute --file "$SEED_SQL")
  echo "  seeded: tenant ($TENANT_SLUG) + principal user ($USER_EMAIL)"
  echo "  seeded: default Council board with 6 constructs (Kerrigan, Architect, Abathur, Keeper, Zagara, Overseer)"
fi

# ─── Append phase 2 metadata ─────────────────────────────────────────────────
INSTALL_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
node - "$VAULT_PATH/.exmachina/version.json" "$INSTALL_DATE" "$SUPABASE_PROJECT_REF" "$SUPABASE_URL" "$TENANT_SLUG" "$TENANT_NAME" "$MCP_MODE" <<'JS'
const fs = require('fs');
const [, , file, when, ref, url, slug, name, mcpMode] = process.argv;
let v = {};
try { v = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
v.phase2 = {
  applied_at: when,
  supabase_project_ref: ref,
  supabase_url: url,
  tenant_slug: slug,
  tenant_name: name,
  mcp_mode: mcpMode
};
fs.writeFileSync(file, JSON.stringify(v, null, 2) + "\n");
JS

# ─── Done ────────────────────────────────────────────────────────────────────
cat <<EOF

  ✓ Phase 2 complete.

  Vault:           $VAULT_PATH
  Tenant slug:     $TENANT_SLUG
  Supabase ref:    $SUPABASE_PROJECT_REF
  Types:           .exmachina/types/database.ts
  Env:             .env (mode 600, gitignored)
  MCP mode:        $MCP_MODE$([ "$MCP_MODE" = "vault-scope" ] && echo " — server: supabase-$TENANT_SLUG")

  Next steps:
    1. cd "$VAULT_PATH"
    2. Open Claude Code; verify the supabase-$TENANT_SLUG MCP loaded
    3. Run smoke test: ask dea to "list tables in the workspace"
    4. If you skipped --seed-tenant, dea can write your tenants row from inside CC.

  Cross-tenant RLS leak test (recommended before dogfooding):
    See $SUPABASE_DIR/README.md → "Smoke Tests"

EOF
