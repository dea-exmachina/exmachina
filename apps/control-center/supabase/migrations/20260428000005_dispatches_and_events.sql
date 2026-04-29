-- =============================================================================
-- 0005 — Dispatches and Events
-- =============================================================================
-- Dispatches: Zagara's flow record. One row per team-dispatch attempt against
-- a card. Multiple attempts allowed (rework path).
--
-- Events: append-only audit log. Every state change on a tenant-scoped entity
-- writes a row. Per Council pre-decision review (2026-04-28), event-logging
-- triggers are PART OF migration #1 (this file completes the bundle), not
-- bolted on later.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- dispatches
-- -----------------------------------------------------------------------------

CREATE TABLE public.dispatches (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id                  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  card_id                     uuid REFERENCES public.cards(id) ON DELETE SET NULL,
  attempt                     int NOT NULL DEFAULT 1,
  mode                        text NOT NULL DEFAULT 'lead-coordinated'
    CHECK (mode IN ('lead-coordinated','direct','sequential')),
  team                        jsonb,                          -- agent IDs + roles
  brief_path                  text NOT NULL,                  -- vault path to team-brief.md
  outcome                     text CHECK (outcome IN ('success','rework','abandoned','in-flight')),
  performance_notes_path      text,
  dispatched_at               timestamptz NOT NULL DEFAULT now(),
  closed_at                   timestamptz
);

CREATE INDEX idx_dispatches_card ON public.dispatches(card_id);
CREATE INDEX idx_dispatches_project ON public.dispatches(project_id);
CREATE INDEX idx_dispatches_tenant_outcome ON public.dispatches(tenant_id, outcome);

COMMENT ON TABLE public.dispatches IS
  'Zagara audit trail: no invisible work. One row per team dispatch attempt against a card. attempt counter increments on rework.';

ALTER TABLE public.dispatches ENABLE ROW LEVEL SECURITY;

CREATE POLICY dispatches_tenant_isolation_select ON public.dispatches
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY dispatches_tenant_isolation_modify ON public.dispatches
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- Backfill cards.dispatch_id (latest dispatch attempt) — forward reference from 0002.
ALTER TABLE public.cards
  ADD COLUMN dispatch_id uuid REFERENCES public.dispatches(id) ON DELETE SET NULL;

CREATE INDEX idx_cards_dispatch ON public.cards(dispatch_id);

-- -----------------------------------------------------------------------------
-- events
-- -----------------------------------------------------------------------------
-- Append-only. Never UPDATE; never DELETE (except via cascade from tenant
-- removal). Indexed for time-range and entity scans. partition-ready: if events
-- ever grow large, switch to monthly range partitioning on occurred_at without
-- breaking queries.

CREATE TABLE public.events (
  id                  bigserial PRIMARY KEY,
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  entity_type         text NOT NULL,                  -- table name (projects, sprints, ...)
  entity_id           uuid NOT NULL,
  event_type          text NOT NULL,                  -- INSERT / UPDATE / DELETE / custom
  actor               text,                           -- who triggered (user id, 'system', agent name)
  payload             jsonb,
  occurred_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_tenant_time ON public.events(tenant_id, occurred_at DESC);
CREATE INDEX idx_events_entity ON public.events(tenant_id, entity_type, entity_id, occurred_at DESC);
CREATE INDEX idx_events_type ON public.events(tenant_id, event_type, occurred_at DESC);

COMMENT ON TABLE public.events IS
  'Append-only audit log. Triggers on planning + governance + dispatch tables write here automatically. Foundation for Abathur learning extraction at epic close.';

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY events_tenant_isolation_select ON public.events
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- No INSERT/UPDATE/DELETE policies for non-service-role: events are written
-- only by triggers running as SECURITY DEFINER (service_role bypasses RLS).

-- -----------------------------------------------------------------------------
-- log_event() — generic event-logging trigger
-- -----------------------------------------------------------------------------
-- Fires on INSERT/UPDATE/DELETE of tenant-scoped entities. Captures the row
-- (or before/after for UPDATE) into events.payload. Runs as SECURITY DEFINER
-- so the trigger can write to events even when the calling role is restricted.

CREATE OR REPLACE FUNCTION public.log_event() RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id uuid;
  v_entity_id uuid;
  v_payload   jsonb;
BEGIN
  v_tenant_id := COALESCE(
    (CASE TG_OP WHEN 'DELETE' THEN OLD.tenant_id ELSE NEW.tenant_id END),
    NULL
  );
  v_entity_id := COALESCE(
    (CASE TG_OP WHEN 'DELETE' THEN OLD.id ELSE NEW.id END),
    NULL
  );

  IF v_tenant_id IS NULL OR v_entity_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_payload := CASE TG_OP
    WHEN 'INSERT' THEN jsonb_build_object('new', to_jsonb(NEW))
    WHEN 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    WHEN 'DELETE' THEN jsonb_build_object('old', to_jsonb(OLD))
  END;

  INSERT INTO public.events (
    tenant_id, entity_type, entity_id, event_type, actor, payload
  ) VALUES (
    v_tenant_id,
    TG_TABLE_NAME,
    v_entity_id,
    TG_OP,
    nullif(current_setting('app.current_actor', true), ''),
    v_payload
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.log_event() IS
  'Generic AFTER trigger that appends a row to events for any tenant-scoped table. SECURITY DEFINER so it can write events under restricted roles.';

-- -----------------------------------------------------------------------------
-- Attach event-logging triggers to all stateful tables
-- -----------------------------------------------------------------------------

CREATE TRIGGER projects_log_event
  AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.log_event();

CREATE TRIGGER sprints_log_event
  AFTER INSERT OR UPDATE OR DELETE ON public.sprints
  FOR EACH ROW EXECUTE FUNCTION public.log_event();

CREATE TRIGGER epics_log_event
  AFTER INSERT OR UPDATE OR DELETE ON public.epics
  FOR EACH ROW EXECUTE FUNCTION public.log_event();

CREATE TRIGGER cards_log_event
  AFTER INSERT OR UPDATE OR DELETE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.log_event();

CREATE TRIGGER agents_log_event
  AFTER INSERT OR UPDATE OR DELETE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.log_event();

CREATE TRIGGER agent_jds_log_event
  AFTER INSERT OR UPDATE OR DELETE ON public.agent_jds
  FOR EACH ROW EXECUTE FUNCTION public.log_event();

CREATE TRIGGER council_reviews_log_event
  AFTER INSERT OR UPDATE OR DELETE ON public.council_reviews
  FOR EACH ROW EXECUTE FUNCTION public.log_event();

CREATE TRIGGER dispatches_log_event
  AFTER INSERT OR UPDATE OR DELETE ON public.dispatches
  FOR EACH ROW EXECUTE FUNCTION public.log_event();

-- Boards/board_members are configuration; included for completeness.
CREATE TRIGGER boards_log_event
  AFTER INSERT OR UPDATE OR DELETE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.log_event();

CREATE TRIGGER board_members_log_event
  AFTER INSERT OR UPDATE OR DELETE ON public.board_members
  FOR EACH ROW EXECUTE FUNCTION public.log_event();
