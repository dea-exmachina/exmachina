# Sprint: {{Sprint Name}}

> One-sentence summary of what this sprint is pushing.

**Project**: [{{Project Name}}](../../PROJECT.md)
**Status**: planned | active | closed | cancelled
**Window**: {{ISO start}} → {{ISO end}}
**Goal**: {{what "this sprint succeeded" looks like}}

---

## Goal

The single thing this sprint is trying to make true. Sharper than the project mission. Achievable inside the window.

## Scope

The epics that fit inside this sprint. If something doesn't fit, it goes to a later sprint or back to the project's open questions.

- [ ] [Epic: {{name}}](epics/{{epic-slug}}/EPIC.md) — `defined`
- [ ] [Epic: {{name}}](epics/{{epic-slug}}/EPIC.md) — `defined`

## Out of Sprint

What's been deferred. Helpful context for the retro.

- {{deferred item}}

## Dependencies

What needs to be true outside this sprint for the work to land. External blockers, prerequisite work in other projects, decisions awaiting George.

- {{dependency}}

## Risks (sprint-specific)

If a risk is project-wide, it belongs in `PROJECT.md`. Put sprint-specific risks here.

- {{risk}}

## Retrospective

Written at sprint close (status moves to `closed`). What shipped, what slipped, what to keep doing, what to stop. Learnings flagged for Abathur live here.

> Filled in at step 12 of the lifecycle.

---

## Notes for dea (not part of the brief)

- **DB-owned state**: id, tenant_id, project_id, status, starts_at, ends_at, timestamps. Lives in `sprints` row.
- **Markdown-owned content**: goal, scope description, retro narrative.
- **When status changes**: dea updates the row.
