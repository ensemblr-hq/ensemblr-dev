# Ensemblr Coming Soon

Small Next.js app for the Ensemblr launch page. It shows a minimal waitlist form, stores signups in NocoDB, and can send best-effort signup alerts via Resend.

## Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS 4
- Biome
- NocoDB REST API for waitlist storage
- Resend for optional email notifications

## Run locally

```bash
bun install
bun dev
```

Open http://localhost:3000.

## Environment

Create `.env.local`:

```bash
NOCODB_API_URL=https://your-nocodb-host
NOCODB_API_TOKEN=your-token
NOCODB_TABLE_ID=your-table-id
NOCODB_EMAIL_FIELD=Email

RESEND_API_KEY=your-resend-key
NOTIFICATIONS_RECIPIENT=you@example.com
NOTIFICATIONS_FROM="Ensemblr <hello@your-domain.com>"
```

NocoDB vars are required to persist signups. Without them, the API validates and logs the email but returns success so the form still works during setup.

Resend vars are optional. Notifications never block signup storage.

## Scripts

```bash
bun dev      # local dev server
bun build    # production build
bun start    # run production server
bun lint     # Biome check
bun format   # Biome format
```
