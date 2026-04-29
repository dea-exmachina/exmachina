-- =============================================================================
-- 0004 — Governance
-- =============================================================================
-- The Board layer: boards (per-tenant configurable Council shape), board_members
-- (the constructs filling seats), council_reviews (pre-decision + post-epic
-- outputs).
--
-- The Council structure is fixed (separation of powers, two structural
-- triggers); the cast is configurable per tenant. Defaults installed for new
-- tenants by Phase 2 installer. Custom rosters supported from day one.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- boards
-- -----------------------------------------------------------------------------
-- One row per tenant typically. Multi-board future (e.g., a tenant has both an
-- exec board and a tech board) is left open by the structure.

CREATE TABLE public.boards (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name                text NOT NULL DEFAULT 'Council',
  slug                text NOT NULL DEFAULT 'council',
  is_default          boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE UNIQUE INDEX idx_boards_one_default_per_tenant
  ON public.boards(tenant_id) WHERE is_default = true;

CREATE TRIGGER boards_touch_updated_at
  BEFORE UPDATE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY boards_tenant_isolation_select ON public.boards
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY boards_tenant_isolation_modify ON public.boards
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- -----------------------------------------------------------------------------
-- board_members
-- -----------------------------------------------------------------------------

CREATE TABLE public.board_members (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  board_id            uuid NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  construct_name      text NOT NULL,                  -- "Kerrigan", "Architect", etc.
  seat                text NOT NULL,                  -- "Chair", "Architecture", "Knowledge", etc.
  is_chair            boolean NOT NULL DEFAULT false,
  identity_path       text NOT NULL,                  -- vault path to construct's identity .md
  display_order       int NOT NULL DEFAULT 0,
  retired_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (board_id, construct_name)
);

CREATE INDEX idx_board_members_board ON public.board_members(board_id);
CREATE UNIQUE INDEX idx_board_members_one_chair_per_board
  ON public.board_members(board_id) WHERE is_chair = true;

CREATE TRIGGER board_members_touch_updated_at
  BEFORE UPDATE ON public.board_members
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

COMMENT ON TABLE public.board_members IS
  'Constructs filling Board seats. Default tenant gets the 6: Kerrigan (Chair), Architect, Abathur, Keeper, Zagara, Overseer. Tenants override the cast; structure (separation of powers, two triggers) is fixed.';

ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY board_members_tenant_isolation_select ON public.board_members
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY board_members_tenant_isolation_modify ON public.board_members
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- -----------------------------------------------------------------------------
-- council_reviews
-- -----------------------------------------------------------------------------

CREATE TABLE public.council_reviews (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  board_id            uuid REFERENCES public.boards(id) ON DELETE SET NULL,
  project_id          uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  epic_id             uuid REFERENCES public.epics(id) ON DELETE CASCADE,
  trigger             text NOT NULL CHECK (trigger IN ('pre-decision','post-epic')),
  artifact_path       text NOT NULL,                  -- vault path to the council-review.md
  rulings             jsonb,                          -- structured per-construct rulings
  synthesis           text,                           -- chair's synthesis (Kerrigan by default)
  human_decision      text CHECK (human_decision IN ('approve','modify','reject') OR human_decision IS NULL),
  human_decision_at   timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  -- Triggers must attach to exactly one of (project, epic) consistent with the trigger type.
  CHECK (
    (trigger = 'pre-decision' AND project_id IS NOT NULL AND epic_id IS NULL) OR
    (trigger = 'post-epic'    AND epic_id IS NOT NULL)
  )
);

CREATE INDEX idx_council_reviews_project ON public.council_reviews(project_id);
CREATE INDEX idx_council_reviews_epic ON public.council_reviews(epic_id);
CREATE INDEX idx_council_reviews_tenant_trigger ON public.council_reviews(tenant_id, trigger);

ALTER TABLE public.council_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY council_reviews_tenant_isolation_select ON public.council_reviews
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY council_reviews_tenant_isolation_modify ON public.council_reviews
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- -----------------------------------------------------------------------------
-- Backfill epics.council_review_id (forward reference resolved here)
-- -----------------------------------------------------------------------------

ALTER TABLE public.epics
  ADD COLUMN council_review_id uuid REFERENCES public.council_reviews(id) ON DELETE SET NULL;

CREATE INDEX idx_epics_council_review ON public.epics(council_review_id);
