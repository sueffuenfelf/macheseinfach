# CLAUDE.md

Claude Code context for **macheseinfach**. Conventions: **`AGENTS.md`**.

## Commands

- `/plan` — draft a plan under `docs/plans/` (do not implement in plan-only turns)
- `/verify` — run tests/lint from the plan

## Stack reminders

- Bun workspaces — not pnpm
- Design tokens: `packages/ui/src/styles/theme.css`
- Local env: `.env` (gitignored; see `.env.example`)

## Permissions

Pre-approve: Biome, `bun test`, read-only git. Ask before force-push or destructive ops.
