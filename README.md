# Macheseinfach!

Monorepo for creator-commerce tooling — Bun workspaces, Gumroad-inspired UI, SOPS secrets.

## Quick start

```bash
bun install
bun run dev              # marketing website
bun run storybook        # UI kit (port 6006)
bun run --filter @macheseinfach/cli dev   # CLI help

# or via CLI from anywhere in the repo:
bun run apps/cli/src/index.ts dev website
bun run apps/cli/src/index.ts dev storybook
bun run apps/cli/src/index.ts env check
bun test
```

## CLI (`macheseinfach`)

| Command | Description |
| --- | --- |
| `macheseinfach dev <app>` | Start `website`, `storybook`, `ocr-service`, … |
| `macheseinfach env check` | Verify sops, age-keygen, local age key |
| `macheseinfach env decrypt` | `.kounds/secrets.env` → `.env` |
| `macheseinfach env encrypt` | `.env` → `.kounds/secrets.env` |

## Structure

| Path | Purpose |
| --- | --- |
| `apps/website` | Marketing site |
| `apps/cli` | Local dev & project management CLI |
| `apps/ocr-service` | OCR pipeline stub (future Gemma/local model) |
| `apps/beispiele` | Example integrations |
| `packages/ui` | Gumroad-style design system + **Storybook** |

## Secrets (SOPS + age)

1. Generate a key (once per machine): `age-keygen -o .kounds/age.key`
2. Add the **public** key to `.sops.yaml` if you rotate keys.
3. Decrypt: `bun run env:decrypt` → `.env` (gitignored)
4. Encrypt: edit `.env`, then `bun run env:encrypt`

Never commit `.kounds/age.key` or cleartext `.env`.

## AI / Cursor

See [AGENTS.md](./AGENTS.md) and [`.cursor/rules/`](./.cursor/rules/).

## License

[PolyForm Noncommercial License 1.0.0](./LICENSE) — noncommercial use only.
