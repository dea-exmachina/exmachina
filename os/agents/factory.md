# Agent Factory — The Team Construction Protocol

How a project brief turns into a dispatchable team. Modeled on corporate HR: define the role (mentality, skills, scope), then either find someone proven or hire someone perfect for the job. Unlike real HR, we can create the perfect candidate out of thin air — but we still respect the discipline of writing a real JD before we do.

This is the protocol every team-construction event follows in v0.2.0. In v0.2.2 the Control Center surfaces this as a UI; the protocol stays the same underneath.

---

## Two Modes of Hiring

The factory operates in two distinct modes. Choose deliberately — they have different cost, latency, and reuse profiles.

### Mode A — Template Benders (recurring / one-off)

Pre-built, **named** identities for recurring or one-off tasks where a generic specialist works fine. Think: send me the daily inbox digest, run the backup verification, port a script. These don't need a custom hire.

- Live in `talent-pool/<bender-name>/` — each has `<name>.md` (character), `wisdom.md` (judgment), `learnings.md` (track record)
- Have stable git identities (e.g., `bender+forge@dea-exmachina.xyz`)
- Carry learnings + wisdom across sessions and across projects
- Get dispatched directly by dea — no hiring step

Examples (seed set inherited from v0.1, expand as the system grows):
- **Forge** — infrastructure engineer (bash, systemd, deploy automation)
- **Piper** — data pipeline engineer (Python, ETL, scheduled jobs)
- (others added as the user promotes excelling project agents)

**Architectural distinction**: a *role template* (`roles/researcher.template.md`) defines the *kind of work*. A *bender* (`talent-pool/forge/forge.md`) is a *named person* who does work in that style. Multiple benders can share a role; each bender accumulates their own track record. This is the same separation HR uses: "implementer" is a job description, "Forge" is the person.

### Mode B — Bespoke Project Agents (project-driven)

Custom-hired for a specific project's specific needs. The Hirer (see below) writes a JD, defines the skill set and mentality, and instantiates an agent identity tuned to that exact role. Project-scoped by default; promoted to talent pool if they excel.

Use when:
- The project's needs don't match any template
- The work is novel or domain-specific
- You want focused expertise rather than generic competence

Cost: more upfront work (writing the JD, calibrating the identity). Payoff: agent is exactly right for the job.

### Choosing the mode

```
Is the work routine and recurring?   → Mode A (template bender)
Is the project unusual or domain-specific?  → Mode B (bespoke hire)
Is it a one-off but generic?         → Mode A
Will excellence here matter strategically?  → Mode B
```

When in doubt, start Mode A and escalate to Mode B if the template bender underperforms.

---

## The Hirer

For Mode B, a specific operational role does the hiring work: **the Hirer**. The Hirer is Architect's operational hand — Architect (Board construct) governs the talent system; the Hirer actually executes the hire.

The Hirer is itself an agent role (`roles/hirer.template.md`). When a bespoke hire is needed, dea dispatches the Hirer with the project brief. The Hirer:

1. Writes the JD (job description) — what this role exists to do, what skills the agent needs, what mentality fits
2. Drafts the candidate identity — character file with principles, voice, constraints, success criteria
3. Reviews the draft against the project brief — does this person actually fit?
4. Hands off the finalized identity to dea for dispatch

The Hirer is NOT the agent who does the work — they're the agent who *creates* the agent who does the work. Same separation as a recruiter vs. an engineer.

---

## Inputs

To run the factory, you need:

1. **Project mission** — one paragraph: what this team is for. Comes from the project's `PROJECT.md` (tier 2 reference target).
2. **Scope and constraints** — time, budget, hard limits, voice/style rules. From `PROJECT.md` and tier-2 CLAUDE.md.
3. **Talent pool snapshot** — who's already promoted, what they've proven for. From `os/agents/talent-pool/` (or Supabase `agents` table when v0.2.1 lands).
4. **Role templates** — the available role archetypes. From `os/agents/roles/`.

---

## The Five-Step Protocol

### Step 1 — Mission analysis (Architect's lens)

Read the project mission. Answer in writing:

- What does this team need to do?
- What are the hard parts?
- Where will the bottlenecks be?
- What kinds of expertise are required?
- What kind of collaboration shape fits (single contributor, lead+members, parallel specialists)?

Output: a 3-5 bullet `team-brief.md` summary.

### Step 2 — Talent pool match

Before designing new identities, search the talent pool. For each capability identified in Step 1:

- Is there a promoted agent who has proven for this kind of work?
- If yes, deploy them. Note in `team-brief.md`: "Researcher role → Mira (promoted, proven on 3 prior research projects)."
- If no, proceed to Step 3 for that role.

**Reuse before rebuild** is a hard rule. Skipping the talent-pool check is a process bug.

### Step 3 — Identity design (only for unfilled roles)

For each role still unfilled, pick a role template from `roles/` and instantiate:

- Copy the template
- Fill `{{handlebars}}` with project-specific context (mission summary, voice rules, success criteria)
- Customize the "Specialization" section to the role's specific scope on this project
- Save the instance to `<vault>/projects/<project>/team/<role-name>.md`

Identity files stay lean — 100 lines of character, plus triggers that load expertise on demand. A 500-line identity is a design failure.

### Step 4 — Team topology

Decide:

- **Who leads the team?** Usually the role with the most cross-cutting responsibility (e.g., a writer leads on a content project; an implementer leads on a code project). The lead coordinates internally and is dea's single point of contact.
- **How do handoffs work?** Researcher → Writer → Reviewer? Designer → Implementer → Reviewer? Document the chain in `team-brief.md`.
- **Where does the work merge?** What's the integration point? Who owns final delivery?

A team where every member doesn't know who they hand off to is a team that will stall.

### Step 5 — Brief and dispatch

dea writes the dispatch package:

- Per-agent prompt (their identity + their specific task + the team brief)
- Communication channel (how the lead reaches dea; how members reach the lead)
- Success criteria (what "done" looks like)
- Quality gate (what dea will check when work returns)

Then dispatch via the protocol in `dispatch.md`.

---

## Performance Tracking (v0.2.0 = manual; v0.2.1 = automated)

After the team finishes (or after a meaningful milestone):

- **dea writes a performance note** for each agent: what they did, how well, what stood out, what was rough.
- **Architect's post-epic Council review** reads these notes. Excelling agents are surfaced to the user with a recommendation: "Promote? They were strong on X."
- **User decides on promotions.** Promoted agents move to `talent-pool/`.

In v0.2.0, performance notes live in `<vault>/projects/<project>/team/performance.md`. In v0.2.1 they become rows in the `agent_performance` table.

---

## Anti-patterns

- **Over-staffing.** Four exceptional agents outperform eight generic ones. Talent density beats headcount.
- **Generic roles.** "Senior engineer" is not a role. "Researcher specialized in regulatory landscape for fintech in EU" is.
- **No lead.** A team without a lead is a free-for-all. Dispatch always nominates a lead.
- **Skipping the talent-pool match.** Every. Time. Even if you "know" no one fits.
- **Persistent identity bloat.** When a role template balloons past ~120 lines, refactor — push detail into wisdom files loaded on demand.
- **Dispatching without success criteria.** Agents need to know what "done" looks like. Fuzzy briefs produce fuzzy work.
