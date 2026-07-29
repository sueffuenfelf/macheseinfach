---
name: macheseinfach-new-package
description: >-
  Scaffolds a new Bun workspace package under packages/ with @macheseinfach/*
  naming, tsconfig, and workspace wiring. Use when extracting shared libraries,
  utilities, or domain modules from apps.
---

# Neues Workspace-Package anlegen

Monorepo: Bun workspaces (`apps/*`, `packages/*`). Package-Namen: `@macheseinfach/<name>`.

## Wann ein Package?

| Ja | Nein |
| --- | --- |
| Code von ≥2 Apps genutzt | Nur ein Tool/App braucht es |
| Stabile API, eigene Tests | Einmal-Skript |
| Keine React-UI (→ `@macheseinfach/ui`) | App-spezifische Routes/Pages |

## Workflow

```text
- [ ] packages/<name>/ anlegen (kebab-case Ordner)
- [ ] package.json mit name @macheseinfach/<name>
- [ ] tsconfig.json (extends root oder ui-Vorlage)
- [ ] src/index.ts als Public API
- [ ] bun install (Workspace-Link)
- [ ] Consumer: "workspace:*" in dependencies
- [ ] Root-Scripts nur wenn nötig (build/test über --filter)
```

## Minimales package.json

```json
{
    "name": "@macheseinfach/<name>",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "exports": {
        ".": "./src/index.ts"
    },
    "scripts": {
        "build": "tsc --noEmit -p tsconfig.json",
        "test": "bun test"
    },
    "devDependencies": {
        "bun-types": "^1.3.14",
        "typescript": "^5.9.3"
    }
}
```

Referenz: `packages/ui/package.json` (mit peerDeps für React), `packages/openrouter/package.json` (schlankes TS-Package).

## tsconfig.json

```json
{
    "extends": "../../tsconfig.json",
    "compilerOptions": {
        "rootDir": "src",
        "outDir": "dist",
        "noEmit": true
    },
    "include": ["src"]
}
```

Prüfen ob Root-`tsconfig.json` existiert; sonst ui-Paket als Vorlage kopieren.

## Public API

- **Ein Einstieg:** `src/index.ts` exportiert nur die beabsichtigte Oberfläche.
- Keine Deep-Imports aus Apps (`@macheseinfach/foo/src/internal` vermeiden).
- Subpath-Exports nur bei Bedarf (siehe `"./theme.css"` in ui).

## Consumer einbinden

```json
"dependencies": {
    "@macheseinfach/<name>": "workspace:*"
}
```

```bash
bun install
bun run --filter @macheseinfach/<consumer> build
```

## React-Package?

Wenn das Package React-Komponenten exportiert → lieber `@macheseinfach/ui` erweitern (`macheseinfach-ui-component` Skill) oder eigenes Package mit:

```json
"peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
}
```

## Verifikation

```bash
bun install
bun run --filter @macheseinfach/<name> build
bun run --filter @macheseinfach/<name> test
bun run format
```

## Anti-Patterns

- Keine leeren Ordner (`utils/`, `helpers/`) ohne echte Dateien.
- Kein `packages/` ohne Workspace-Eintrag — Root `workspaces` deckt `packages/*` ab, neuer Ordner reicht.
- Secrets nie ins Package — Env bleibt app-lokal (`.env`, gitignored).
