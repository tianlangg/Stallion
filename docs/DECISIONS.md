# Decisions and launch gates

- The local app uses four Columbia Housing floor-plan candidates in three residence halls when Supabase is not configured. The same records are available as a reviewed SQL seed. No fictional demo records remain.
- These candidates are official listings only. Neither building entry, resident access, restroom accessibility, indoor directions, nor current conditions have been verified in person. Entrance coordinates remain null, so no approximate distance or map pin is fabricated.
- A restroom must be explicitly published in the owner console before public reads. An officially listed candidate remains unverified until inspected.
- The map is optional. MapTiler tiles require a key; list mode works without one. Pins use building entrance coordinates only.
- Community reporting remains disabled unless Turnstile, Upstash Redis, and a Supabase service key are all configured. The server rechecks every dependency.
- Restricted restrooms are excluded from default recommendations. Unknown access is shown with a warning label.
- The plan's M6 data collection, real route checks, student testing, production URL, and database migration verification require field visits and owner service credentials. No real Columbia restroom has been asserted in this repo.
- The plan proposes shadcn primitives; this small app uses native semantic controls and custom CSS to keep the vertical slice simple.
- Discovery now follows LionDine's current sparse visual pattern: a small utility area, centered title, blue hall tabs, and unboxed columns. The default view keeps only the floor, type, provenance, and access warning; a visible switch reveals the remaining details. Search and an Options panel preserve filters, sorting, and map access.
- Owner metadata edits require direct field judgment; the current editor does not preserve a separate immutable audit log. Supabase logs and source fields help, but a dedicated history table is needed before wider public launch.
