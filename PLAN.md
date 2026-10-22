# Stallion: Columbia Bathroom Finder

> **Status:** Implementation plan, ready for a coding agent  
> **Working name:** Stallion (easy to rename later)  
> **Scope:** Columbia Morningside campus, mobile-first web app  
> **Target:** A usable private beta in 10–14 focused development days, followed by 1–2 weeks of data collection and validation  
> **Product inspiration:** [LionDine](https://liondine.com/). Borrow its fast, low-friction, campus-specific approach, **not** its code or visual identity.

## 0. Instructions for the coding agent

You are authorized to implement this project in **small, reviewable milestones**. Treat this document as the source of truth for MVP scope and requirements.

1. **Inspect the repository first.** Read existing files, the current Git status/diff, and any `AGENTS.md` instructions. Do not overwrite unrelated work.
2. **Before coding**, present a concise implementation sequence and identify missing credentials or consequential ambiguities. Use the defaults in this plan unless the owner explicitly overrides them; do not stall for cosmetic choices.
3. Implement one milestone at a time. After each milestone, run relevant checks, report what changed, how to test it, and what remains. Do **not** commit, push, or deploy unless explicitly asked.
4. Prioritize a working vertical slice over architecture for hypothetical scale. Keep code understandable to a student developer learning the stack.
5. Use TypeScript strict mode, typed database access, runtime request validation, accessible semantic HTML, and clear loading/empty/error states. Add tests for core logic.
6. Never fabricate Columbia bathroom locations, bathroom reviews, opening hours, access permissions, accessibility features, live occupancy, or walking times. Separate **officially listed**, **field-verified**, and **community-reported** information.
7. Do not build beyond the MVP section until it passes the stated acceptance criteria. Record deviations in `docs/DECISIONS.md`.

## 1. Product definition

### The problem

Students need somewhere nearby to use the bathroom, but the closest bathroom on a map may be difficult to find, inaccessible to them, dirty, crowded, or behind an ID-only door. Columbia has official restroom maps, but they are not a searchable, bathroom-by-bathroom discovery experience with practical directions and recent first-hand observations.

### One-sentence product

**Stallion helps Columbia students find the closest *usable* bathroom and decide where they actually want to go.**

### Primary user story

> I'm near Butler, Mudd, or Lerner and need a bathroom. I open Stallion, select my current building or share my location, see the nearest verified options, filter for my needs, and tap a result for the floor, landmarks, access restrictions, and recent reviews.

### Product principles

- **Utility first; humor second.** “Poop Score” can be playful, but restroom access and accessibility details must be clear and respectful.
- **No login to find a bathroom.** Browsing must work immediately.
- **Do not equate geolocation with indoor positioning.** User GPS may be off by an entire building. Provide a manual building selector as a first-class alternative.
- **Honest freshness.** “Checked 3 days ago” is useful; “available now” is misleading without a live sensor.
- **Verified > numerous.** Twenty high-quality records are more valuable than 100 invented or badly sourced records.
- **Not affiliated with Columbia University.** Include a visible independent-project disclaimer.

## 2. MVP scope

### P0: Must ship

1. **Home / Discover** at `/`:
   - Mobile-first list of bathroom cards; render usable results even if location permission or the map fails.
   - Search/select a campus building as the starting point. Optional “Use my location” via the browser's one-time geolocation permission.
   - Nearest sorting, based on an **approximate outdoor distance to the building entrance**, not indoor navigation or promised walking ETA.
   - Filters: all-gender, wheelchair-accessible (**only if verified**), single-occupancy/private, Columbia ID required/allowed, verified-only.
   - “Closest”, “Highest Poop Score”, and “Recently checked” sorting.
   - A clear legend for official listing versus in-person verification; unknown information must read “Unknown”.
2. **Map / List toggle**:
   - Pins at building entrances, not imagined precise locations inside buildings.
   - Clicking a pin selects the same restroom card as the list.
   - Multiple bathrooms in one building may share a pin; show a count or chooser rather than overlapping indistinguishable pins.
   - Works on narrow phone screens. Include correct map attribution.
3. **Restroom details** at `/bathrooms/[id]`:
   - Building, level as Columbia labels it (e.g. “100 Level”, not automatically “1st floor”), nearby landmarks, practical entrance/wayfinding instructions.
   - Type, accessibility, single-occupancy status, access policy, optional stall count where field-confirmed.
   - “Poop Score” (if enough observations), total observation count, last checked date, published observations, confidence labels.
   - “Show building on map” and external walking-directions link to the **building entrance**. No invented indoor turn-by-turn directions.
   - Hours/access section using conservative language such as “Building access schedule, subject to change”.
4. **Field-inspector workflow** at `/admin` and `/admin/inspect`:
   - Sign-in limited to the owner and invited testers via Supabase Auth.
   - Search/select a restroom, then log an observation in under **20 seconds** on a phone.
   - Fields: cleanliness (1–5), privacy (1–5), upkeep (1–5), toilet paper (yes/no/unknown), soap (yes/no/unknown), approximate queue (none/short/long/unknown), closed/out-of-order (yes/no/unknown), short note (optional), observed time (server-created).
   - Permit admin to add/edit bathroom metadata after field inspection, update verified status, and reject duplicates.
   - Allow multiple reports on one bathroom across different visits, without pretending these are distinct locations.
5. **Community feedback**:
   - A “Report an issue / Suggest a correction” form on the bathroom detail page, with optional observation ratings.
   - Submissions default to **pending moderation**. Do not affect public scores or availability until approved.
   - Add bot protection and a persistent rate limit *before* accepting anonymous public submissions. If they are not configured, hide/disable the submission form and show a non-deceptive temporary message, rather than deploying an unprotected endpoint.
   - Admin queue to approve/reject feedback.
6. **Basic deployment**:
   - Production-ready public URL, database migrations, environment configuration, error monitoring/logging, responsive UI, and an owner-friendly seeding/verification workflow.

### P1: After validated launch

- User-submitted star ratings that automatically publish under a reputation/moderation system.
- Bookmark/favorites (local storage first).
- “Best bathroom within 5 minutes” with **real pedestrian routing data** if a suitable routing provider is adopted.
- Optional filters for changing tables and other amenities after verified data exists.
- Crowd-sourced queue reports with an explicit timestamp and expiration. Label as **recent report**, not live availability.
- Additional campuses: Barnard, Manhattanville, then other universities if useful.
- Optional PWA / install-to-home-screen and offline cached listings.

### Explicitly out of scope

- Real-time occupied/free stall tracking, unless real infrastructure/data becomes available.
- Indoor GPS navigation and automatic floor detection.
- Tracking a user's individual bathroom visits, bodily functions, or identity.
- Publicly posted photographs from inside bathrooms, photo uploads, and location-history tracking.
- Student social features, leaderboards for personal bathroom habits, comments/DMs, and gamification.
- Complex recommendation ML, microservices, custom routing engines, or native mobile apps.

## 3. Initial data and its limits

### Official starting points

These are **candidate sources**, not a ready-to-publish database of verified bathroom conditions:

1. Columbia University Life, Maps & Locations: https://universitylife.columbia.edu/content/maps-locations
2. Morningside Gender-Neutral Restroom Map (official PDF): https://cufo.columbia.edu/sites/default/files/content/MorningsideGenderNeutralRestroomMap.pdf
3. Columbia Public Safety, Maps & Schedules: https://publicsafety.columbia.edu/content/maps-schedules
4. Fall 2026 Academic Building Swipe Access Schedule (valid September 8–December 23, 2026; do **not** assume valid indefinitely): https://publicsafety.columbia.edu/sites/default/files/content/FALL%20Academic%20Building%20Swipe%20Access%20Schedule%202026%20Rev.2.9.14.2026.pdf
5. Columbia Public Safety, Building Access: https://publicsafety.columbia.edu/content/building-access
6. Morningside Disability Access Map: https://publicsafety.columbia.edu/sites/default/files/content/Columbia_Univ_Morningside_Accessibility_Map_05-2019_0.pdf

The official gender-neutral restroom map lists **27 numbered locations/building entries**, some with several levels. This is **not** equivalent to 27 bathrooms with verified cleanliness, entrance directions, or current access. The public list can include clearly marked official-but-unverified candidates, but the launch dataset must have meaningful on-site coverage. It also must not assume the official gender-neutral map covers every restroom on campus.

### Data-collection target

- **Beta:** at least 10 *distinct, field-verified restroom locations* across 5 or more buildings.
- **Initial public launch:** aim for 20–30 distinct restrooms across at least 10 buildings, with 1+ on-site inspection each; aim for 2+ inspections on commonly used locations at different times.
- Start with high-footfall buildings such as Butler, Lerner, Mudd, Pupin, Uris, and others the tester can legally access. These are **priorities to investigate**, not assertions about specific restroom availability.
- For each candidate, record source URL, source access date, last on-site verification date, and which facts are confirmed vs unknown.
- **Never fabricate observations** to achieve quotas. Slow down launch or label records unverified if needed.

### Your friend's job: founding field inspector

Assumption: one trusted tester may visit bathrooms roughly five times daily. **That does not mean five *unique* bathrooms or independent evaluations per day**. Use natural trips and separate verification walks; do not ask anyone to change their bathroom habits to generate data.

Daily assignment:

1. Check 2–3 distinct locations when practical, prioritizing unverified or stale records.
2. For each location, confirm exact building + level + a safe wayfinding landmark, access permission, and whether it exists.
3. Submit a fast 1–5 rating for cleanliness, privacy, upkeep, and basic consumables availability.
4. Record whether access was checked with a Columbia ID, was unrestricted at that moment, or was not established; do not infer public availability from one successful entry.
5. Record concrete issues (“third stall out of order”) without photographing users or sensitive spaces.
6. Periodically revisit popular bathrooms, preferably at different dayparts. Do not count revisits as new records.

Allow the inspector to draft entries on a phone, but avoid creating duplicate bathrooms when the floor is mislabelled. Provide a simple admin table showing gaps: missing floor, unverified location, last inspection age, uncertain access, possible duplicate.

## 4. UX and visual direction

Style: clean, dense, fast, lighthearted campus utility. LionDine is inspiration for immediate usability, not a pixel-perfect template.

### Main mobile view

```text
┌───────────────────────────────────┐
│ STALLION 🦁           About       │
│ Find your next throne.            │
│                                   │
│ [ Near: Select a building     v ] │
│ [ Use my location ]               │
│                                   │
│ [All-gender] [Accessible] [Private]│
│ Sort: [Closest v]   [List] [Map]  │
│                                   │
│ [Bathroom name / building]        │
│ 100 Level · CUID may be required  │
│ ~180 m outdoor distance · Verified│
│ Poop Score 4.2/5 · 6 observations │
│ Clean 4.4 · Private 4.0           │
│ [Details / Directions]            │
│                                   │
│ [... more results ...]            │
└───────────────────────────────────┘
```

This is a wireframe, not fake production data. Build with mock data during development, and remove or clearly label mock records before public deployment.

### Detail view

- Large location name, floor, key accessibility/access labels.
- Distance estimate and building-entrance map marker.
- One-paragraph wayfinding instructions, e.g. “Enter from [verified entrance], take [verified stairs/elevator] to [level], restroom by [landmark].” Do not invent these details.
- Score breakdown, observation count, recency, and feedback form.
- Source and last verified stamps.
- Warning when schedule is expired, facility is restricted, report is stale, or accessibility has not been verified.

### Accessibility baseline

Support keyboard navigation, screen-reader labels, visible focus states, sufficient contrast, touch targets >=44 px, readable text, and reduced-motion preferences. Do not encode restroom type or accessibility by color alone. A restroom should never be tagged wheelchair-accessible solely because the **building** has an accessible entrance.

## 5. Technology stack and architecture

Choose **one full-stack TypeScript app**, not separate Python and Node services.

| Layer | Default choice | Rationale |
|---|---|---|
| App | Next.js App Router + strict TypeScript | UI and server endpoints in one repo |
| UI | Tailwind CSS + shadcn/ui primitives where useful | Fast responsive development, accessible controls |
| Database | Supabase Postgres | Hosted SQL, migrations, auth, simple MVP ops |
| Auth | Supabase Auth, admin/inspector accounts only | Browse anonymously, restrict privileged writes |
| Map | MapLibre GL JS + a hosted map-tile provider | Interactive campus pins; honor tile license/attribution |
| Validation | Zod | Validate all external input and environment variables |
| Test | Vitest + React Testing Library; Playwright smoke tests | Cover ranking and key user flows |
| Deployment | Vercel + Supabase | Quick web launch and preview deployments |
| Anonymous feedback protection | Cloudflare Turnstile plus persistent rate limiting | Mitigate spam without mandatory public accounts |

Constraints:

- Use currently supported stable versions and lockfiles, not guessed version numbers.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY`, admin secrets, or Turnstile secret to client bundles.
- Enable Postgres RLS. Public users can read only **published, active** restrooms and **approved, published** observations. Admin writes require authenticated authorization on the server.
- Public feedback must go through a **server-side, validated, rate-limited handler** that only creates pending items; clients cannot set approval states or impersonate inspectors.
- Implement a **working list view without an API key** so missing map credentials don't block development. Map feature should show a helpful configuration/error state.
- Use no external AI API; the product does not need one.

### Suggested directory structure

```text
src/
  app/
    page.tsx                    # discovery view
    bathrooms/[id]/page.tsx    # restroom detail
    admin/page.tsx             # overview and pending queue
    admin/inspect/page.tsx     # rapid inspection form
    admin/bathrooms/page.tsx   # edit verified restroom data
    api/feedback/route.ts      # anonymous, protected submission
  components/
    discovery/
    bathrooms/
    map/
    inspection/
    ui/
  lib/
    db/                        # typed Supabase queries/mappers
    auth/                      # admin authorization
    geo.ts                     # haversine and coordinate helpers
    rankings.ts                # deterministic scoring and sorting
    validation.ts              # Zod schemas
    access.ts                  # conservative access labels
  types/
supabase/
  migrations/
  seed/
docs/
  DECISIONS.md
  FIELD_GUIDE.md
  DEPLOYMENT.md
.env.example
README.md
PLAN.md
```

Directory names can follow Supabase CLI conventions rather than forcing this exact structure. Do not introduce a redundant extra database ORM without a concrete reason.

## 6. Database contract

Use UUID primary keys and UTC timestamps. Generate SQL migrations (not manually maintained production tables). The following is a **logical schema**; implement precise SQL column types, enum/check constraints, FKs, indexes, defaults, and RLS in the first database milestone.

### `buildings`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `name` | text unique | e.g. “Mudd Hall” |
| `aliases` | text[] | e.g. “Seeley W. Mudd” |
| `campus` | text | default `morningside` |
| `entrance_lat`, `entrance_lng` | double precision nullable | **verified entrance** coordinates, not guessed indoor coordinates |
| `entrance_notes` | text nullable | useful approach/access note |
| `access_category` | enum | `unrestricted`, `columbia_id`, `restricted`, `unknown` |
| `access_schedule_text` | text nullable | display only; omit instead of inventing |
| `access_schedule_source_url` | text nullable | official schedule or building page |
| `access_schedule_valid_until` | date nullable | triggers expiry warning |
| `created_at`, `updated_at` | timestamptz | |

### `bathrooms`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `building_id` | UUID FK | required |
| `slug` | text unique | stable human-readable URL option |
| `floor_label` | text | preserve Columbia’s own notation |
| `location_hint` | text nullable | corridor/landmark, no secured access details |
| `restroom_type` | enum | `all_gender`, `mens`, `womens`, `unknown` |
| `single_occupancy` | boolean nullable | `NULL` = unknown |
| `wheelchair_accessible` | boolean nullable | verified at **restroom level**, not building level |
| `stall_count` | integer nullable | positive; only if verified |
| `access_category_override` | enum nullable | if stricter/different from building |
| `source_url` | text nullable | provenance for listed locations |
| `verification_status` | enum | `official_unverified`, `field_verified`, `community_unverified` |
| `verified_at` | timestamptz nullable | only field inspection can set it |
| `is_active` | boolean | soft-hide incorrect/decommissioned entries |
| `created_at`, `updated_at` | timestamptz | |

Do not impose `UNIQUE(building_id, floor_label)` because multiple bathrooms can exist on one level. Dedupe by admin review using location hints.

### `observations`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `bathroom_id` | UUID FK | required |
| `source_kind` | enum | `inspector`, `community` |
| `inspector_user_id` | UUID nullable | only for signed-in inspector |
| `cleanliness`, `privacy`, `upkeep` | smallint nullable | each 1–5; nullable for issue-only submissions |
| `toilet_paper`, `soap` | nullable boolean | nullable = unknown |
| `queue_level` | enum nullable | `none`, `short`, `long`, `unknown` |
| `out_of_order` | boolean nullable | applies to observed condition, not a live signal |
| `note` | varchar(280) nullable | sanitized, no HTML |
| `status` | enum | `pending`, `published`, `rejected` |
| `observed_at` | timestamptz | server-assigned for community; admin may correct with audit |
| `created_at` | timestamptz | |

Inspector observations may be published directly after authorized submission. Community observations **always** enter `pending` and are published only by admin. All scores count only observations with `status = published` and with all three numeric ratings present. The UI must label inspector versus community source, never imply anonymous community feedback was staff-verified.

### `feedback_reports`

Use for corrections rather than numerical visits (wrong floor, incorrect access, duplicate bathroom, outage report). Fields: `id`, `bathroom_id`, `report_type` enum, `message` limited to 280 chars, `status` pending/approved/rejected, `created_at`, `reviewed_at`. Approval should prompt admin to update the canonical bathroom row if appropriate. No direct mutation of bathroom metadata from public submissions.

### `admin_users`

Use Supabase Auth IDs plus a tightly controlled table (or secure server-only allowlist) of email/UUID identities and roles `owner`/`inspector`. Never trust role data supplied by the browser. Inspectors can file observations; only owners approve community feedback or modify canonical bathroom data. Do not expose individual inspector identities to public readers.

### Indexes and constraints

- Index `bathrooms(building_id, is_active)` and `observations(bathroom_id, status, observed_at DESC)`.
- Index pending review statuses and `buildings(name)`; add full-text/search index only if measured query needs it.
- Enforce score bounds, enum/check values, nonempty floor/building names, and valid lat/lng ranges in SQL.
- Ensure no anonymous update/delete policy exists for the canonical tables.
- Add reliable `updated_at` handling and migration validation.

## 7. Ranking, distance, and availability rules

### Nearby

1. Starting point = selected building's **entrance coordinates** or consented browser geolocation.
2. Measure **haversine straight-line distance** in meters to each target building entrance, call this “approx. distance” or “straight-line distance”. This is **not** walking route time/distance.
3. Default ranking: nearby first, then published observation recency, then alphabetical tie-breaker. Never silently rank an inaccessible restroom as the best choice.
4. Filter clearly restricted spaces from default recommended results unless the selected access mode allows them; an unknown access policy requires an explicit warning.
5. If no start coordinate exists, show a sensible alphabetic or score-based list with a visible explanation, not a fake distance.
6. If multiple candidate bathrooms have the same building entrance coordinate, preserve floor and location distinctions.

### Poop Score

For a **published, complete** observation `i`, compute:

`raw_i = 0.40 * cleanliness_i + 0.35 * privacy_i + 0.25 * upkeep_i`

For a bathroom with `n` published complete observations, smooth the rating:

`score = (n * mean(raw_i) + 3 * 3.5) / (n + 3)`

- Output 1–5 with **one decimal**, never more.
- If `n = 0`, show **“Not yet rated”**, not the 3.5 prior.
- If `n < 3`, display **“Provisional score”** and the observation count.
- Show `n` and a last-observed timestamp with every score.
- Do not include unreviewed reports, missing field values, or static accessibility labels in the score.
- Keep raw observations so the scoring formula can be revised later without data loss.
- Tests must verify arithmetic, missing ratings, moderation exclusion, and deterministic sort ties.

### Available / open wording

- **Never** display “stall free”, “open now”, “0 minute wait”, or “available” based on past reports.
- Buildings with a dated published schedule can display **“Building access typically listed for [time/day]”** with a validity warning and a source link. Even if within schedule, label as an *estimate*, not a real-time guarantee.
- Reported closures should display a timestamp and “Reported issue, not live verified”; a moderator can mark a restroom temporarily unavailable with a reason and explicit last-update time.
- If schedule, access, or accessibility is unknown, preserve that uncertainty rather than inferring values.

## 8. Security, trust, and privacy

- The app must work without a user account for browsing; use geolocation only after a button press and only to calculate nearby results in-browser. **Do not save the user's coordinates** to the backend, local storage, analytics, logs, or URL parameters by default.
- Server endpoints must validate JSON with Zod and reject oversized requests. Escape/render all user text as plain text, never unsanitized HTML or Markdown-with-HTML.
- Turnstile verification must be server-side. Anonymous submissions need persistent abuse protection (Redis-backed fixed window or equivalent); do not rely on in-memory rate limits in serverless production.
- Only allow public writes to pending submissions through the protected route; restrict admin-only operations server-side and via RLS.
- Do not include API credentials in Git; provide `.env.example`. Do not log secrets or full user coordinates.
- Do not collect email, UNI, or CUID from public visitors. Do not publish inspector user accounts, raw IP addresses, or public contributor identity.
- No bathroom interior photos, no people photos, no exact timestamps of identifiable people visiting bathrooms, and no sharing of bypass methods/access codes for restricted buildings.
- A neutral, factual presentation of gendered/all-gender bathroom types and accessibility is required. Explicitly distinguish `unknown` from `false`.
- Footer: “Independent student project. Not affiliated with or endorsed by Columbia University. Locations and access information may change.”

## 9. Screens and functionality acceptance criteria

### A. Homepage

- [ ] Loads on mobile without login.
- [ ] Initial list exists even with denied GPS permission.
- [ ] Building search/select updates distances and sorted results.
- [ ] Browser-location button handles permission success, denial, timeout, and invalid coordinates gracefully.
- [ ] Filters and sorting work together with an explicit empty state.
- [ ] Map pins and list cards refer to the same database IDs.
- [ ] Multiple bathrooms sharing a pin remain selectable.

### B. Details

- [ ] Every card has a working unique details URL.
- [ ] Shows building, verified level, access requirement, and provenance.
- [ ] Shows unverified/unknown values clearly and never invents time or availability.
- [ ] Score and count match published complete observations.
- [ ] Building-entrance directions link works; no indoor route claims.
- [ ] Issues/corrections can be submitted only if anti-spam controls are configured.

### C. Admin and collector

- [ ] Unauthorized visitors cannot view admin data or call privileged mutations.
- [ ] Inspector can find a restroom and complete a submission on a phone in under 20 seconds in a usability test.
- [ ] Owner can add/edit/hide bathrooms and review suggested corrections.
- [ ] One person's repeat inspections add new observations to the existing restroom, not duplicate restroom rows.
- [ ] Moderating a community report updates the public detail view correctly, without changing location metadata automatically.
- [ ] Editing a restroom maintains source and verification history.

### D. Quality and safety

- [ ] `typecheck`, lint, and production build pass.
- [ ] Unit tests for scores, filter combinations, distance, and access policy pass.
- [ ] At least one end-to-end mobile viewport smoke test: browse → select building → filter → details.
- [ ] At least one end-to-end admin test: sign in → inspection → published observation.
- [ ] At least one moderation test: anonymous pending submission cannot influence public score before approval.
- [ ] RLS tests or explicit authorization checks demonstrate that anonymous users cannot modify canonical data.
- [ ] Tested at 375 px wide, desktop, and with keyboard-only navigation.
- [ ] No sample/fake observations appear as real production ratings.

## 10. Implementation milestones and estimated work

Estimates assume one developer (or one coding agent supervised by a developer), familiar with React/TypeScript, and do **not** include all time required to collect trustworthy field data. Agent-generated code still needs manual review/testing.

| Phase | Time | Deliverable | Stop/go gate |
|---|---:|---|---|
| **M0: Setup + design** | 0.5–1 day | Next.js scaffold, Tailwind, `.env.example`, README, skeleton mobile shell, decisions doc | Runs locally |
| **M1: Data model + fixtures** | 1–2 days | Supabase migrations, RLS, typed queries, documented source fields, local demo seed | Migrations pass; no fabricated production data |
| **M2: Discover + details** | 2–3 days | Building selector, filters, sorting, cards, detail page, scoring and distance tests | Works fully in list mode without map/GPS |
| **M3: Map + GPS** | 1–2 days | Pins, list/map sync, optional browser location, map fallback | Functions on mobile and denied GPS |
| **M4: Admin + field collection** | 2–3 days | Auth, rapid inspection form, metadata editor, review queue | Friend can use it on phone |
| **M5: Community reports + hardening** | 2–3 days | Protected pending feedback, anti-spam, tests, deployment docs | Security and E2E checks pass |
| **M6: Field validation + launch** | 1–2 weeks alongside dev | 20–30 verified records, QA of directions/access, production launch | Real users can find confirmed locations |

**Scope-cut order if time is short:** keep accurate list/details + building selection + admin inspection; postpone map polish, anonymous feedback, detailed hours, and all P1 features. Never cut data provenance or access warnings.

### Phase-by-phase instructions

**M0:** Initialize pnpm repo, choose a supported Node version and lock dependencies. Set up lint/typecheck/test scripts. Add a minimal branded app shell and loading/error states. Write README local startup commands. Start `docs/DECISIONS.md`.

**M1:** Create migrations, RLS policies, server and browser Supabase clients with correct secret boundaries, typed domain interfaces and seed fixtures. Seed a handful of **clearly tagged fictional/demo** records for local development only. Build an import template (`CSV` or `JSON`) for verified campus locations and source links. Do not bulk-guess latitude/longitude.

**M2:** Implement database read, a debounced building search/dropdown, restroom cards, details page, typed filters, correct haversine sort, and scoring. Test edge cases: no ratings, equal distances, unknown access, no starting point, and same building/multiple bathrooms.

**M3:** Add MapLibre client component with appropriate hosted tiles, lazy loading, map/list state synchronization, map attribution, and failure fallback. Add explicit geolocation flow with no persistent coordinate storage. Do not attempt interior routing.

**M4:** Implement Supabase Auth, role guards, inspection form, admin editor, duplicate warning, and observation history. Optimize for real phone data entry in corridors. Add test accounts only in development and explain how to invite the actual tester.

**M5:** Add pending submissions, Turnstile verification, persistent rate limiting, owner moderation, rate/abuse tests, accessibility checks, error handling, deployment instructions, and production configuration checklist. If no anti-spam credentials are available, ship with public form disabled and explain why.

**M6:** Import only sourced/restroom entries; have the inspector verify access and directions. Remove fictional fixtures from production, review copied facts against current official pages, test a minimum of 10 physical directions end to end, invite 5–10 students to try finding a restroom, fix top usability problems, and only then publish publicly.

## 11. Definition of done for the public beta

All must be true:

- [ ] A student can identify a nearby *plausibly accessible* bathroom from their current building in **three taps or fewer** after opening the homepage (excluding typing search text).
- [ ] At least **10 distinct field-verified restrooms across 5+ buildings** for private beta; ideally **20–30 across 10+ buildings** for wider launch.
- [ ] Every public restroom record includes a precise building and level or is clearly marked incomplete/unverified; all uncertain access and accessibility fields are labeled.
- [ ] A verified bathroom has a clear physical wayfinding description checked by a real person.
- [ ] The user can use the app without granting GPS permission or creating an account.
- [ ] Friend/tester can submit a real inspection from a phone reliably.
- [ ] Ratings are traceable to published observations, with no invented real-time availability.
- [ ] Public contribution endpoints cannot modify canonical data and are spam-protected before enabling them.
- [ ] Typecheck, lint, tests, production build and mobile smoke tests pass.
- [ ] Footer disclaimer and source citations are present.

## 12. Environment variables and operations

Use `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or the current supported publishable-key naming), server-side `SUPABASE_SERVICE_ROLE_KEY` only if genuinely required, `NEXT_PUBLIC_MAPTILER_KEY` (or chosen hosted tile provider), `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, and a persistent rate-limit datastore's URL/credentials if enabling anonymous submissions.

- Do not hardcode secrets or commit `.env.local`.
- Document Supabase project creation, migration deployment, owner/admin invitation, map provider setup, Turnstile configuration, and Vercel environment settings.
- Provide commands for database migration, seed import, local dev, tests, and production build in `README.md`.
- Use minimal analytics only if privacy-respecting and useful (page views/search-to-detail conversion); do not log individual location histories.
- Back up the database via provider policy and make schema migrations repeatable. Add basic deployment smoke test and a rollback procedure.

## 13. Success metrics (first 30 days)

- Coverage: 20–30 validated bathrooms, at least 10 buildings for wider release.
- Freshness: top 10 visited bathrooms checked weekly if tester time allows.
- Core UX: median time from homepage to selecting a bathroom under 30 seconds in an informal user test.
- Trust: track percentage of published locations with verified level, entrance notes, and access status; do not call unverified locations complete.
- Actual utility: ask 5–10 students whether they could find the stated bathroom and enter it, record success/failure rather than collecting only opinions on the UI.
- Community: track submitted corrections and median owner moderation time, not toilet-visit frequency or identifiable bathroom usage.

## 14. First message the coding agent should send

> I read `PLAN.md` and checked the repository. I will start with M0: scaffold the mobile-first Next.js app, add the base styling and scripts, and document local setup. Then I will implement the M1 Supabase schema and RLS. I will not add fictional Columbia bathroom reviews or claim live stall availability. After M0, I will show the file changes, run checks, and ask for review before moving to M1 if that is the agreed workflow.

**Reminder:** The point is not to create the world's most elaborate bathroom app. The point is to make a fast, trustworthy way to find a toilet at Columbia, powered by actual field verification.
