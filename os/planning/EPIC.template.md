# Epic: {{Epic Name}}

> One-sentence summary of what this epic ships.

**Sprint**: [{{Sprint Name}}](../../SPRINT.md)
**Project**: [{{Project Name}}](../../../../PROJECT.md)
**Status**: defined | in_progress | closed | cancelled
**Council post-epic review**: {{link to council-review.md, or "pending"}}

---

## Mission

What this epic is making true. One paragraph. The cards below add up to this.

## Why This Is One Epic

What makes these cards belong together — they ship together, they share context, they fail together if any one fails. If the answer is "they don't really," split into multiple epics.

## Cards

The dispatchable units that make up this epic. Each card has its own folder and `CARD.md`.

- [ ] [Card: {{title}}](cards/{{card-slug}}/CARD.md) — `draft` | `ready` | `dispatched` | `in_review` | `closed`
- [ ] [Card: {{title}}](cards/{{card-slug}}/CARD.md) — `draft`
- [ ] [Card: {{title}}](cards/{{card-slug}}/CARD.md) — `draft`

## Acceptance

What needs to be true for this epic to close. Different from card-level acceptance; this is the epic-level integration check.

- {{acceptance criterion}}
- {{acceptance criterion}}

## Open Questions

Questions that don't block epic kickoff but need answers before specific cards dispatch.

- {{question}}

## Council Post-Epic Review

Written when the epic closes (lifecycle step 11). Each construct rules; Abathur extracts learnings. Output is `council-review.md` in this folder.

> Filled in by Council at epic close.

---

## Notes for dea (not part of the brief)

- **DB-owned state**: id, tenant_id, sprint_id, status, council_review_id, timestamps. Lives in `epics` row.
- **Markdown-owned content**: mission, "why this is one epic" rationale, acceptance prose.
- **Closing the epic**: requires Council post-epic review (`council_reviews` row + `council-review.md`). All cards must be `closed` or `cancelled` first.
