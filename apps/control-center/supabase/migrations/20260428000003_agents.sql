-- =============================================================================
-- 0003 — Agents
-- =============================================================================
-- The talent system: agents (individuals + their identity/wisdom/learnings
-- pointers), agent_jds (job descriptions written by Hirer that produced agents).
-- Promotion is user-driven: an agent that excels gets is_promoted=true and
-- moves into the persistent talent pool.
--
-- DB owns: identity-path metadata, promotion state, performance signals.
-- Vault owns: actual identity content, wisdom content, learnings content.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- agents
-- -----------------------------------------------------------------------------

CREATE TABLE public.agents (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name                        text NOT NULL,                  -- "Forge", "Mira", etc.
  role                        text NOT NULL,                  -- 'researcher', 'implementer', etc.
  archetype                   text,                           -- canonical role this agent extends
  is_promoted                 boolean NOT NULL DEFAULT false,
  promoted_at                 timestamptz,
  promoted_by_user_id         uuid REFERENCES public.users(id) ON DELETE SET NULL,
  promoted_from_project_id    uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  proven_for                  text[],                         -- mission categories where excelled
  identity_path               text NOT NULL,                  -- vault-relative path to identity .md
  wisdom_path                 text,                           -- vault-relative path to wisdom .md
  learnings_path              text,                           -- vault-relative path to learnings .md
  ewma_score                  numeric,                        -- v0.3 — performance EWMA (defer)
  retired_at                  timestamptz,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  CHECK ((is_promoted = false) OR (promoted_at IS NOT NULL))
);

CREATE INDEX idx_agents_tenant ON public.agents(tenant_id);
CREATE INDEX idx_agents_promoted ON public.agents(tenant_id, is_promoted) WHERE is_promoted = true;
CREATE INDEX idx_agents_role ON public.agents(tenant_id, role);

CREATE TRIGGER agents_touch_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

COMMENT ON TABLE public.agents IS
  'Per-tenant agent registry. Project-scoped agents are ephemeral; promoted agents persist in the talent pool. identity/wisdom/learnings_path point at vault markdown.';

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY agents_tenant_isolation_select ON public.agents
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY agents_tenant_isolation_modify ON public.agents
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- -----------------------------------------------------------------------------
-- agent_jds
-- -----------------------------------------------------------------------------

CREATE TABLE public.agent_jds (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id          uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role_title          text NOT NULL,
  jd_path             text NOT NULL,                          -- vault path to JD markdown
  hired_into_agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  hired_at            timestamptz
);

CREATE INDEX idx_agent_jds_project ON public.agent_jds(project_id);
CREATE INDEX idx_agent_jds_tenant ON public.agent_jds(tenant_id);

COMMENT ON TABLE public.agent_jds IS
  'Job descriptions written by Hirer. hired_into_agent_id links the JD to the agent it produced. Useful for talent system retrospectives.';

ALTER TABLE public.agent_jds ENABLE ROW LEVEL SECURITY;

CREATE POLICY agent_jds_tenant_isolation_select ON public.agent_jds
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY agent_jds_tenant_isolation_modify ON public.agent_jds
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());
