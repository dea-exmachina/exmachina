-- =============================================================================
-- 0002 — Planning Module
-- =============================================================================
-- The connective tissue between governance and execution: projects, sprints,
-- epics, cards. Pattern across all four tables: DB owns state (status, ids,
-- timestamps, scope); markdown owns content (mission, body, prose). The
-- *_md_path column points at the canonical vault file. See
-- exmachina/os/planning/lifecycle.md for the full sync contract.
--
-- Status state machines per the lifecycle doc — CHECK constraints enforce.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- projects
-- -----------------------------------------------------------------------------

CREATE TABLE public.projects (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name                text NOT NULL,
  slug                text NOT NULL,
  mission             text,
  status              text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','approved','active','archived','cancelled')),
  scope               text NOT NULL DEFAULT 'open'
    CHECK (scope IN ('open','scoped','isolated')),
  scoped_paths        text[],                       -- relevant only when scope='scoped'
  project_md_path     text NOT NULL,                -- vault-relative path to PROJECT.md
  approved_at         timestamptz,
  archived_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE INDEX idx_projects_tenant ON public.projects(tenant_id);
CREATE INDEX idx_projects_status ON public.projects(tenant_id, status);

CREATE TRIGGER projects_touch_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

COMMENT ON TABLE public.projects IS
  'Project = a folder with PROJECT.md at root. scope governs dea read access (open/scoped/isolated). v0.2.x enforces scope by convention; hard hooks land in v0.3+.';

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_tenant_isolation_select ON public.projects
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY projects_tenant_isolation_modify ON public.projects
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- -----------------------------------------------------------------------------
-- sprints
-- -----------------------------------------------------------------------------

CREATE TABLE public.sprints (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id          uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name                text NOT NULL,
  slug                text NOT NULL,
  goal                text,
  status              text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned','active','closed','cancelled')),
  starts_at           timestamptz,
  ends_at             timestamptz,
  sprint_md_path      text NOT NULL,
  closed_at           timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, slug)
);

CREATE INDEX idx_sprints_project ON public.sprints(project_id);
CREATE INDEX idx_sprints_tenant_status ON public.sprints(tenant_id, status);

CREATE TRIGGER sprints_touch_updated_at
  BEFORE UPDATE ON public.sprints
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY sprints_tenant_isolation_select ON public.sprints
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY sprints_tenant_isolation_modify ON public.sprints
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- -----------------------------------------------------------------------------
-- epics
-- -----------------------------------------------------------------------------
-- council_review_id is added in 0004_governance.sql via ALTER TABLE
-- (the council_reviews table doesn't exist yet at this point).

CREATE TABLE public.epics (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sprint_id           uuid NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  name                text NOT NULL,
  slug                text NOT NULL,
  mission             text,
  status              text NOT NULL DEFAULT 'defined'
    CHECK (status IN ('defined','in_progress','closed','cancelled')),
  epic_md_path        text NOT NULL,
  closed_at           timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sprint_id, slug)
);

CREATE INDEX idx_epics_sprint ON public.epics(sprint_id);
CREATE INDEX idx_epics_tenant_status ON public.epics(tenant_id, status);

CREATE TRIGGER epics_touch_updated_at
  BEFORE UPDATE ON public.epics
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;

CREATE POLICY epics_tenant_isolation_select ON public.epics
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY epics_tenant_isolation_modify ON public.epics
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- -----------------------------------------------------------------------------
-- cards
-- -----------------------------------------------------------------------------
-- dispatch_id (latest dispatch attempt) is added in 0005 via ALTER TABLE.

CREATE TABLE public.cards (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  epic_id             uuid NOT NULL REFERENCES public.epics(id) ON DELETE CASCADE,
  title               text NOT NULL,
  slug                text NOT NULL,
  description         text,
  status              text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','ready','dispatched','in_review','closed','blocked','cancelled')),
  card_md_path        text NOT NULL,
  closed_at           timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (epic_id, slug)
);

CREATE INDEX idx_cards_epic ON public.cards(epic_id);
CREATE INDEX idx_cards_tenant_status ON public.cards(tenant_id, status);

CREATE TRIGGER cards_touch_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY cards_tenant_isolation_select ON public.cards
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY cards_tenant_isolation_modify ON public.cards
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());
