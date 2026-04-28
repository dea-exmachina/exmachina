# exmachina

> An operating system for human + AI collaboration. Clone it, run it, and you have your own AI Chief of Staff.

**exmachina** is an opinionated, installable system for working with AI assistants. Run `./install.sh` and you get a personalized AI partner (`dea` by default — rename to anything), a project + planning model with sprints/epics/cards, an agent factory that builds task-specific teams, and a kanban + calendar dashboard to see it all. The complexity is hidden until you need it. It works on day one for a non-technical user, and it gets out of the way of a power user.

The goal isn't another wrapper around a prompt. The goal is **structure**: opinionated where it matters (identity, governance, agent orchestration, visualization), modular where it doesn't (your projects, your work, your repos).

---

## Quick Start

```bash
git clone https://github.com/<user>/exmachina.git
cd exmachina
./install.sh
```

The installer asks a few questions (your name, your AI partner's name, where your vault lives, whether to set up Supabase + Control Center) and produces a working AI relationship in your Claude Code session. You can re-run it later to add layers — Supabase workspace, deployed Control Center — without losing what's already there.

---

## What You Get

| Layer | What it is | Required? |
|-------|-----------|-----------|
| **Identity** | Your AI partner with your name, voice, working style. Lives in your Claude Code config. | Always |
| **OS** | Governance roles (a council that helps with strategy/quality/coordination), framework library, agent factory primitives. | Always |
| **Vault** | A private folder/repo that holds *your* identity, projects, logs, customizations. The system writes here; you own here. | Always |
| **Workspace** | A Supabase database with kanban, calendar, projects, agent tasks. Your AI partner can read and write it. | Optional |
| **Control Center** | A web dashboard (Next.js + Vercel) that visualizes your work — kanban, calendar, projects, agent factory. | Optional |

The OS is **opinionated and ships complete**. The projects you do *with* your AI partner — those are yours and modular.

---

## Philosophy

See [PHILOSOPHY.md](PHILOSOPHY.md). Short version: *enable humans and AI to work together to solve real problems and build great things*. Right-sized governance, opinionated structure, user agency at the project layer.

---

## Status

**v0.2 — in active development.** This is a rebuild of a v0.1 system that worked but was never installable by anyone but its author. v0.2 is the bootstrapping program.

- v0.2.0 — OS + identity + installer Phase 1 (in progress)
- v0.2.1 — Supabase workspace + installer Phase 2 (planned)
- v0.2.2 — Control Center rebuild + installer Phase 3 (planned)

See [docs/architecture.md](docs/architecture.md) when it lands.

---

## License

MIT. See [LICENSE](LICENSE).
