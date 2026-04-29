-- =============================================================================
-- Security hardening — addresses get_advisors security WARNs surfaced after
-- the initial v0.2.1 schema landed. Adds:
--   - Pinned search_path on RLS helper functions (function_search_path_mutable)
--   - pg_trgm relocated out of the public schema (extension_in_public)
--   - EXECUTE on log_event() revoked from anon + authenticated so PostgREST
--     can't call it via /rest/v1/rpc/log_event
-- =============================================================================

ALTER FUNCTION public.current_tenant_id() SET search_path = public, pg_catalog;
ALTER FUNCTION public.touch_updated_at()  SET search_path = public, pg_catalog;

ALTER EXTENSION pg_trgm SET SCHEMA extensions;

REVOKE EXECUTE ON FUNCTION public.log_event() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_event() FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_event() FROM authenticated;

COMMENT ON FUNCTION public.log_event() IS
  'AFTER trigger only. SECURITY DEFINER, search_path pinned. EXECUTE revoked from anon and authenticated; not callable via PostgREST.';
