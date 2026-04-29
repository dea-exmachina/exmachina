-- =============================================================================
-- seed.sql — SANDBOX-ONLY FIXTURES
-- =============================================================================
-- ⚠ DO NOT RUN AGAINST A REAL TENANT'S SUPABASE PROJECT. ⚠
--
-- This file is loaded automatically by `supabase db reset` against a LOCAL
-- Supabase stack. Its sole purpose is to give CI smoke tests + local dev work
-- a reproducible 2-tenant fixture (so cross-tenant RLS leak tests can
-- distinguish "isolation works" from "no rows exist anyway").
--
-- Real production tenants are seeded by `installer/phase2-supabase.sh
-- --seed-tenant`, which prompts for tenant name + principal user + writes the
-- default Council board with 6 constructs. The installer is the canonical
-- new-tenant seeding path; this file is dev-loop scaffolding only.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tenants
-- -----------------------------------------------------------------------------

INSERT INTO public.tenants (id, name, slug, governance_level, vault_path) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sandbox Tenant A', 'sandbox-a', 'tenant', '/tmp/sandbox-a'),
  ('22222222-2222-2222-2222-222222222222', 'Sandbox Tenant B', 'sandbox-b', 'tenant', '/tmp/sandbox-b');

-- -----------------------------------------------------------------------------
-- Default Council board for each tenant
-- -----------------------------------------------------------------------------

INSERT INTO public.boards (id, tenant_id, name, slug, is_default) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Council', 'council', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Council', 'council', true);

-- The 6 default constructs for tenant A. Tenant B intentionally left empty so
-- "configurable cast" can be exercised in tests.
INSERT INTO public.board_members
  (tenant_id, board_id, construct_name, seat, is_chair, identity_path, display_order)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Kerrigan', 'Chair', true,
   'council/constructs/kerrigan.md', 0),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Architect', 'Architecture', false,
   'council/constructs/architect.md', 1),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Abathur', 'Knowledge', false,
   'council/constructs/abathur.md', 2),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Keeper', 'Trust', false,
   'council/constructs/keeper.md', 3),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Zagara', 'Flow', false,
   'council/constructs/zagara.md', 4),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Overseer', 'External', false,
   'council/constructs/overseer.md', 5);

-- -----------------------------------------------------------------------------
-- One project per tenant — exercises tenant isolation at the project level.
-- -----------------------------------------------------------------------------

INSERT INTO public.projects
  (id, tenant_id, name, slug, mission, status, scope, project_md_path)
VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   'Sandbox Project A1', 'project-a1',
   'Verify the schema landed cleanly and RLS holds.', 'active', 'open',
   'projects/project-a1/PROJECT.md'),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222',
   'Sandbox Project B1', 'project-b1',
   'Cross-tenant isolation foil.', 'active', 'open',
   'projects/project-b1/PROJECT.md');

-- -----------------------------------------------------------------------------
-- One sprint, one epic, one card under tenant A's project — smallest valid
-- chain to exercise foreign keys + cascade behavior.
-- -----------------------------------------------------------------------------

INSERT INTO public.sprints
  (id, tenant_id, project_id, name, slug, goal, status, sprint_md_path)
VALUES
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111',
   '33333333-3333-3333-3333-333333333333',
   'Smoke Sprint', 'smoke',
   'Confirm chain INSERT and event-trigger fire.', 'active',
   'projects/project-a1/sprints/smoke/SPRINT.md');

INSERT INTO public.epics
  (id, tenant_id, sprint_id, name, slug, mission, status, epic_md_path)
VALUES
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111',
   '55555555-5555-5555-5555-555555555555',
   'Smoke Epic', 'smoke-epic',
   'Smallest valid epic.', 'in_progress',
   'projects/project-a1/sprints/smoke/epics/smoke-epic/EPIC.md');

INSERT INTO public.cards
  (id, tenant_id, epic_id, title, slug, description, status, card_md_path)
VALUES
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111',
   '66666666-6666-6666-6666-666666666666',
   'Smoke Card', 'smoke-card',
   'If this row exists and 4 events were logged, the chain works.', 'ready',
   'projects/project-a1/sprints/smoke/epics/smoke-epic/cards/smoke-card/CARD.md');

-- -----------------------------------------------------------------------------
-- Smoke check expectations (run after seeding):
--   SELECT count(*) FROM events WHERE tenant_id = '11111111-...';
--     -- expect >= 10  (1 board + 6 board_members + 1 project + 1 sprint + 1 epic + 1 card)
--   SELECT count(*) FROM events WHERE tenant_id = '22222222-...';
--     -- expect >= 2   (1 board + 1 project)
--
-- RLS leak test:
--   SET app.current_tenant_id = '11111111-1111-1111-1111-111111111111';
--   SELECT count(*) FROM projects;  -- expect 1
--   SET app.current_tenant_id = '22222222-2222-2222-2222-222222222222';
--   SELECT count(*) FROM projects;  -- expect 1
--   RESET app.current_tenant_id;
--   SET ROLE authenticated;  -- (or test from a non-service connection)
--   SELECT count(*) FROM projects;  -- expect 0  (no tenant set → RLS denies)
-- =============================================================================
