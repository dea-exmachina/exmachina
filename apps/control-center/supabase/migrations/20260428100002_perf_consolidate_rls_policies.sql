-- =============================================================================
-- RLS policy consolidation + missing FK index — addresses get_advisors
-- performance WARNs:
--   - multiple_permissive_policies on 11 tables (separate _select + _modify
--     FOR ALL policies forced both to evaluate on every read)
--   - board_members.tenant_id FK lacked a covering index for RLS scans
--
-- The original migrations 0001-0005 created two policies per tenant-scoped
-- table. The _modify policy uses FOR ALL, which already covers SELECT, so the
-- _select policy was redundant. We drop the _select half and rename _modify to
-- the simpler `_isolation` form.
-- =============================================================================

DROP POLICY users_tenant_isolation_select           ON public.users;
DROP POLICY projects_tenant_isolation_select        ON public.projects;
DROP POLICY sprints_tenant_isolation_select         ON public.sprints;
DROP POLICY epics_tenant_isolation_select           ON public.epics;
DROP POLICY cards_tenant_isolation_select           ON public.cards;
DROP POLICY agents_tenant_isolation_select          ON public.agents;
DROP POLICY agent_jds_tenant_isolation_select       ON public.agent_jds;
DROP POLICY boards_tenant_isolation_select          ON public.boards;
DROP POLICY board_members_tenant_isolation_select   ON public.board_members;
DROP POLICY council_reviews_tenant_isolation_select ON public.council_reviews;
DROP POLICY dispatches_tenant_isolation_select      ON public.dispatches;

ALTER POLICY users_tenant_isolation_modify           ON public.users           RENAME TO users_tenant_isolation;
ALTER POLICY projects_tenant_isolation_modify        ON public.projects        RENAME TO projects_tenant_isolation;
ALTER POLICY sprints_tenant_isolation_modify         ON public.sprints         RENAME TO sprints_tenant_isolation;
ALTER POLICY epics_tenant_isolation_modify           ON public.epics           RENAME TO epics_tenant_isolation;
ALTER POLICY cards_tenant_isolation_modify           ON public.cards           RENAME TO cards_tenant_isolation;
ALTER POLICY agents_tenant_isolation_modify          ON public.agents          RENAME TO agents_tenant_isolation;
ALTER POLICY agent_jds_tenant_isolation_modify       ON public.agent_jds       RENAME TO agent_jds_tenant_isolation;
ALTER POLICY boards_tenant_isolation_modify          ON public.boards          RENAME TO boards_tenant_isolation;
ALTER POLICY board_members_tenant_isolation_modify   ON public.board_members   RENAME TO board_members_tenant_isolation;
ALTER POLICY council_reviews_tenant_isolation_modify ON public.council_reviews RENAME TO council_reviews_tenant_isolation;
ALTER POLICY dispatches_tenant_isolation_modify      ON public.dispatches      RENAME TO dispatches_tenant_isolation;

CREATE INDEX idx_board_members_tenant ON public.board_members(tenant_id);
