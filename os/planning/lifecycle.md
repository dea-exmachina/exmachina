# Lifecycle — From Idea to Archive

The 13-step protocol that takes a problem from "George had a thought" to "the work shipped, the team was reviewed, the system learned something." Every project flows through this. Most steps are automatic; some require Council; one requires George.

---

## The 13 Steps

| # | Step | Who acts | What lands |
|---|------|----------|------------|
| 1 | Idea / problem captured | dea (from inbox or surfaced from work) | An entry in `inbox/` or a draft note |
| 2 | `/plan` workflow | dea (picks framework from `os/governance/frameworks/library.md`, drafts `PROJECT.md`) | Draft `PROJECT.md` in proposed project folder |
| 3 | Pre-decision Council review (if stakes warrant) | Council (each construct rules; dea synthesizes) | `<project>.council.md` with verdicts + Kerrigan synthesis |
| 4 | Project approved | George (final say) → dea | `projects` row INSERT; `PROJECT.md` committed; `.project.json` written |
| 5 | Sprints planned | dea (with George) | `sprints` rows; `SPRINT.md` files in `<project>/sprints/<sprint-id>/` |
| 6 | Epics defined | dea | `epics` rows; `EPIC.md` files inside each sprint folder |
| 7 | Cards drafted | dea (one card = one dispatchable mission) | `cards` rows; `CARD.md` files inside each epic folder |
| 8 | Hirer dispatched | dea → Architect's Hirer role | Team shape designed (lead + members); roles instantiated from `os/agents/roles/` |
| 9 | Team executes | Team lead → members | `dispatches` row; agent outputs returned through lead → dea → George |
| 10 | Card closes | dea (quality gate) → George (accept) | `cards.status = closed`; outcome recorded; agent performance noted |
| 11 | Epic closes | Council (post-epic review) | `council_reviews` row; `<epic>.council.md` written; learnings extracted |
| 12 | Sprint closes | dea (retrospective) | Sprint retro markdown; learnings flagged for Abathur |
| 13 | Project archives | George (when truly done) | `projects.status = archived`; agents promoted into `talent-pool/` if warranted |

---

## State Machines

### Project states

```
draft → approved → active → archived
                 ↘ cancelled
```

- `draft` — `PROJECT.md` exists, not yet approved by George
- `approved` — Council pre-decision passed (or skipped); George said yes; row inserted
- `active` — at least one sprint is planned; work is happening
- `archived` — all work shipped; outcomes recorded; no further activity expected
- `cancelled` — abandoned before completion (legitimate state; record why)

### Sprint states

```
planned → active → closed
                 ↘ cancelled
```

- `planned` — sprint has goal + dates; epics may or may not be defined yet
- `active` — within the sprint window
- `closed` — sprint window ended; retrospective written
- `cancelled` — sprint dissolved (project paused, scope changed)

### Epic states

```
defined → in_progress → closed
                       ↘ cancelled
```

- `defined` — `EPIC.md` exists with mission + cards listed
- `in_progress` — at least one card is open or in dispatch
- `closed` — all cards closed; Council post-epic review complete; `council_reviews` row written
- `cancelled` — abandoned (record why)

### Card states

```
draft → ready → dispatched → in_review → closed
                                       ↘ blocked
                                       ↘ cancelled
```

- `draft` — `CARD.md` exists but not yet dispatchable (mission unclear, dependencies unresolved)
- `ready` — Hirer can pick this up; dependencies met
- `dispatched` — `dispatches` row written; team is executing
- `in_review` — agent output returned; dea is quality-gating
- `closed` — output accepted by George; outcome recorded; agent performance noted
- `blocked` — waiting on something external; record blocker
- `cancelled` — work abandoned; record why

### Dispatch states (separate from cards)

```
dispatched → returned → accepted
                      ↘ rejected (loop back to dispatched with feedback)
```

A card can have multiple dispatch attempts. Each attempt is a `dispatches` row. The card itself moves to `closed` only when a dispatch is `accepted`.

---

