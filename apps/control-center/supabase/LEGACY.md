# Legacy v0.1 Schema — Inventory

The Supabase project `wwwsktwddjmffrcbqiww` (exmachina) carries an archived v0.1-experimental schema as `legacy_*` tables. They are **read-only inspection material** — keep, mine, then delete. Not part of v0.2.1's API surface. Generated TypeScript types intentionally omit them.

This file exists only on this specific project (the others are greenfield).

---

## Why It's Here

The project was George's first attempt at building this system: a kanban model with cards, lanes, comments, an audit-event stream, and a context-wrapper hierarchy. The v0.2.1 redesign (REDESIGN per lock-in plan D1) chose not to translate it forward — but the kanban skeleton (lanes, card types, priorities, comment types, governance enums) is good design worth mining when the v0.2.2 UI is built.

Archived 2026-04-28 by [`20260428100000_archive_legacy_v01_schema.sql`](migrations/20260428100000_archive_legacy_v01_schema.sql). The migration:

1. Dropped 14 legacy functions with `CASCADE` (which removed their triggers and column DEFAULT clauses that called them).
2. Renamed 9 tables to `legacy_*`.
3. Renamed PK + UNIQUE constraints to `legacy_*_pkey` / `legacy_*_key` so they don't collide with v0.2.1 identically-named tables.
4. Renamed 10 enum types to `legacy_*_t`.

Foreign keys, CHECK constraints, and standalone `idx_*` indexes were left intact — they follow renamed tables automatically and don't conflict.

---

## What's In There

| Table | Rows (at archive) | Worth Mining For |
|-------|-------------------|------------------|
| `legacy_context_wrappers` | 1 | Hierarchy enum (`individual / team / department / organization / portfolio`) — useful for v0.3 nested governance |
| `legacy_projects` | 1 | `card_id_prefix`, `next_card_number` (per-project card numbering) — kanban convenience; `governance_config` jsonb for per-project surface/comment/assignee gates |
| `legacy_cards` | 2 | **Primary mining target.** Lane state (`backlog → ready → in_progress → review → done`), card_type, priority, delegation tag (AGENT/HUMAN), assigned_to, parent_id (sub-cards), tags, idempotency_key |
| `legacy_comments` | 8 | Comment types (`note / surface / directive / question / system`) — model for v0.2.2 card discussion |
| `legacy_events` | 170 | Event taxonomy (`card.created / card.moved / card.assigned / card.completed / comment.added` + 4 governance events). Live audit trail; the `payload` jsonb has real data |
| `legacy_agents` | 2 | `capabilities` text[], `instruction_set`, `visibility` enum |
| `legacy_agent_scores` | 0 | Performance EWMA model (`pending / trusted / probation / intervention`) |
| `legacy_plans` | 0 | Plan status enum (`draft / approved / executing / done / abandoned`) |
| `legacy_plan_cards` | 0 | Plan ↔ card join table |

---

## Inspection Recipes

Always use the Supabase MCP's named tools first (faster, cheaper than raw SQL). Reach for `execute_sql` only when no named tool fits.

```sql
-- What kanban states do real cards land in?
SELECT lane, count(*) FROM public.legacy_cards GROUP BY lane;

-- Real audit trail — what events actually fired?
SELECT event_type, count(*) AS n
FROM public.legacy_events
GROUP BY event_type
ORDER BY n DESC;

-- A specific card's full history (cards-as-aggregate-root pattern)
SELECT created_at, event_type, actor, payload
FROM public.legacy_events
WHERE card_id = '<some-uuid>'
ORDER BY created_at;

-- The governance gate enums (what was enforced at lane transitions)
SELECT unnest(enum_range(NULL::public.legacy_event_type_t)) AS event_type
WHERE unnest::text LIKE 'governance.%';

-- Comment-type frequency (do directives get used? questions?)
SELECT comment_type, count(*) FROM public.legacy_comments GROUP BY comment_type;
```

---

## Mining Targets for v0.2.2 UI

When the kanban UI lands in v0.2.2, these are worth porting:

1. **Lane enum** (`backlog / ready / in_progress / review / done`). Maps cleanly to v0.2.1 card status (`draft / ready / dispatched / in_review / closed`) but the legacy version has explicit `backlog` (todo before ready) and `done` (ship-confirmed) — could enrich the v0.2.1 status enum if needed.
2. **Card types** (`epic / task / bug / chore / research`). v0.2.1 doesn't model card type; just card. If the UI needs visual differentiation, port this enum.
3. **Comment types** (`note / surface / directive / question / system`). The "surface" type especially — explicit signaling of "I'm raising this for governance review" is a smart pattern.
4. **Governance gate events** (`governance.lane_skip_blocked`, `surface_missing`, `comment_required`, `assignee_required`). Patterns for what to validate at lane transitions.
5. **EWMA agent scoring** (`legacy_agent_scores.ewma`, `level` enum). v0.2.1's `agents.ewma_score` is a `numeric` placeholder; the legacy model has the full `pending → trusted → probation → intervention` flow worth studying when v0.3 implements promotion-by-performance.

---

## Cleanup (when ready)

Once mining is done — and after v0.2.2 ships and proves the new model works — drop the legacy tables. Future migration:

```sql
DROP TABLE public.legacy_plan_cards CASCADE;
DROP TABLE public.legacy_plans CASCADE;
DROP TABLE public.legacy_agent_scores CASCADE;
DROP TABLE public.legacy_agents CASCADE;
DROP TABLE public.legacy_events CASCADE;
DROP TABLE public.legacy_comments CASCADE;
DROP TABLE public.legacy_cards CASCADE;
DROP TABLE public.legacy_projects CASCADE;
DROP TABLE public.legacy_context_wrappers CASCADE;

DROP TYPE public.legacy_wrapper_kind_t;
DROP TYPE public.legacy_lane_t;
DROP TYPE public.legacy_card_type_t;
DROP TYPE public.legacy_priority_t;
DROP TYPE public.legacy_delegation_t;
DROP TYPE public.legacy_comment_type_t;
DROP TYPE public.legacy_event_type_t;
DROP TYPE public.legacy_visibility_t;
DROP TYPE public.legacy_score_level_t;
DROP TYPE public.legacy_plan_status_t;
```

Don't run this until you've extracted what you want. Once dropped, the 170 events and 8 comments are gone — there's no other copy.
