# {{Card Title}}

> One-sentence summary of the mission. What "done" looks like.

**Epic**: [{{Epic Name}}](../../EPIC.md)
**Sprint**: [{{Sprint Name}}](../../../../SPRINT.md)
**Project**: [{{Project Name}}](../../../../../../PROJECT.md)
**Status**: draft | ready | dispatched | in_review | closed | blocked | cancelled
**Latest dispatch**: {{link to dispatch-N.md, or "none"}}

---

## Mission

What the team this card dispatches needs to make true. Written so an agent who lands cold can act on it. Concrete. Bounded. One outcome.

## Context

What the team needs to know before they start. Links to relevant code, prior decisions, the parts of the project the agent should read first.

- {{context link or note}}
- {{context link or note}}

## Acceptance

How dea + George will know this card is done. Specific. Testable.

- {{acceptance criterion}}
- {{acceptance criterion}}

## Out of Scope

What this card explicitly is NOT doing. Prevents agents from drifting into adjacent work that belongs in another card.

- {{out-of-scope item}}

## Suggested Team Shape

dea's draft of what kind of team Hirer should design. Hirer can override.

- **Lead**: {{role — e.g., implementer, designer, researcher}}
- **Members**: {{roles}}

## Dependencies

Cards or external work that must finish before this card is `ready`.

- {{dependency}}

## Dispatch Log

One entry per dispatch attempt. Each links to the full `dispatch-<n>.md` in this folder.

| # | Started | Returned | Outcome | Link |
|---|---------|----------|---------|------|
| 1 | {{ISO}} | {{ISO}} | accepted / rejected / in_progress | [dispatch-1.md](dispatch-1.md) |

## Closing Notes

Written when the card closes. What shipped, what was learned, agent performance notes (for promotion review at project archive).

> Filled in at lifecycle step 10.

---

## Notes for dea (not part of the brief)

- **DB-owned state**: id, tenant_id, epic_id, status, dispatch_id, timestamps. Lives in `cards` row.
- **Markdown-owned content**: mission, context, acceptance prose, closing notes, suggested team shape.
- **`status: ready`**: Hirer can pick this up. dea sets this when dependencies clear.
- **`status: dispatched`**: dea has invoked the Hirer; `dispatches` row exists; team is running.
- **`status: closed`**: requires George's accept on at least one dispatch. Outcome + agent performance recorded.
