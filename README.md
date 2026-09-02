# Purity

React + TypeScript booking platform for Purity home-cleaning services in Dubai.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production build

```bash
npm run lint
npm run build
```

Copy `.env.example` to a local ignored `.env` file when environment configuration is needed. Never commit real credentials or deployment secrets.

The optional Supabase schema is in `supabase_bookings.sql`. Supabase mode is disabled by default and must be enabled explicitly with `VITE_USE_SUPABASE=true` after configuring the public URL and anonymous key.
