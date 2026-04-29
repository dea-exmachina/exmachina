# {{Project Name}}

> One-sentence elevator pitch — what this project is and why it exists.

**Status**: draft | approved | active | archived | cancelled
**Scope**: open | scoped | isolated
**Owner**: {{user}}
**Started**: {{ISO date}}
**Council pre-decision**: {{link to <project>.council.md, or "not run"}}

---

## Mission

What this project is trying to make true. Two or three sentences. Stays stable — if the mission changes, it's a new project.

## Problem

The pain that exists today. Concrete. Whose problem is it. What does the status quo cost.

## Premises

The things that must be true for this project to make sense. Numbered, agreeable.

1. {{premise}}
2. {{premise}}
3. {{premise}}

## Out of Scope

What this project explicitly is NOT trying to do. Prevents scope creep at every layer below (sprints, epics, cards inherit this).

- {{out-of-scope item}}
- {{out-of-scope item}}

## Success Criteria

Measurable. If these are true, the project shipped.

- {{criterion}}
- {{criterion}}

## Approach

The strategy at the project level — not the implementation. Architecture, sequencing notes, key tradeoffs already made.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| {{risk}} | Low / Med / High | Low / Med / High | {{plan}} |

## Sprints

Linked as they are planned. Each sprint folder contains its own `SPRINT.md`.

- [ ] [Sprint 1: {{name}}](sprints/{{sprint-slug}}/SPRINT.md) — `planned`
- [ ] [Sprint 2: {{name}}](sprints/{{sprint-slug}}/SPRINT.md) — `planned`

## Open Questions

Questions that don't block project approval but need answers before specific sprints begin.

- {{question}}
- {{question}}

---

## Notes for dea (not part of the brief)

- **DB-owned state** (don't edit here): id, tenant_id, status, scope, scoped_paths, timestamps. Lives in `projects` row + `.project.json` mirror.
- **Markdown-owned content** (edit freely): everything above this notes section.
- **When the project is approved**: dea inserts the `projects` row and writes `.project.json` next to this file.
- **When status changes**: dea updates the row + `.project.json`. The `Status` line at the top of this doc may drift; that's allowed in v0.2.x.
