# Macheseinfach!

Monorepo for creator-commerce tooling — Bun workspaces, Gumroad-inspired UI.

## Quick start

```bash
bun install
bun run dev              # marketing website
bun run storybook        # UI kit (port 6006)
bun run --filter @macheseinfach/cli dev   # CLI help

# or via CLI from anywhere in the repo:
bun run apps/cli/src/index.ts dev website
bun run apps/cli/src/index.ts dev storybook
bun test
```

## CLI (`macheseinfach`)

| Command | Description |
| --- | --- |
| `macheseinfach dev <app>` | Start `website`, `storybook`, … |

## Structure

| Path | Purpose |
| --- | --- |
| `apps/website` | Marketing site |
| `apps/cli` | Local dev & project management CLI |
| `packages/ui` | Gumroad-style design system + **Storybook** |

## Local env

Copy `.env.example` to `.env` for local overrides. Never commit `.env`.

Dokploy **Nixpacks** — siehe [`docs/DEPLOY.md`](./docs/DEPLOY.md). **Publish directory leer lassen**, sonst startet Dokploy nginx statt `vite preview`.

## AI / Cursor

See [AGENTS.md](./AGENTS.md) and [`.cursor/rules/`](./.cursor/rules/).

## License

[PolyForm Noncommercial License 1.0.0](./LICENSE) — noncommercial use only.
