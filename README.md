# Stallion

Independent Columbia Morningside restroom finder. The app shows four unverified bathroom candidates from official Columbia Housing floor plans across Schapiro, Broadway, and Furnald. No field observations or ratings are included.

## Local startup

Requires Node 22+ and Corepack. Run:

```sh
corepack pnpm install --config.dangerouslyAllowAllBuilds=true
corepack pnpm dev
```

Open http://127.0.0.1:3000. Copy `.env.example` to `.env.local` and set your Supabase project values to use hosted records. Without Supabase, the sourced catalog is shown in development and production.

## Checks

```sh
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm build
corepack pnpm test:e2e
```

## Database and admin

Apply the SQL migration in `supabase/migrations` with the Supabase CLI (`supabase link` then `supabase db push`). Run `supabase/seed.sql` once to insert the same four sourced candidates into a hosted project. The migration enables RLS. Invite an owner through Supabase Auth and add their UUID to `public.admin_users`; see [deployment notes](docs/DEPLOYMENT.md). Owner metadata editing is at `/admin/bathrooms`; inspectors report at `/admin/inspect`.

Use [the source review](docs/SOURCES.md), [import worksheet](supabase/seed/import-template.csv), and [field guide](docs/FIELD_GUIDE.md) to collect source and verification details. [Decisions and launch gates](docs/DECISIONS.md) record the limits of this implementation.
