# Control Center — Supabase Schema

The workspace database for an exmachina tenant. One Supabase project per tenant in v0.2.x; shared-with-RLS is a v0.3+ option.

This folder is the migration source of truth. The Phase 2 installer (`installer/phase2-supabase.sh`, lands Day 3) drives `supabase db push` against this directory.

---

## Layout

```
supabase/
├── config.toml                 # Supabase CLI project config
├── seed.sql                    # Sandbox fixtures (dev + CI smoke tests)
├── README.md                   # This file
└── migrations/
    ├── 20260428000001_extensions_and_tenancy.sql
    ├── 20260428000002_planning.sql
    ├── 20260428000003_agents.sql
    ├── 20260428000004_governance.sql
    └── 20260428000005_dispatches_and_events.sql
```

---

## Migration Sequence

Each migration is a logical unit; they apply in order. Splitting matches the OS layer's organization (planning, agents, governance, flow).

| # | File | Tables | Notes |
|---|------|--------|-------|
| 0001 | `extensions_and_tenancy.sql` | `tenants`, `users` | RLS helpers (`current_tenant_id()`, `touch_updated_at()`); `parent_tenant_id` + `governance_level` for nested-governance forward-compat |
| 0002 | `planning.sql` | `projects`, `sprints`, `epics`, `cards` | Connective tissue. Status state machines per `os/planning/lifecycle.md`. `*_md_path` pattern throughout. |
| 0003 | `agents.sql` | `agents`, `agent_jds` | Talent pool; promotion mechanics. |
| 0004 | `governance.sql` | `boards`, `board_members`, `council_reviews` | Per-tenant configurable Council; pre-decision + post-epic outputs. Backfills `epics.council_review_id`. |
| 0005 | `dispatches_and_events.sql` | `dispatches`, `events` + triggers | Audit trail. Backfills `cards.dispatch_id`. **Event-logging triggers attach here per Council pre-decision review** — events are part of migration #1, not bolted on later. |

13 tenant-scoped tables total. Every one has `tenant_id` as a NOT NULL FK and an RLS policy pair (select + modify) gated on `current_tenant_id()`.

---

## Sync Contract (markdown ↔ DB)

This schema is half of a dual-storage model. The other half is the vault markdown files. Locked v0.2.1 contract:

- **DB owns state**: ids, foreign keys, status, timestamps, scope, scoped_paths, dispatch/council linkages.
- **Markdown owns content**: mission, description, body, narrative, prose acceptance criteria.
- **Pointer column**: every entity row has `*_md_path` pointing at its canonical vault file.
- **No bidirectional sync** in v0.2.x. UI writing back to DB content fields earns `content_synced_at` / `markdown_hash` columns when it lands (v0.2.2+).

Full contract in `os/planning/lifecycle.md`.

---

## RLS Model

- **Every tenant-scoped table**: `ENABLE ROW LEVEL SECURITY` + select policy + modify policy, both gated on `tenant_id = public.current_tenant_id()`.
- **`current_tenant_id()` resolves from**: JWT claim `tenant_id` (browser clients) or session var `app.current_tenant_id` (server-side `SET`).
- **`service_role` bypasses RLS** (Supabase default) — used by the Phase 2 installer and by dea via MCP.
- **`events`**: SELECT-only for authenticated; writes happen exclusively through `log_event()` triggers running as `SECURITY DEFINER`.

Cross-tenant leak test fixtures live in `seed.sql` (two tenants pre-seeded).

---

## Applying Locally

```bash
cd D:/Vaults/exmachina/apps/control-center

# One-time: install supabase CLI (https://supabase.com/docs/guides/cli)
supabase --version  # verify install

# Spin up local stack (Docker required)
supabase start

# Apply migrations + seed
supabase db reset

# Generate TypeScript types (Day 2 deliverable)
supabase gen types typescript --local > types/database.ts
```

Local Studio is at http://127.0.0.1:54323 once `supabase start` completes.

---

## Smoke Tests (run after `db reset`)

```sql
-- Event triggers fired:
SELECT count(*) FROM events WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
-- expect >= 10

-- RLS denies cross-tenant reads:
SET app.current_tenant_id = '11111111-1111-1111-1111-111111111111';
SELECT count(*) FROM projects;  -- expect 1
SET app.current_tenant_id = '22222222-2222-2222-2222-222222222222';
SELECT count(*) FROM projects;  -- expect 1
SET app.current_tenant_id = '';
SELECT count(*) FROM projects;  -- expect 0 from authenticated role
```

CI hardening (cross-tenant leak as automated test) lands in Day 4-5 alongside the sandbox dogfood.

---

## Production Apply (per tenant)

Driven by the Phase 2 installer. Manual sequence (for reference):

```bash
supabase link --project-ref <tenant-project-ref>
supabase db push                                 # applies migrations to remote
# DO NOT run `db reset` against a remote — that wipes the database.
# Seeding is per-tenant via installer prompts, not from seed.sql.
```

---

## Working With This Schema From Inside CC

When dea (or any agent) needs to inspect or query this database from inside Claude Code, **use the Supabase MCP's purpose-built tools first**. They return structured results in one round-trip and are far cheaper than raw SQL.

| Need | Tool | Beats |
|------|------|-------|
| What tables/columns exist? | `list_tables` | `SELECT … FROM information_schema.tables` |
| What migrations are applied? | `list_migrations` | querying `supabase_migrations.schema_migrations` by hand |
| Which extensions are on? | `list_extensions` | `SELECT * FROM pg_extension` |
| Need TypeScript types? | `generate_typescript_types` | shelling out to `supabase gen types` |
| RLS / index / security review? | `get_advisors` | manual policy inspection |
| How does Supabase do X? | `search_docs` | guessing API shape |
| Edge function code? | `list_edge_functions`, `get_edge_function` | raw fs traversal |
| Per-branch state? | `list_branches`, `merge_branch`, `reset_branch` | manual CLI invocations |

**Rule**: reach for `execute_sql` only when no named tool fits. If you find yourself writing `SELECT * FROM information_schema.*`, stop — there's a tool for that.

The vault-scope MCP is named `supabase-<tenant-slug>` (registered by `installer/phase2-supabase.sh` into `<vault>/.mcp.json`).

---

## Open Items (tracked, not blocking Day 2)

- **CI cross-tenant leak test** — write a pgTAP or plain-SQL test that runs in GitHub Actions against a sandbox project. Day 4-5.
- **Type generation in installer** — Phase 2 installer should run `supabase gen types` and write to `types/database.ts` after `db push`.
- **Realtime publications** — none added yet. Add when the v0.2.2 UI needs subscriptions.
- **Storage buckets** — not configured. Vault files live on disk; no Storage need yet.
