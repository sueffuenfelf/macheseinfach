---
name: macheseinfach-new-tool
description: >-
  Adds a new website tool under apps/website/src/tools with auto-discovery via
  config.ts. Use when creating tools, calculators, converters, checkers, or
  file pipelines on macheseinfach.de.
---

# Neues Website-Tool anlegen

## Vor dem Start

1. **Bereich wählen** — gültige `areas` in `apps/website/src/data/catalog/types.ts` (`AREA_IDS`).
2. **Shell vs. Custom** — Formular-Logik → Shell-Factory; Datei/PDF/Bild-Pipeline → Custom-Page + `_shared/*`.
3. **Plan bei Komplexität** — `docs/plans/YYYY-MM-DD-<slug>.md` wenn >1 Datei oder neue `_shared`-Engines.

## Workflow

```text
- [ ] Ordner `apps/website/src/tools/<tool-id>/` anlegen (id = kebab-case, = catalog.id)
- [ ] `config.ts` mit `default export` (Shell-Factory oder `defineTool`)
- [ ] `compute.ts` + `compute.test.ts` für reine Logik
- [ ] Custom `*Tool.tsx` nur wenn keine Shell passt
- [ ] `bun test apps/website/src/tools/<tool-id>`
- [ ] `bun run dev` → Tool unter /tool/<slug> prüfen
```

**Kein manuelles Wiring** in `data/catalog/tools.ts` oder `shell/tools/index.tsx` — `discover.ts` findet `./*/config.ts` automatisch.

## Shell wählen (bevorzugt)

| Factory | Wann |
| --- | --- |
| `defineCalcTool` | Felder → live ResultCard |
| `defineCheckTool` | Input → gültig/ungültig |
| `defineGenerateTool` | Formular → Text/QR/Code + Copy |
| `definePasteTool` | Einfügen → Findings mit Severity |
| `defineExtractTool` | Datei/Text → kopierbare Felder |

Referenz: `apps/website/src/tools/_shared/shells/README.md`, Beispiel `percent-calc/config.ts`.

```ts
import { defineCalcTool } from '../_shared/shells';
import { computeX } from './compute';

export default defineCalcTool(
  {
    catalog: {
      id: 'my-tool',
      slug: 'my-tool',
      shortTitle: '…',
      title: '…',
      sub: '…',
      pain: '…',
      solution: '…',
      trust: 'Lokal · nichts wird hochgeladen',
      tags: ['…'],
      keywords: ['…'],
      fileHints: [],
      command: '/…',
      entry: 'form', // 'file' | 'form' | 'file-or-form'
      theme: { accent: '#…', accentStrong: '#000', accentSoft: '#…' },
      maturity: 'beta',
      areas: ['einheiten'],
    },
    fields: [/* FieldDef */],
    compute: computeX,
  },
  'my-tool',
);
```

Field types: `text`, `currency`, `number`, `segment`, `date`, `textarea`. Deutsche Zahlen: `parseFieldNumber` / `parseFieldCurrency`.

## Custom Page (Datei/PDF/Bild)

```ts
import { defineTool } from '../types';
import { MyTool } from './MyTool';

export default defineTool({ catalog: { /* … */ }, page: MyTool }, 'my-tool');
```

- PDF-Engines: `_shared/pdf/*`
- Bild-Pipelines: `_shared/image/*`
- Sticky Footer: `_shared/ToolStickyFooter.tsx`
- Layout-Hilfen: `FilePipelineToolShell`, `EditorToolShell`

Beispiel: `image-resize/config.ts` + `ImageResizeTool.tsx`.

## Catalog-Pflichtfelder

`catalog.id` **muss** dem Ordnernamen entsprechen. Pflicht: `slug`, `shortTitle`, `title`, `sub`, `pain`, `solution`, `trust`, `tags`, `keywords`, `fileHints`, `command`, `entry`, `theme`, `maturity`, `areas`.

## Tests

- Logik: `compute.test.ts` mit `bun test` (reine Funktionen, keine React-Render-Tests nötig).
- Discovery läuft nur unter Vite; globale Katalog-Validierung: `apps/website/src/data/catalog/validate.test.ts`.

## Verifikation

```bash
bun test apps/website/src/tools/<tool-id>
bun run format
bun run dev   # Tool im Browser öffnen
```

## Weiterlesen

- `apps/website/src/tools/AGENTS.md` — Architektur-Kurzfassung
- `docs/plans/2026-07-28-bereich-tool-roadmap.md` — Bereichs-Roadmap
