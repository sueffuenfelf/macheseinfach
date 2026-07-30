---
name: macheseinfach-new-app
description: >-
  Scaffolds a new Bun workspace app under apps/ (Vite+React, Bun server, or CLI
  bin) with @macheseinfach/* naming and dev-cli wiring. Use when adding a new
  deployable or runnable application to the monorepo.
---

# Neue App anlegen (`apps/<name>`)

Monorepo-Apps leben unter `apps/*`, Name: `@macheseinfach/<name>`. Root-`workspaces` deckt `apps/*` ab — kein Root-`package.json`-Edit nötig.

## App-Typ wählen

| Typ | Wann | Referenz |
| --- | --- | --- |
| **Vite + React** | SPA, öffentliche UI | `apps/website` |
| **Bun HTTP-Service** | API, Worker | minimal template below |
| **CLI-Bin** | Dev-/Ops-Befehle | `apps/cli` |

Shared Code → `packages/` (`macheseinfach-new-package`), nicht in die App kopieren.

## Workflow

```text
- [ ] apps/<name>/ mit package.json (@macheseinfach/<name>)
- [ ] tsconfig.json extends ../../tsconfig.base.json
- [ ] src/index.ts oder src/main.tsx als Entry
- [ ] scripts: dev, build (mind. tsc --noEmit oder vite build)
- [ ] bun install
- [ ] Optional: DEV_APPS in apps/cli/src/commands/dev.ts
- [ ] bun run --filter @macheseinfach/<name> dev
```

## Minimales package.json (Bun-Service)

```json
{
    "name": "@macheseinfach/<name>",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "scripts": {
        "dev": "bun run src/index.ts",
        "build": "tsc --noEmit -p tsconfig.json"
    },
    "devDependencies": {
        "bun-types": "^1.3.14",
        "typescript": "^5.9.3"
    }
}
```

Referenz: `apps/cli/package.json` (schlankes Bun-Package).

## Vite + React (Kurz)

```json
{
    "name": "@macheseinfach/<name>",
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
    },
    "dependencies": {
        "@macheseinfach/ui": "workspace:*",
        "react": "^19.2.0",
        "react-dom": "^19.2.0"
    },
    "devDependencies": {
        "@tailwindcss/vite": "^4.1.18",
        "@vitejs/plugin-react": "^5.1.0",
        "tailwindcss": "^4.1.18",
        "typescript": "^5.9.3",
        "vite": "^7.2.2"
    }
}
```

- `tsconfig.json`: `types: ["vite/client"]` — siehe `apps/website/tsconfig.json`
- UI-Theme: `import '@macheseinfach/ui/theme.css'`

## CLI-Bin

```json
"bin": { "macheseinfach": "./src/index.ts" }
```

Shebang `#!/usr/bin/env bun` in `src/index.ts`. Referenz: `apps/cli`.

## Dev-CLI registrieren

In `apps/cli/src/commands/dev.ts`:

```ts
export const DEV_APPS: Record<string, { package: string; script?: string }> = {
    // …
    '<alias>': { package: '@macheseinfach/<name>' },
    // script defaults to 'dev'; storybook: { script: 'storybook' }
};
```

Test in `apps/cli/src/commands/dev.test.ts` ergänzen.

## Verifikation

```bash
bun install
bun run --filter @macheseinfach/<name> build
bun run dev:cli -- dev <alias>   # wenn in DEV_APPS
bun run format
```

## Anti-Patterns

- Keine Secrets in `apps/` committen — `.env` gitignored, `.env.example` dokumentieren.
- `dokploy.config.ts` bleibt lokal/gitignored.
- Keine leeren `src/`-Unterordner ohne Dateien.
