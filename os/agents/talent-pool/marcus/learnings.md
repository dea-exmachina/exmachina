# Marcus — Domain Learnings

> Domain-general knowledge accumulated across projects. Promoted from project-specific learnings during `/dea-learn` weekly reviews.

---

## Status

- **2026-02-17**: No tasks completed yet. Marcus (Executive Ghostwriter) is part of Team Melody for job search content.
- Assigned to: Job Search project (`JOB-*` cards)
- Role: CV tailoring, cover letters, LinkedIn optimization, professional positioning
- No EWMA score — awaiting first task assignment.

---

## cv_tailor.py Role Key Matching (2026-04-06)

The script matches tailoring map `roles` keys against italic title lines in the Master Resume .docx. Keys must be **exact string matches** to the italic text. Current Master Resume (post-pivot) uses these title strings:

| Tailoring Map Key | Master Resume Italic Line |
|---|---|
| `Value Creation Consultant` | *Value Creation Consultant* |
| `Founding COO & Board Member` | *Founding COO & Board Member* |
| `Lead, Front-Office Technology` | *Lead, Front-Office Technology* |
| `Principal (2014–2019) \| Senior Associate (2013–2014)` | *Principal (2014–2019) \| Senior Associate (2013–2014)* |
| `Senior Business Consultant / Business Consultant` | *Senior Business Consultant / Business Consultant* |

**WARNING**: Old master used different title strings. If reusing old tailoring maps, role keys will NOT match. Always generate fresh tailoring maps for the new master.

## Positioning Pivot (2026-04-06)

- **Old**: "Operations & Technology Executive" — Corp Dev & Strategy as Lane 1
- **New**: "Technology Operator | Growth-Stage & PE-Backed Companies" — Technology Operator as Lane 1
- Before tailoring, identify 1-2 archetypes from `candidate-brief.md` § Role Archetypes
- Run keyword injection process from `keyword-injection.md` — target 70%+ coverage
- Include `keyword_coverage` key in every tailoring map for audit trail
- Cover letter should name the specific role and connect proof points to JD requirements — don't be generic

---

_Last updated: 2026-04-06_
