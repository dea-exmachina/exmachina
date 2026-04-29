# Planning — The Connective Tissue

The kanban is the circulatory system of exmachina. Projects, sprints, epics, and cards are how work gets named, sequenced, dispatched, and reviewed. This module is the protocol — what each thing is, how it transitions, where its data lives.

In the corporate analogy: **planning is the layer between the Board and the Team Lead.** The Board (Council) governs at structural moments. The Team Lead (agent team) executes. Planning is what makes the work visible between those layers — what dea reads to dispatch, what George reviews to direct, what Abathur learns from when an epic closes.

---

## Files in This Folder

| File | Purpose |
|------|---------|
| `lifecycle.md` | The 13-step protocol from idea to archive. State-machine semantics for each entity. The markdown ↔ DB sync contract. |
| `PROJECT.template.md` | Canonical project brief — mission, scope, premises, success criteria. The root of any work tree. |
| `SPRINT.template.md` | Time-boxed container for a coherent push of work. Has a goal and a deadline. |
| `EPIC.template.md` | Work that ships together. Lives inside a sprint. Closes with a Council post-epic review. |
| `CARD.template.md` | The dispatchable unit. One card = one team mission. Lives inside an epic. |
| `plan-to-cards.md` | The transformation protocol — how an approved `/plan` output becomes seeded sprints, epics, and cards. |

---

## Why This Sits at `os/planning/`

It's a peer to `os/governance/` and `os/agents/`, not nested under either. Planning crosses both:

- **Council reviews** (governance) attach to projects (pre-decision) and epics (post-epic).
- **Dispatches** (agents) attach to cards.

If planning lived under governance it would be biased toward review ceremony. If it lived under agents it would be biased toward execution. As a peer, it's the substrate both layers write to.

---

## v0.2.1 Constraints (current)

- **Markdown is shipped first.** This folder is real today. The Supabase schema (cards/epics/sprints/projects rows) lands in v0.2.1 alongside it.
- **No UI yet.** State changes happen through dea + DB writes; humans read markdown. Drag-drop kanban is v0.2.2.
- **DB authoritative for state, markdown authoritative for content** — see `lifecycle.md` for the full sync contract.
- **Folder becomes a project when it has `PROJECT.md` at root.** No central registry. v0.2.1 seeding adds `.project.json` for DB linkage.

---

## How a Project Flows

```
Idea → /plan → PROJECT.md drafted → Council pre-decision (if stakes warrant)
   → projects row INSERT → Sprints planned → Epics defined → Cards drafted
   → Hirer dispatched per card → Team executes → Card closes → Epic closes (Council post-epic)
   → Sprint closes (retrospective) → Project archives (agents promoted if warranted)
```

Full state machine in [`lifecycle.md`](lifecycle.md). Plan-to-cards transformation in [`plan-to-cards.md`](plan-to-cards.md).
