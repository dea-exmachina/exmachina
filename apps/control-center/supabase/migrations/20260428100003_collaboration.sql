-- =============================================================================
-- Collaboration — project_members + project_invitations
-- =============================================================================
-- Forward-compat insurance for v0.3+ cross-tenant collaboration.
--
-- v0.2.x: tables sit empty. The per-tenant deployment model means a user in
-- another Supabase project cannot see this DB's project_members rows.
--
-- v0.3+: shared-DB-with-RLS deployment lets project_members.user_id (→
-- auth.users.id, universal) bridge tenants. Schema is ready then; no migration
-- thrash on the upgrade path.
--
-- Two collaboration roles served:
--   1. Peer collaborator (another tenant's principal) — invited via
--      project_invitations, accepts → row in project_members, gains scoped
--      access to ONE project.
--   2. External client / viewer (no tenant of their own) — signs up via invite
--      link, gets auth.users record only, no public.users row, sees ONLY
--      invited projects.
-- =============================================================================

CREATE TABLE public.project_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  -- user_id references auth.users (universal across tenants in shared-DB),
  -- NOT public.users (tenant-scoped). This is the federation seam.
  user_id         uuid NOT NULL,
  role            text NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('viewer','commenter','contributor','owner')),
  invited_by      uuid,
  joined_at       timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);

CREATE INDEX idx_project_members_project ON public.project_members(project_id);
CREATE INDEX idx_project_members_user    ON public.project_members(user_id);

COMMENT ON TABLE public.project_members IS
  'Cross-tenant collaboration roster. user_id references auth.users (universal). v0.2.x sits empty; v0.3+ shared-DB unlock.';

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY project_members_self_or_owning_tenant ON public.project_members
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    OR project_id IN (
      SELECT id FROM public.projects WHERE tenant_id = public.current_tenant_id()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE tenant_id = public.current_tenant_id()
    )
  );

CREATE TABLE public.project_invitations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  invitee_email   text NOT NULL,
  invited_role    text NOT NULL DEFAULT 'viewer'
    CHECK (invited_role IN ('viewer','commenter','contributor','owner')),
  token           text NOT NULL UNIQUE,
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  status          text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','expired','revoked')),
  invited_by      uuid,
  accepted_by     uuid,
  accepted_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_invitations_project ON public.project_invitations(project_id);
CREATE INDEX idx_project_invitations_token   ON public.project_invitations(token);
CREATE INDEX idx_project_invitations_email   ON public.project_invitations(lower(invitee_email));
CREATE INDEX idx_project_invitations_status  ON public.project_invitations(status) WHERE status = 'pending';

COMMENT ON TABLE public.project_invitations IS
  'Pending invites awaiting acceptance. token is the secret in the invite URL. v0.2.x sits empty; v0.3+ unlock.';

ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY project_invitations_owning_tenant ON public.project_invitations
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE tenant_id = public.current_tenant_id()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE tenant_id = public.current_tenant_id()
    )
  );

-- Extend projects visibility: tenant_id match OR membership.
-- Cards / epics / sprints get the same treatment in v0.3 when collaboration
-- actually goes live; for now their RLS stays tenant-only because there's
-- nothing in project_members to expand visibility against.

DROP POLICY projects_tenant_isolation ON public.projects;

CREATE POLICY projects_tenant_or_member ON public.projects
  FOR ALL TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = projects.id
        AND pm.user_id = auth.uid()
    )
  )
  WITH CHECK (tenant_id = public.current_tenant_id());

CREATE TRIGGER project_members_log_event
  AFTER INSERT OR UPDATE OR DELETE ON public.project_members
  FOR EACH ROW EXECUTE FUNCTION public.log_event();
