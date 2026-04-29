# Agents — The Execution Layer

The workforce. Architect designs them; dea dispatches them; they do the actual work — code, content, research, tests, builds.

In the corporate analogy: **agent teams are the employees**. Each team has a lead and members. Teams are project-scoped by default. Agents that excel get promoted into the persistent talent pool.

---

## Files in This Folder

| File | Purpose |
|------|---------|
| `factory.md` | The protocol: how Architect designs a team for a mission, how identities are filled in, how teams are formed |
| `dispatch.md` | The protocol: how dea actually dispatches a team (Claude Code Task tool, agent prompts, result synthesis) |
| `roles/` | Role templates — lean character files for common agent types (researcher, implementer, writer, reviewer, designer, etc.) |
| `talent-pool/` | Promoted agents (populated over time as the user promotes excelling agents into the persistent registry) — empty in v0.2.0 |

---

## How It Works

1. **Mission arrives.** A project gets a brief. dea reads it, drafts a team shape with Architect's lens.
2. **Architect designs the team.** What roles? Who leads? Who members? Reuse from the talent pool first; build new identities only when nothing existing fits.
3. **Identity instances.** Each role template gets filled with project-specific context (mission, constraints, voice). Result: a lean identity ready to dispatch.
4. **dea dispatches.** Team members are spun up via Claude Code's Task tool with their identity + the specific task.
5. **Team executes.** Lead coordinates; members deliver. dea is the team-lead-of-team-leads.
6. **Results return.** Through the lead, through dea, to the user. Quality gate at every layer.
7. **Performance recorded.** Architect tracks who did well. Excelling agents are surfaced to the user for promotion.
8. **Promotion is user-driven.** When the user promotes an agent (e.g., "this design agent gets it — keep them"), the agent moves to `talent-pool/` and becomes reusable.

---

## v0.2.0 Constraints (current)

- **Markdown-only.** Talent pool, performance tracking, and promotion are file-based for now. The Supabase schema in v0.2.1 will make this dynamic.
- **Manual factory.** Architect's design is currently expressed by the user/dea reading the role templates and picking a team. Automated team-shape inference comes in v0.2.2 when the Control Center's agent factory UI lands.
- **Dispatch via Task tool.** Each agent is a Claude Code subagent invocation. No persistent agent processes; each run is fresh. Persistent stateful agents are a v0.3 question.
