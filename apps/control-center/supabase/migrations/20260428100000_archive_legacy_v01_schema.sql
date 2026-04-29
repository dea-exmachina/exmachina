-- =============================================================================
-- Archive legacy v0.1-experimental schema before applying v0.2.1.
--
-- The 9 tables, 10 enum types, and 14 functions in this project predate v0.2.1
-- and are kept as a read-only inspection skeleton (the kanban model in cards/
-- comments/events is worth mining later). Conflicts with v0.2.1 names are
-- resolved by prefixing legacy_*.
--
-- All legacy functions are dropped with CASCADE — this also removes their
-- triggers and any DEFAULT clauses that called them. Table data is preserved.
--
-- Applied to project wwwsktwddjmffrcbqiww (exmachina) on 2026-04-28.
-- This migration is a one-time archive; on a fresh project (no legacy schema),
-- everything below is a no-op because IF EXISTS / nothing to rename.
-- =============================================================================

-- Drop legacy functions (CASCADE removes dependent triggers + column defaults)
DROP FUNCTION IF EXISTS public.create_card(text, text, card_type_t, text, lane_t, priority_t, delegation_t, text, text, text, text[], text, text) CASCADE;
DROP FUNCTION IF EXISTS public.transition_card(text, lane_t, text, text, comment_type_t) CASCADE;
DROP FUNCTION IF EXISTS public.emit_card_created() CASCADE;
DROP FUNCTION IF EXISTS public.emit_card_moved() CASCADE;
DROP FUNCTION IF EXISTS public.emit_comment_added() CASCADE;
DROP FUNCTION IF EXISTS public.generate_card_id() CASCADE;
DROP FUNCTION IF EXISTS public.lane_content_gate() CASCADE;
DROP FUNCTION IF EXISTS public.rls_auto_enable() CASCADE;
DROP FUNCTION IF EXISTS public.root_wrapper_id() CASCADE;
DROP FUNCTION IF EXISTS public.set_completed_at() CASCADE;
DROP FUNCTION IF EXISTS public.surface_gate() CASCADE;
DROP FUNCTION IF EXISTS public.touch_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.validate_assignee() CASCADE;
DROP FUNCTION IF EXISTS public.validate_lane_transition() CASCADE;

-- Rename tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='context_wrappers') THEN
    ALTER TABLE public.context_wrappers RENAME TO legacy_context_wrappers;
    ALTER TABLE public.projects         RENAME TO legacy_projects;
    ALTER TABLE public.cards            RENAME TO legacy_cards;
    ALTER TABLE public.comments         RENAME TO legacy_comments;
    ALTER TABLE public.events           RENAME TO legacy_events;
    ALTER TABLE public.agents           RENAME TO legacy_agents;
    ALTER TABLE public.agent_scores     RENAME TO legacy_agent_scores;
    ALTER TABLE public.plans            RENAME TO legacy_plans;
    ALTER TABLE public.plan_cards       RENAME TO legacy_plan_cards;

    ALTER TABLE public.legacy_context_wrappers RENAME CONSTRAINT context_wrappers_pkey TO legacy_context_wrappers_pkey;
    ALTER TABLE public.legacy_projects         RENAME CONSTRAINT projects_pkey         TO legacy_projects_pkey;
    ALTER TABLE public.legacy_cards            RENAME CONSTRAINT cards_pkey            TO legacy_cards_pkey;
    ALTER TABLE public.legacy_comments         RENAME CONSTRAINT comments_pkey         TO legacy_comments_pkey;
    ALTER TABLE public.legacy_events           RENAME CONSTRAINT events_pkey           TO legacy_events_pkey;
    ALTER TABLE public.legacy_agents           RENAME CONSTRAINT agents_pkey           TO legacy_agents_pkey;
    ALTER TABLE public.legacy_agent_scores     RENAME CONSTRAINT agent_scores_pkey     TO legacy_agent_scores_pkey;
    ALTER TABLE public.legacy_plans            RENAME CONSTRAINT plans_pkey            TO legacy_plans_pkey;
    ALTER TABLE public.legacy_plan_cards       RENAME CONSTRAINT plan_cards_pkey       TO legacy_plan_cards_pkey;

    ALTER TABLE public.legacy_projects RENAME CONSTRAINT projects_slug_key   TO legacy_projects_slug_key;
    ALTER TABLE public.legacy_cards    RENAME CONSTRAINT cards_card_id_key   TO legacy_cards_card_id_key;
    ALTER TABLE public.legacy_agents   RENAME CONSTRAINT agents_slug_key     TO legacy_agents_slug_key;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_type WHERE typname='wrapper_kind_t' AND typnamespace = 'public'::regnamespace) THEN
    ALTER TYPE public.wrapper_kind_t  RENAME TO legacy_wrapper_kind_t;
    ALTER TYPE public.lane_t          RENAME TO legacy_lane_t;
    ALTER TYPE public.card_type_t     RENAME TO legacy_card_type_t;
    ALTER TYPE public.priority_t      RENAME TO legacy_priority_t;
    ALTER TYPE public.delegation_t    RENAME TO legacy_delegation_t;
    ALTER TYPE public.comment_type_t  RENAME TO legacy_comment_type_t;
    ALTER TYPE public.event_type_t    RENAME TO legacy_event_type_t;
    ALTER TYPE public.visibility_t    RENAME TO legacy_visibility_t;
    ALTER TYPE public.score_level_t   RENAME TO legacy_score_level_t;
    ALTER TYPE public.plan_status_t   RENAME TO legacy_plan_status_t;
  END IF;
END $$;