## The Markdown ↔ DB Sync Contract (locked v0.2.1)

This is the operational rule that makes the dual-storage pattern work. Read it twice.

### One-way per field

Every field belongs to **either** the DB or the markdown — not both. No bidirectional sync. No "DB is the cache of markdown" or "markdown is the render of DB." Each field has exactly one writer.

### What the DB owns (state)

- `id`, `tenant_id`, all foreign keys
- `status` (project/sprint/epic/card state)
- `created_at`, `updated_at`, `closed_at`
- `scope`, `scoped_paths` (project-level)
- `dispatch_id`, `council_review_id` linkages
- `*_md_path` — the pointer to the markdown file
- Timestamps and counters of any kind
- Anything used in a query (filtering, sorting, indexing)

**Read by**: dea, agents, the (future) UI, MCP queries.
**Written by**: dea, the (future) UI, installer seed scripts. **Never written by humans editing markdown.**

### What the markdown owns (content)

- Mission statement, problem framing, narrative
- Description, body, notes, rationale
- Acceptance criteria written in prose
- Cross-links between docs
- Anything a human reads or writes by hand

**Read by**: dea, George, agents (when given the file path).
**Written by**: George (directly), dea (drafting/updating). **Never written by the DB layer.**

### Drift is acceptable in v0.2.x

There is no UI yet writing content fields back into the DB. There is no markdown watcher syncing edits into rows. If George edits `CARD.md` while the `cards.status` is `dispatched`, nothing reconciles. **That's fine** — content fields aren't queried; state fields aren't human-edited.

### When fields would otherwise overlap

If a field feels like it could be in both places (e.g., card title), put it in the DB and let markdown reference it. The `CARD.md` template uses the title as a heading, but the canonical source is the row. This avoids "I renamed the card in markdown but the DB still says X."

### v0.2.2+ revisit

If the UI starts writing content fields (e.g., a kanban-side editor lets George edit description), that's when `content_synced_at` / `markdown_hash` columns earn their way in. Not now.

---

## Folder Layout (per project)

```
<vault>/<project-name>/
├── PROJECT.md                      # canonical project brief (markdown-owned content)
├── .project.json                   # DB linkage + scope mirror (DB-owned state)
├── sprints/
│   └── <sprint-id>/
│       ├── SPRINT.md
│       ├── retro.md                # written at sprint close
│       └── epics/
│           └── <epic-id>/
│               ├── EPIC.md
│               ├── council-review.md  # written at epic close
│               └── cards/
│                   └── <card-id>/
│                       ├── CARD.md
│                       └── dispatch-<n>.md   # one per dispatch attempt
```

IDs in path segments are short slugs (e.g., `2026-q2-w1` for sprints, `auth-rewrite` for epics, `add-rls-policies` for cards). The DB row stores the UUID; the slug lives in path + `*_md_path`.

---

## Trigger Points That Cross Layers

These are the moments where planning, governance, and agents intersect. Worth marking explicitly.

| Lifecycle step | Layer crossed | What happens |
|----------------|---------------|--------------|
| Step 3 (pre-decision review) | governance ← planning | Council convenes; verdict attaches to project |
| Step 8 (Hirer dispatched) | agents ← planning | Architect's Hirer role reads `CARD.md`, designs team |
| Step 11 (post-epic review) | governance ← planning | Council convenes; `council_reviews` row links to epic |
| Step 13 (project archives) | agents ← planning | Architect surfaces excelling agents for promotion to talent pool |

Anywhere else, the layers stay in their lanes.

---

## What's Out of Scope for This Doc

- **The framework library** (which framework dea picks for `/plan`) — see `os/governance/frameworks/library.md`.
- **Council convocation mechanics** — see `os/governance/council/README.md`.
- **Agent factory + Hirer** — see `os/agents/factory.md`.
- **Schema details** (column types, RLS policies) — see `exmachina.wiki/v021-prep.md`.
- **Plan → Cards transformation** — see `plan-to-cards.md`.

This doc is the protocol. The other docs are the mechanics.
