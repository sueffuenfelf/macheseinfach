# Macheseinfach!

Monorepo for creator-commerce tooling — Bun workspaces, Gumroad-inspired UI, SOPS secrets.

## Quick start

```bash
bun install
bun run dev          # website (design system showcase)
bun run dev:cli      # local CLI stub
bun test
```

## Structure

| Path | Purpose |
| --- | --- |
| `apps/website` | Marketing / UI showcase |
| `apps/cli` | Local dev & project management CLI |
| `apps/ocr-service` | OCR pipeline stub (future Gemma/local model) |
| `apps/beispiele` | Example integrations |
| `packages/ui` | Gumroad-style design system (Tailwind v4) |

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
