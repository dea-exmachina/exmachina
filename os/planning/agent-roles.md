# Agent Roles — Archetype → Hirer Resolution

How the `agent_role` field on a plan.md card maps to the agent factory and Hirer workflow.

---

## Archetypes

| Archetype | Role template | Primary mission | When to use |
|-----------|--------------|-----------------|-------------|
| `implementer` | `os/agents/roles/implementer.template.md` | Write, build, ship — code or content output | Most cards: feature work, chores, bug fixes |
| `researcher` | `os/agents/roles/researcher.template.md` | Investigate, discover, report — no direct output artifact | Spike cards, unknown-territory exploration |
| `reviewer` | `os/agents/roles/reviewer.template.md` | Quality gate — review a deliverable against criteria | Post-implementation review, plan review |
| `designer` | `os/agents/roles/designer.template.md` | Design artifacts — specs, wireframes, architecture docs | Design cards, system specs |

---

## Hirer Resolution Chain

When `dea-hire` (Sprint 3) reads a card's `assigned_agent_role`, it follows this chain:

1. **Read** the card's `agent_role` field
2. **Load** the matching role template from `os/agents/roles/<archetype>.template.md`
3. **Instantiate** the agent with:
   - `{{project_name}}` → project slug from the card's sprint/epic hierarchy
   - `{{role_specialization}}` → card title + acceptance criteria
4. **Write** agent JD to `projects/<slug>/sprints/<sprint>/epics/<epic>/cards/<card>/agent-jd.md`
5. **Insert** `agent_jds` row linking the JD to the card
6. **Dispatch** via standard Task tool call with the instantiated identity

---

## Assignment Rules

- One `agent_role` per card. If a card needs multiple archetypes (e.g., implement + review), split it into two cards.
- `reviewer` cards are always sequenced after the card they review (captured in `depends_on`).
- `researcher` cards should have explicit research questions in `acceptance_criteria` — "investigate X" without a crisp output criterion is not dispatchable.
- If `agent_role` is absent from a card at ingestion, `assigned_agent_role` defaults to NULL and Hirer must be told manually at dispatch time.

---

## Sprint 3 Integration

When `dea-hire` runs on an ingested plan:
- Cards with `assigned_agent_role IS NOT NULL` are eligible for automatic JD generation
- Cards with `assigned_agent_role IS NULL` are flagged in the hire summary for manual assignment
- The Hirer workflow (`os/agents/factory.md`) is called once per card with the resolved role template

---

*Written as Sprint 2 pre-condition. Updated at Sprint 3 when `dea-hire` ships.*
