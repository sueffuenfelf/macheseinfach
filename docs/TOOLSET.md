# Toolset — Macheseinfach

Initial toolchain for this repo (see [issue #1](https://github.com/sueffuenfelf/macheseinfach/issues/1)).

## Runtime & package manager

| Tool | Role |
| --- | --- |
| **Bun** | JS/TS runtime, test runner, package manager, workspace orchestration |
| **TypeScript** | Strict typing across apps and packages |

## Code quality

| Tool | Role |
| --- | --- |
| **Biome** | Lint + format (replaces ESLint + Prettier) |
| **Bun test** | Unit tests (`bun test`) |

## UI

| Tool | Role |
| --- | --- |
| **Tailwind CSS v4** | Utility-first styling in `@macheseinfach/ui` |
| **React 19** | Website + component library |

## Deploy (local)

| Tool | Role |
| --- | --- |
| **Docker** | Website image + OCR service (TBD) |
| **Dokploy** | `dokploy.config.ts` — local only, gitignored |

## AI harness

| Tool | Role |
| --- | --- |
| **Cursor** | Primary IDE agent — rules in `.cursor/rules/` |
| **Claude Code** | Optional — see `CLAUDE.md` |

## Planned apps (skeleton)

- **website** — public site + design system gallery
- **cli** — `macheseinfach` dev commands (local services)
- **ocr-service** — document OCR API (placeholder)
- **beispiele** — copy-paste integration examples

## Out of scope (for now)

- pnpm / Node-only tooling (Bun-first)
- Paid infra bindings until first deploy target is chosen
- Commercial redistribution (PolyForm Noncommercial license)
