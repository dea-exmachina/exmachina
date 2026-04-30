# Sprint 4 — Handoff

## State of the repo

**Branch**: master  
**Last commit**: `15b7949` — close sprint button + fix status constraint  
**Test suite**: 28/28 unit tests passing (`npx vitest run`)  
**Build**: clean (`npm run build` — no TypeScript errors)  
**Dev server**: `localhost:3000` (already running, process 34856)

## What Sprint 3 shipped

| Feature | Files |
|---------|-------|
| Card detail — inline title edit, status badge, agent assignment | `src/app/projects/[slug]/cards/[cardId]/` |
| Council — convene form, review list, record decision, vault artifacts | `src/app/projects/[slug]/council/` + `src/components/council/` |
| Close sprint button — two-step confirm, sets status='closed' | `src/components/projects/CloseSprintButton.tsx` |
| Start sprint form — guards duplicate active sprints | `src/components/projects/StartSprintForm.tsx` |
| Supabase Realtime kanban — pendingCardIds echo suppression | `src/components/kanban/KanbanBoard.tsx` |
| Shared utilities — auth-guard, card-status (4-file duplication eliminated) | `src/lib/server/auth-guard.ts`, `src/lib/card-status.ts` |
| Unit tests (28) + Playwright E2E specs (F1–F8) | `src/__tests__/`, `e2e/` |

## DB state (Supabase project: wwwsktwddjmffrcbqiww)

- **Sprint 1** (exmachina-v022): `planned` — scaffold + auth
- **Sprint 2** (exmachina-v022): `closed` — planning wizard + kanban
- **Sprint 3** (exmachina-v022): `active` — card detail, council, realtime
  - Epic: Card & Sprint UX (4 cards — 3 closed, 1 in_review)
  - Epic: Council & Governance (4 cards — 3 closed, 1 ready)

Sprint 3 cards to close before closing sprint:
- "Close sprint button" → drag to `closed` (just shipped)
- "E2E specs" → run Playwright against localhost:3000, then close

## Dogfooding observations from Sprint 3

1. **Close sprint flow is jarring** — closing the sprint drops you to an empty "create sprint" page with no context. Needs: sprint summary screen, or at minimum a closed-sprint read-only view so you can see what just shipped before starting the next sprint.

2. **No active tab indicator** — both "Kanban" and "Council" tabs show the same style. Active tab needs a visual distinction.

3. **Cards all land in "closed" lane at sprint end** — the closed lane is the 5th column, easy to miss. Consider collapsing it or moving it behind a toggle.

4. **No sprint history** — once a sprint is closed you can't see it. Past sprints, their cards, and outcomes are invisible.

5. **Design is functional but unpolished** — spacing, typography, and component density all need a pass. Terminal Atelier tokens are applied but inconsistently.

## Sprint 4 candidate features

### P0 — Sprint lifecycle UX (blocks dogfooding flow)
- Sprint close → show sprint summary (cards shipped, any carry-overs) before showing StartSprintForm
- Closed sprint read-only view at `/projects/[slug]/sprints/[sprintId]`
- Sprint history list in sub-nav or project sidebar

### P1 — Card improvements
- Carry-over: when closing a sprint, offer to move open cards to next sprint
- Card description editor (currently a plain textarea — needs minimal markdown or at least line breaks)
- Card comments / activity log (agent activity trace)

### P2 — Dispatch brief
- Cards as self-contained agent context packages
- `/projects/[slug]/cards/[cardId]/dispatch` — assembles context: card + epic + sprint goal + project mission + relevant council decisions
- This is the bridge between the board and the agent workforce

### P3 — Design pass
- Active tab state (usePathname already in SidebarNav, extend to sub-nav tabs)
- Closed lane toggle / collapse
- Card drag-and-drop (currently status changes via select only)
- Mobile-acceptable layout (currently desktop-only)

### P4 — Council improvements
- Board panel on council page (member list with roles)
- Council review → auto-attach to the epic it was created from
- Post-epic retro trigger from sprint close flow

## Key technical context

**Auth pattern**: `getAuthedProject(slug)` in `src/lib/server/auth-guard.ts` — returns `{ supabase, user, tenantId, project }` or `{ error }`. All server actions start here.

**DB schema gotchas**:
- `sprints.status` constraint: `'planned' | 'active' | 'closed' | 'cancelled'` (NOT 'completed')
- `council_reviews.trigger` constraint: `'pre-decision' | 'post-epic'`
- `council_reviews.human_decision` constraint: `'approve' | 'modify' | 'reject' | NULL`
- `epics` has no `project_id` column — project is inferred via `sprint → project_id`

**Realtime**: Cards table is in the `supabase_realtime` publication. KanbanBoard subscribes on `tenant_id` filter. Echo suppression via `pendingCardIds: useRef<Set<string>>`.

**Routing**: Card route is `[cardId]` (UUID), not slug — slug is not unique across epics.

**`fs` mocking in vitest**: Uses `vi.hoisted()` pattern in council-actions tests. CJS module — requires both `default` and named exports in the mock factory.

**Design system**: Terminal Atelier — amber `#D4840A` as `--cc-accent`, near-black `#060911` as background. All styles are inline. CSS vars defined in `src/app/globals.css`.

## Commands

```bash
# Dev
npm run dev              # localhost:3000

# Tests
npx vitest run           # 28 unit tests
npx playwright test      # E2E (requires dev server + auth cookie setup)

# Type check
npx tsc --noEmit

# DB (Supabase MCP project_id: wwwsktwddjmffrcbqiww)
```
