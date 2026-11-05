# SoftWater Assist

Educational water-softener chatbot demo. See [PROJECT_BRIEF.md](PROJECT_BRIEF.md) for the
full product specification and [CLAUDE.md](CLAUDE.md) for project conventions.

All chat replies are **simulated** from [`knowledge.json`](knowledge.json) — no paid LLM API
is called.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + PostgreSQL
- pnpm

## Local setup (build/test only — no local dev server or database per project rules)

```bash
pnpm install
pnpm exec prisma generate
pnpm lint
pnpm test
pnpm build
```

## Deploying

1. Push this repository to GitHub.
2. Create a Railway project, add a PostgreSQL plugin, and connect the GitHub repo.
3. Railway provides `DATABASE_URL` and `PORT` automatically — no manual configuration needed.
4. On deploy, `pnpm build` runs (`prisma generate && next build`), then `pnpm start`
   (`node server/start.js`) applies pending migrations, seeds the three default personas
   (without overwriting edits), and starts Next.js bound to `0.0.0.0:$PORT`.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Local development server (do not run in this environment — see `ENVIRONMENT.md`) |
| `pnpm build` | `prisma generate` + `next build` |
| `pnpm start` | Production start: migrate, seed, serve |
| `pnpm test` | Vitest unit/component tests |
| `pnpm lint` | ESLint via `next lint` |
