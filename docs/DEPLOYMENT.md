# Deployment and operations

1. Create a Supabase project. Apply migrations with `supabase db push` after linking the project. Review RLS policies in the dashboard before inviting users.
2. Create the owner in Supabase Auth, then insert the Auth UUID into `public.admin_users` with role `owner` using the Supabase SQL editor. Invite inspectors through Supabase Auth and add their UUIDs with role `inspector`. Do not create public signups.
3. Run `supabase/seed.sql` in the Supabase SQL editor to load the four official, unverified candidates for Schapiro, Broadway, and Furnald. Use `supabase/seed/import-template.csv` as a worksheet for future additions. The official candidates are published with clear unverified labels; any new record should remain unpublished until its source and uncertainty labels have been reviewed.
4. Get a MapTiler key for map tiles. Configure allowed origins. MapLibre displays MapTiler attribution from the style. The list is usable without a key.
5. For anonymous reporting, configure Cloudflare Turnstile and Upstash Redis. Provide the site and server keys, Redis REST URL/token, and Supabase service role key. Without all of these, the form and endpoint remain disabled.
6. Deploy the repo to Vercel and set the values in `.env.example` as encrypted environment variables. Do not prefix server secrets with `NEXT_PUBLIC_`.
7. Run `corepack pnpm test:e2e` against a local dev server for the 375 px discovery smoke test. Then test `/admin` redirect, one inspector submission, and pending community moderation against the configured Supabase project. Review with keyboard navigation.
8. Keep provider database backups enabled. For rollback, revert the Vercel deployment first. Restore data from a backup before applying any reverse schema change; migrations here are forward only.

Do not announce a public launch until the real inspection and route checks in `FIELD_GUIDE.md` are complete. Monitor Vercel function errors and Supabase logs. The feedback route returns generic errors and does not log user coordinates or raw IPs.
