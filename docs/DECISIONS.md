# Decisions and launch gates

- The local app uses fourteen Columbia Housing candidates in thirteen residence halls when Supabase is not configured. Four have floor-plan detail; ten are hall-level bathroom descriptions. A follow-up migration adds the ten halls to configured databases.
- These candidates are official listings only. Neither building entry, resident access, restroom accessibility, indoor directions, nor current conditions have been verified in person. Approximate hall points support nearby suggestions internally; they are not verified entrances and are never displayed as pins or distances.
- A restroom must be explicitly published in the owner console before public reads. An officially listed candidate remains unverified until inspected.
- Walking route actions open Google Maps at the hall address or listing. Only actual browser GPS is passed as the route origin.
- Community reporting remains disabled unless Turnstile, Upstash Redis, and a Supabase service key are all configured. The server rechecks every dependency.
- Restricted listings sort last and show a resident-only warning. Columbia Housing does not publish public daily opening hours for these residence halls.
- The plan's M6 data collection, real route checks, student testing, production URL, and database migration verification require field visits and owner service credentials. No real Columbia restroom has been asserted in this repo.
- The plan proposes shadcn primitives; this small app uses native semantic controls and custom CSS to keep the vertical slice simple.
- Discovery puts nearby search and a manual starting hall above a simultaneous floor overview for every hall. Each hall has a Google Maps walking-directions link, access label, source link, and floor counts or unknown markers. Cleanest sorting is available when published cleanliness reports exist; the uninspected catalog says clearly that none exist yet. Extra filters remain in the secondary panel.
- Owner metadata edits require direct field judgment; the current editor does not preserve a separate immutable audit log. Supabase logs and source fields help, but a dedicated history table is needed before wider public launch.

- The main page now shows every sourced floor for every hall without a hall selection or pagination. Per-floor counts distinguish exact published numbers, conservative minimums, and unknowns. A star saves a hall-and-floor favorite in browser local storage; it is device-local and does not assert a bathroom is currently open.
