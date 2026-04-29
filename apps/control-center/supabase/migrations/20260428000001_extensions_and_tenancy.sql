-- =============================================================================
-- 0001 — Extensions and Tenancy
-- =============================================================================
-- Foundations: extensions, RLS helper functions, tenants, users.
-- Every other migration in v0.2.1 depends on this one.
--
-- Forward-compat insurance: tenants.parent_tenant_id + governance_level are
-- present from day one (see exmachina.wiki/v021-prep.md). Today every tenant
-- has parent_tenant_id=NULL and governance_level='tenant'. Nested governance
-- is a v0.3+ unlock; the schema stays compatible.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- text search support for future qmd-DB queries

-- -----------------------------------------------------------------------------
-- RLS helper: current_tenant_id()
-- -----------------------------------------------------------------------------
-- Resolves the active tenant from (in order):
--   1. JWT claim 'tenant_id' (browser clients with proper JWT)
--   2. Session config 'app.current_tenant_id' (server-side, set via SET)
-- Returns NULL when neither is set, which forces RLS policies to deny.
-- service_role bypasses RLS entirely (Supabase default), so installer + MCP
-- tooling don't need to set this.

CREATE OR REPLACE FUNCTION public.current_tenant_id() RETURNS uuid AS $$
  SELECT COALESCE(
    nullif(current_setting('request.jwt.claim.tenant_id', true), '')::uuid,
    nullif(current_setting('app.current_tenant_id', true), '')::uuid
  )
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION public.current_tenant_id() IS
  'Returns the active tenant_id for RLS scoping. Reads JWT claim or session var.';

-- -----------------------------------------------------------------------------
-- Generic updated_at trigger
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- tenants
-- -----------------------------------------------------------------------------

CREATE TABLE public.tenants (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  slug                text NOT NULL UNIQUE,
  parent_tenant_id    uuid REFERENCES public.tenants(id) ON DELETE RESTRICT,
  governance_level    text NOT NULL DEFAULT 'tenant'
    CHECK (governance_level IN ('org','vertical','team','tenant','individual')),
  vault_path          text,                      -- absolute path to the vault on the user's machine (informational)
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenants_parent ON public.tenants(parent_tenant_id);
CREATE INDEX idx_tenants_slug ON public.tenants(slug);

CREATE TRIGGER tenants_touch_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

COMMENT ON TABLE public.tenants IS
  'Top-level isolation unit. Each tenant runs in its own Supabase project for v0.2.x; shared-with-RLS is a v0.3+ option. parent_tenant_id is forward-compat for nested governance.';

-- RLS: tenants table itself is readable by service_role (installer) only.
-- Browser clients see their tenant via the users → tenant_id link.
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenants_self_select ON public.tenants
  FOR SELECT TO authenticated
  USING (id = public.current_tenant_id());

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
-- Mirror of auth.users restricted to a tenant. The auth.users row is the
-- canonical authentication record; this row carries tenant scoping + role.

CREATE TABLE public.users (
  id                  uuid PRIMARY KEY,                    -- mirrors auth.users.id
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email               text NOT NULL,
  display_name        text,
  role                text NOT NULL DEFAULT 'principal'
    CHECK (role IN ('principal','member','viewer')),
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE INDEX idx_users_tenant ON public.users(tenant_id);

CREATE TRIGGER users_touch_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

COMMENT ON TABLE public.users IS
  'Per-tenant user record. id mirrors auth.users.id. role=principal for the tenant owner; member/viewer for v0.3+ multi-user.';

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_tenant_isolation_select ON public.users
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY users_tenant_isolation_modify ON public.users
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());
