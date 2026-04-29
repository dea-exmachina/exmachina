-- =============================================================================
-- Fix infinite RLS recursion between projects and project_members.
--
-- The 0003 migration added two policies that referenced each other:
--   - projects.projects_tenant_or_member: EXISTS in project_members
--   - project_members.project_members_self_or_owning_tenant: IN (SELECT FROM projects)
-- Postgres detected the recursion and aborted any authenticated query.
--
-- v0.2.x reality: per-tenant deployment means there's no auth.uid() bridging
-- tenants. The membership-aware policy on `projects` was forward-compat
-- theater that would never fire in v0.2.x — and broke the simpler tenant-only
-- read path while waiting for v0.3.
--
-- Fix: revert projects to tenant-only RLS; replace project_members policy
-- with a non-recursive form (members see only their own row); leave
-- project_invitations RLS-enabled with no policies (service_role only).
--
-- v0.3 follow-up (when shared-DB lands): add a SECURITY DEFINER helper
-- function (e.g., is_project_owner(project_id, tenant_id)) that bypasses
-- RLS for the lookup, then re-introduce the membership-aware policies on
-- both sides without recursion.
-- =============================================================================

DROP POLICY IF EXISTS projects_tenant_or_member ON public.projects;
CREATE POLICY projects_tenant_isolation ON public.projects
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS project_members_self_or_owning_tenant ON public.project_members;
CREATE POLICY project_members_self_only ON public.project_members
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS project_invitations_owning_tenant ON public.project_invitations;
-- Intentionally no replacement: RLS enabled + zero policies = service_role only.

COMMENT ON TABLE public.project_members IS
  'Cross-tenant collaboration roster. user_id → auth.users (universal). v0.2.x: members can see their own row only; owning-tenant writes go through service_role. v0.3+ adds tenant-owner read via SECURITY DEFINER helper to avoid recursion with projects RLS.';

COMMENT ON TABLE public.project_invitations IS
  'Pending invites awaiting acceptance. v0.2.x: service_role-only via RLS (no policies); v0.3 adds owning-tenant + invitee-by-token policies once cross-tenant deployment lands.';
