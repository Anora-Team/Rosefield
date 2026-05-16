# 05 — Development Setup

Onboarding for any human or AI agent picking up this repo. Read this first, then [00-overview.md](00-overview.md) for product context.

---

## 1. Repo layout

```
Rosefield/
├── docs/                # Design & strategy docs (00–05). Source of truth for product intent.
├── design-pattern/      # Visual / interaction reference material.
├── user-profiles/       # Demo guest persona content (static fixtures).
├── web-app/             # Next.js 16 app — the only deployable code.
└── README.md            # Top-level project summary.
```

Everything runnable lives in [web-app/](../web-app/). Everything else is reference material.

---

## 2. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 20 | Matches `@types/node@^20` in [web-app/package.json](../web-app/package.json). |
| pnpm | latest | Lockfile is `pnpm-lock.yaml`. Do not mix with npm/yarn. |
| Git | any modern | – |

---

## 3. First-time setup

```bash
cd web-app
pnpm install
cp .env.example .env.local   # then fill in keys — see §4
pnpm dev                     # http://localhost:3000
```

Other scripts: `pnpm build`, `pnpm start`, `pnpm lint`.

---

## 4. Environment variables

All secrets live in [web-app/.env.local](../web-app/.env.local) (gitignored via `.env*` in [web-app/.gitignore](../web-app/.gitignore)). **Never commit this file or paste its contents into a PR, issue, or chat.**

| Variable | Used for | Where issued |
|----------|----------|--------------|
| `ANTHROPIC_API_KEY` | Claude LLM calls (agent reasoning, planning) | console.anthropic.com |
| `ELEVENLABS_API_KEY` | Voice synthesis for the staff/guest experience | elevenlabs.io |

Keys are already populated locally for Zephyr's machine. New contributors must request their own — do not reuse the committed-looking keys in `.env.local` in shared environments.

### Deployment (Vercel)

Set the same variables under **Project Settings → Environment Variables** for Production, Preview, and Development. Root directory must be set to `web-app`.

### If a key leaks

1. Rotate immediately in the provider console.
2. Update `.env.local` and Vercel env vars.
3. Note the incident in your PR/commit so reviewers know which key was rotated.

> **Standing note for the current keys:** the initial `ANTHROPIC_API_KEY` and `ELEVENLABS_API_KEY` were pasted into a chat transcript on 2026-05-16. Treat them as compromised and rotate before the 2026-05-16 demo if not already done.

---

## 5. Stack constraints (read before writing code)

- **Next.js 16** — breaking changes vs. older Next.js. `params`, `searchParams`, and `cookies()` are async. Turbopack is default. Before writing route handlers, server components, or middleware, **read the relevant guide under `web-app/node_modules/next/dist/docs/`** as instructed by [web-app/AGENTS.md](../web-app/AGENTS.md).
- **React 19.2** — use the current server-component / `use()` / `useActionState` patterns; do not regress to React 18 idioms.
- **Tailwind v4** — config lives in `postcss.config.mjs` + CSS-first directives, not the old `tailwind.config.js` JS object.
- **TypeScript** — strict mode is on. Prefer explicit types at module boundaries.

---

## 6. Data strategy (no database)

Per [03-technical-architecture.md §12](03-technical-architecture.md):

- Guest profiles + property knowledge → static TypeScript modules.
- Decision events + memory artifact → React state, session-scoped.
- Pre-warmed fallback LLM responses → JSON in repo, used when live calls fail during demo.

Do not introduce Supabase, Postgres, Redis, or Vercel KV without discussing with Zephyr. A DB is explicitly out of scope until post-hackathon.

---

## 7. Demo context (why decisions get made the way they do)

- **Event:** Rosewood Sand Hill Hackathon — Hospitality 2030.
- **Demo date:** 2026-05-16.
- **Hero scene:** split-screen Route A — Guest Companion (conversational thread, left) driving an Operations Theater (6 agent panels + Action Routing fan-out to staff teams, right) from one agent pipeline run. See [02-experience-design.md §7](02-experience-design.md) for the full screen-state flow and [03-technical-architecture.md §1](03-technical-architecture.md) for the data-flow diagram.
- **Route B (Operator Portal / simulation):** named in the close, not built or demoed live.
- **Solo founder:** Zephyr. Optimize for shippable scope, not architectural completeness.

When in doubt about scope: ship the demo path, defer everything else. See [03-technical-architecture.md §9](03-technical-architecture.md) for the scope-reduction protocol — Liu Scenario 1 (pre-arrival anniversary planning) is the minimum viable thesis.

---

## 8. Doc map

| Doc | Read when |
|-----|-----------|
| [00-overview.md](00-overview.md) | Need the elevator pitch. |
| [01-product-strategy.md](01-product-strategy.md) | Making product-shape decisions. |
| [02-experience-design.md](02-experience-design.md) | Working on UI / interaction flows. |
| [03-technical-architecture.md](03-technical-architecture.md) | Touching agent code, data flow, or infra. |
| [04-pitch-sharpening.md](04-pitch-sharpening.md) | Tuning demo narrative or hero scene. |
| [05-development-setup.md](05-development-setup.md) | You're here. |

---

## 9. Conventions for AI agents

- Read the relevant `node_modules/next/dist/docs/` guide before writing Next.js-specific code.
- Prefer editing existing files over creating new ones.
- Do not add dependencies for hypothetical needs — confirm scope first.
- Treat `.env.local` as read-only context; never echo, log, or paste its contents.
- If you create new env vars, add them to [web-app/.env.example](../web-app/.env.example) (with placeholder values) and update §4 of this doc.
