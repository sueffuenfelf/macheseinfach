---
name: macheseinfach-catalog-entry
description: >-
  Adds or updates website catalog entries — areas, user stories, tags, and
  bidirectional tool/story links. Use when extending macheseinfach.de navigation,
  bereich pages, or story-tool relationships.
---

# Katalog-Eintrag (Bereich, Story, Tags)

Katalog lebt in `apps/website/src/data/catalog/`. Tools kommen aus Auto-Discovery (`tools/discover.ts`) — **nicht** manuell in `tools.ts` pflegen.

## Dateien

| Was | Datei |
| --- | --- |
| Bereiche | `areas.ts` |
| User Stories | `stories.ts` |
| Tags (Filter-UI) | `tags.ts` |
| IDs (Union-Types) | `types.ts` — `AREA_IDS`, `STORY_IDS` |
| Validierung | `validate.ts` + `validate.test.ts` |

## Bidirektionale Links (Pflicht)

Jede Relation muss **beide Seiten** pflegen — `validateCatalog()` prüft das:

| Relation | A → B | B → A |
| --- | --- | --- |
| Bereich ↔ Story | `areas[id].storyIds` | `stories[id].areaIds` |
| Story ↔ Tool | `stories[id].toolIds` | `tool.catalog.storyIds` in `config.ts` |

Fehlercodes: `AREA_STORY_MISMATCH`, `STORY_AREA_MISSING`, `STORY_TOOL_MISMATCH`, `TOOL_STORY_MISMATCH`.

## Neuer Bereich

1. `AREA_IDS` in `types.ts` erweitern.
2. `--color-area-<id>` in `packages/ui/src/styles/theme.css` (optional, für UI-Konsistenz).
3. Eintrag in `areas.ts`:

```ts
mybereich: {
    id: 'mybereich',
    slug: 'my-bereich',        // URL: /bereich/my-bereich
    label: 'Mein Bereich',
    shortLabel: 'Mein',
    description: '…',
    accent: '#a8dadc',         // neo-brutalist hex
    icon: ICONS.mybereich,     // inline SVG 24×24, stroke #000
    storyIds: [],
},
```

4. `storyIds` und `areaIds` synchron halten, sobald Stories existieren.

## Neue User Story

1. `STORY_IDS` in `types.ts` erweitern.
2. Eintrag in `stories.ts`:

```ts
'story-my-feature': {
    id: 'story-my-feature',
    slug: 'my-feature',           // URL unter Bereich
    areaIds: ['buchhaltung'],
    role: 'Als …',
    want: 'will ich …',
    title: 'Als … will ich …',
    situation: '…',
    outcome: '…',
    toolIds: ['my-tool'],
    status: 'ready',                // oder 'planned'
},
```

3. `areas[buchhaltung].storyIds` um `'story-my-feature'` ergänzen.
4. Tool-`config.ts`: `storyIds: ['story-my-feature']` setzen.

## Neuer Tag

Jeder `tags`-Eintrag in Tool-`catalog` muss in `tags.ts` registriert sein:

```ts
MeinTag: { id: 'MeinTag', label: 'Mein Tag', group: 'thema' },
```

Gruppen: `format`, `thema`, `aktion` (`TAG_GROUP_ORDER`).

## Tool ohne Story

Direkt im Bereich sichtbar: `areas: ['einheiten']`, `storyIds: []` — ok, solange `areas` nicht leer.

## Slug-Regeln

- Bereichs-, Story- und Tool-Slugs müssen **global eindeutig** sein (auch vs. Tool-Variants).
- `slug` ≠ `id` erlaubt (kebab-case für URLs).

## Verifikation

```bash
# Catalog-Tests brauchen Vite-Discovery (import.meta.glob):
cd apps/website && bun test src/data/catalog/validate.test.ts

# Oder voller Website-Testlauf unter Vite-Kontext:
bun run dev   # parallel: Tool-Seite + Bereichsnavigation prüfen
bun run format
```

Bei `validateCatalog().ok === false`: Issue-Codes in `validate.ts` nachschlagen.

## Weiterlesen

- `macheseinfach-new-tool` — Tool-`catalog`-Felder
- `docs/plans/2026-07-28-bereich-tool-roadmap.md` — Bereichs-Planung
