# Rosefield — Web App

Cultural Resonance Concierge demo for the Rosewood Sand Hill Hackathon (Hospitality 2030).

See [../docs/](../docs/) for product, design, and architecture documentation.

## Stack

- Next.js 16 (App Router, Turbopack default)
- React 19.2
- TypeScript + Tailwind CSS v4
- Anthropic Claude (added when agent routes are implemented)

## Data strategy

**No database for the demo.** Per [docs/03-technical-architecture.md §12](../docs/03-technical-architecture.md):

- Guest profiles + property knowledge → TypeScript modules (static)
- Decision events + memory artifact → React state (session-scoped, privacy-aligned)
- Pre-warmed fallback LLM responses → JSON in repo (demo safety net)

A real DB (Supabase / Vercel KV / Postgres) becomes relevant only post-hackathon when multi-property memory, auth, or cross-session persistence are demoed.

## Local development

```bash
pnpm install
cp .env.example .env.local   # then fill in ANTHROPIC_API_KEY
pnpm dev
```

App runs at http://localhost:3000.

## Deploying to Vercel

This app needs no special Vercel config — `create-next-app` output is auto-detected.

1. Push this repo to GitHub.
2. In Vercel: **New Project** → import the repo → set **Root Directory** to `web-app`.
3. Add environment variable `ANTHROPIC_API_KEY` (Production, Preview, Development).
4. Deploy. Subsequent pushes auto-deploy.

CLI alternative (from this directory):

```bash
pnpm dlx vercel        # first deploy, links the project
pnpm dlx vercel --prod # promote to production
```

## Notes for AI coding agents

This project uses Next.js 16, which has breaking changes from prior versions (async `params`/`searchParams`/`cookies()`, Turbopack default, etc.). Before writing Next.js code, read the relevant doc under `node_modules/next/dist/docs/` — see [AGENTS.md](AGENTS.md).
