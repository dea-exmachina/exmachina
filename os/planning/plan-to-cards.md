# Plan → Cards — The Transformation Protocol

How an approved `/plan` output becomes a seeded structure of sprints, epics, and cards. This is the bridge between "we agreed on what to build" and "Hirer can dispatch a team."

---

## When This Runs

After lifecycle step 4 (project approved). The `PROJECT.md` is committed, the `projects` row exists, and George said yes. Now dea breaks the work down.

This is **not** a /plan run — that already happened. This is the structural decomposition that follows.

---

## The Inputs

dea has on hand:
- `PROJECT.md` (mission, premises, success criteria, approach)
- The pre-decision `<project>.council.md` (if Council reviewed)
- The framework that was used (from `os/governance/frameworks/library.md`)
- The project's `scope` setting (open / scoped / isolated) — affects what context dea can pull when drafting cards

---

## The Five Moves

### Move 1 — Identify Sprints

Read `PROJECT.md`'s Approach + Success Criteria. Group the work into time-boxed pushes. A sprint should:

- Have one clear goal that maps to a meaningful chunk of the project's success criteria
- Fit in 1-2 weeks of calendar time (rule of thumb; not enforced)
- Be reviewable as a unit (you can tell at the end whether the goal was met)

Draft `sprints/<sprint-slug>/SPRINT.md` for each sprint using `SPRINT.template.md`. Status `planned`. Insert `sprints` rows.

**Common mistake**: making the first sprint "scaffolding" and the second "real work." If the scaffolding is real work, scope it as part of a real epic. If it's not real work, it doesn't need a sprint — fold it into a card in sprint 1.

### Move 2 — Identify Epics Per Sprint

For each sprint, decompose the goal into epics. An epic is **work that ships together** — cards that share context, fail together, succeed together. An epic should:

- Have a single mission that's narrower than the sprint goal
- Contain 2-7 cards (rule of thumb; one card means it's not really an epic, ten cards means split it)
- Be coherent enough that Council can review it as a unit at close

Draft `sprints/<sprint-slug>/epics/<epic-slug>/EPIC.md` using `EPIC.template.md`. Status `defined`. Insert `epics` rows.

**Common mistake**: epics defined by *layer* (e.g., "frontend," "backend," "tests"). That makes nothing ship. Epics defined by *outcome* (e.g., "users can authenticate") integrate cleanly.

### Move 3 — Decompose Epics Into Cards

For each epic, draft cards. A card is **one dispatchable mission** — one team, one outcome, one acceptance check. A card should:

- Be actionable by an agent team that has read only the card and the linked context (no project-wide telepathy required)
- Have testable acceptance criteria
- Have dependencies named explicitly
- Fit the project's scope — if the project is `scoped` or `isolated`, the card cannot require context the agent can't see

Draft `sprints/<sprint-slug>/epics/<epic-slug>/cards/<card-slug>/CARD.md` using `CARD.template.md`. Initial status `draft`. Insert `cards` rows.

**Common mistake**: writing cards that say "implement X" without context. The card must include the context an agent who lands cold needs to act faithfully.

### Move 4 — Resolve Dependencies and Move to `ready`

Walk the cards and mark each one's dependencies in its `Dependencies` section. For each card with no unresolved dependencies (or whose dependencies are external work already done), move status from `draft` to `ready`. Update the `cards` row.

**Common mistake**: marking cards `ready` before their suggested team shape is drafted. Hirer needs that to start. If the team shape is unclear, the card stays `draft` until dea figures it out (possibly with George's input).

### Move 5 — Surface to George

Present the breakdown. dea writes a short summary at the top of `PROJECT.md`'s Sprints section (or in a dedicated `breakdown-summary.md` if the project is large) and tells George:

- How many sprints, epics, cards landed
- Which cards are `ready` to dispatch (Move 4 graduates) and which are still `draft`
- Where dea has open questions (cards that couldn't be decomposed cleanly)

George can re-shape (combine, split, defer) before any dispatch happens.

---

## What Plan → Cards Does NOT Do

- **Does not dispatch.** Dispatch is lifecycle step 8, after the breakdown is reviewed.
- **Does not write `dispatches` rows.** Those land at dispatch time, one per attempt.
- **Does not seed Council reviews.** Pre-decision happened in step 3 (before this); post-epic happens in step 11 (after epic close).
- **Does not bypass George.** Every transformation is a draft until George ack's it.

---

## Idempotency

This protocol is re-runnable. If the project's plan changes (rare; usually means it's a new project), dea can re-run plan → cards on the updated `PROJECT.md`. Existing rows for sprints/epics/cards stay; new ones get added; cancelled ones get `status: cancelled` (never deleted — the events table needs to retain history).

The DB is the canonical truth for what got seeded. Markdown files are written to match. If a re-run produces a duplicate slug, dea appends a numeric suffix (`auth-rewrite-2`).

---

## Example (abbreviated)

```
PROJECT.md          : "v0.2.1 — Workspace + Planning Module"
                       Success criteria include: schema applied, installer works, Atalas seeded

Move 1 → 2 sprints  : "Schema + planning docs" (week 1), "Atalas dogfood" (week 2)

Move 2 → 5 epics    : Sprint 1: ["os/planning markdown", "Schema design", "Migration files", "Phase 2 installer skeleton"]
                       Sprint 2: ["Sandbox dogfood", "Atalas dogfood + integration"]

Move 3 → ~20 cards   : e.g., "Write os/planning/README.md", "Write os/planning/lifecycle.md", "Design tenants table",
                       "Write migration 0001_init.sql", "Write Phase 2 prompts", "Run Phase 2 sandbox", ...

Move 4 → 6 ready    : First few cards in Sprint 1 (no upstream deps); rest stay draft until prereqs land

Move 5             : dea presents breakdown; George ack's; dispatch begins on the `ready` set
```

This is exactly what was done at v0.2.1 kickoff. The protocol works because it's been used.

---

## Flywheel Extension (v0.2.2+)

`dea-ingest-plan` is the programmatic execution of this protocol. It reads a `council-approved` plan.md and runs all 5 moves in a single Supabase transaction via `ingest_plan()`.

**Schema correction (2026-05-01)**: The original flywheel design doc showed epics wrapping sprints in plan.md. This was corrected — the canonical plan.md schema uses **sprint → epic → card** heading hierarchy, matching the DB structure (`sprints.project_id` → `epics.sprint_id` → `cards.epic_id`). The corrected schema is in `Skills.wiki/skills/dea-plan/skill.md`.

**Field mapping** at ingestion (plan.md → DB):
| plan.md field | DB column | Notes |
|---------------|-----------|-------|
| sprint/epic/card `id:` | `slug` | Also written to `plan_id` for upsert tracking |
| sprint/epic `title` (heading) | `name` | Heading text, prefix stripped |
| card `title` (heading) | `title` | |
| `type`, `priority`, `effort`, `acceptance_criteria`, `depends_on` | `description` | Serialized as structured text; no separate DB columns |
| `agent_role` | `assigned_agent_role` | Used by Sprint 3 `dea-hire` for Hirer dispatch |
