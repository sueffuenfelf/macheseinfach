# Macheseinfach — agent handbook

**Macheseinfach** is a Bun monorepo for creator-commerce experiments. Stack: TypeScript, Biome, Tailwind v4 (`@macheseinfach/ui`), SOPS/age secrets.

## Repo layout

- `apps/website` — Vite + React showcase
- `apps/cli` — Bun CLI entrypoint
- `apps/ocr-service` — OCR stub
- `apps/beispiele` — examples index
- `packages/ui` — Gumroad-inspired design system

## Conventions

- **Runtime:** Bun — prefer `bun run`, `bun test`, `bun install`.
- **Formatting:** Biome — run `bun run format` before PRs.
- **Secrets:** Never commit `.env` or `.kounds/age.key`. Use SOPS workflow in README.
- **License:** PolyForm Noncommercial — no commercial use without a separate license.

## Cursor

Project rules live in `.cursor/rules/`. Skills/agents stubs under `.cursor/skills/` and `.cursor/agents/` — extend as patterns emerge.

## Plans

Non-trivial work: add `docs/plans/YYYY-MM-DD-<slug>.md` next to the app or package you change.
