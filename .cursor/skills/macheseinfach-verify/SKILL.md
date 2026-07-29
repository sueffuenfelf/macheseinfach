---
name: macheseinfach-verify
description: >-
  Runs the macheseinfach pre-PR verification gate — Biome lint/format, bun test,
  and filtered builds. Use before claiming work is done, opening PRs, or after
  substantive code changes.
---

# Verifikation (Pre-PR Gate)

Bun-Monorepo — kein pnpm. Evidence before "fertig".

## Schnellcheck (Repo-Root)

```bash
bun run format          # Biome format --write .
bun run lint            # biome lint .
bun test                # alle Workspace-Tests
```

## Scoped (nach Änderungsbereich)

| Geändert | Befehl |
| --- | --- |
| Ein Tool | `bun test apps/website/src/tools/<tool-id>` |
| Katalog | `cd apps/website && bun test src/data/catalog/` |
| UI-Package | `bun run --filter @macheseinfach/ui test && bun run --filter @macheseinfach/ui build` |
| CLI | `bun run --filter @macheseinfach/cli test` |
| Website Build | `bun run --filter @macheseinfach/website build` |
| Alles | `bun run build` |

## Was wann läuft

| Check | Erkennt |
| --- | --- |
| `biome lint` | Style, offensichtliche Fehler |
| `bun test` | Unit-Logik (`compute.test.ts`, catalog, CLI) |
| `tsc --noEmit` / `build` | Type-Fehler pro Package |
| `vite build` (website) | Bundle, `import.meta.glob` Tool-Discovery |

**Hinweis:** Katalog- und Discovery-Tests sind unter reinem `bun test` am Root oft leer (kein Vite). Für volle Catalog-Validierung: Tests in `apps/website` oder `vite build`.

## Workflow-Checkliste

```text
- [ ] bun run format && bun run lint
- [ ] bun test (scoped oder root)
- [ ] build für betroffene Packages
- [ ] Manuell im Browser wenn UI/Tool-Verhalten geändert (bun run dev)
```

## Browser-Smoke (Website-Tools)

```bash
bun run dev
# Tool: /tool/<slug>
# Bereich: /bereich/<area-slug>
```

Storybook bei UI-Änderungen:

```bash
bun run storybook
```

## Ergebnis melden

Claims brauchen Output — nicht "sollte grün sein". Bei Fehlern: ersten failing Test fixen, erneut laufen lassen, passing Output zitieren.

## Nicht automatisch

- Kein `git push` ohne Auftrag
- Kein Deploy/Dokploy
- Keine Secrets in Logs
