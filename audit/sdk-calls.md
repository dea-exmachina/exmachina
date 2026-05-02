# SDK Audit — Anthropic AI SDK Call Inventory

**Date**: 2026-05-01
**Scope**: All repos under George's control
**Purpose**: Sprint 1 pre-condition — confirm zero existing `@anthropic-ai/sdk` calls before implementing caching standard

---

## Repos Audited

| Repo | Path | Result |
|------|------|--------|
| control-center | `D:\dev\control-center\` | No AI SDK |
| control-center-v1 | `D:\dev\control-center-v1\` | No AI SDK |
| discord-mcp | `D:\dev\discord-mcp\` | No AI SDK |
| exmachina | `D:\dev\exmachina\` | No AI SDK |
| exmachina OS | `D:\Vaults\exmachina\` | Pure markdown — no code |

**Search pattern**: `@anthropic-ai|anthropic` in `*.js`, `*.ts`, `*.py`, `*.mjs`, `*.cjs`; also `package.json` dependencies.

---

## Findings

**Zero `@anthropic-ai/sdk` imports found in any repo.**

The only Anthropic-authored package in any `package.json` is `@modelcontextprotocol/sdk` (MCP SDK, authored by Anthropic PBC) — present in all four repos' `node_modules`. This is the MCP protocol library, not the AI client SDK. It has no `cache_control` relevance.

The exmachina OS layer (`D:\Vaults\exmachina\`) is entirely markdown templates and bash scripts — no programmatic Claude API calls.

---

## Caching Scope Determination

**Question (from Sprint 1 plan)**: Can `dea-plan` as a Claude Code skill make direct SDK calls with `cache_control`?

**Answer: No.**

Claude Code skills are markdown instruction files executed by the CC harness. The harness manages all API communication internally — skills author prompts and conversations, not API calls. `cache_control` parameters are set at the HTTP request layer, which the CC harness owns. A skill cannot inject `cache_control` into the harness's API calls.

The only path to `cache_control` in the current architecture is:
1. A standalone SDK script (Python or TypeScript) that constructs `messages` arrays with `cache_control` blocks explicitly
2. Future: if the CC harness exposes a caching configuration surface

**Sprint 1 decision**: The `dea-plan` skeleton ships as a pure conversational skill. The caching standard is documented as the "SDK script pattern" for future use — applicable when `dea-plan` or any other skill spawns a standalone script that calls the Anthropic API directly.

---

## Sprint 1 Scope Adjustment

Per plan (Council item 6): Sprint 1's caching standard is documented as "SDK script pattern for future use." The `dea-plan` skeleton ships cache-ready in the sense that its design anticipates SDK script delegation — but no `cache_control` verification is possible until a script path exists.

The metrics stub (`~/.exmachina/metrics/cache-hits.jsonl`) is deferred — no SDK calls exist to instrument. The Supabase `metrics` table (Sprint 2 deliverable) remains on schedule.

---

## Files Produced

- This file: `D:\Vaults\exmachina\audit\sdk-calls.md`
- Caching standard: `D:\Vaults\Atalas\Skills.wiki\skills\dea-plan\skill.md` (Sprint 1 skeleton)
