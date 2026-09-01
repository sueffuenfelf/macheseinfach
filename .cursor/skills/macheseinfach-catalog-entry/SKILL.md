---
name: macheseinfach-catalog-entry
description: >-
  Adds or updates website catalog entries — areas, tags, and tool↔area links.
  Use when extending macheseinfach.de navigation or bereich pages.
---

# Katalog-Eintrag (Bereich, Tags)

Katalog lebt in `apps/website/src/data/catalog/`. Tools kommen aus Auto-Discovery (`tools/discover.ts`) — **nicht** manuell in `tools.ts` pflegen.

## Dateien

| Was | Datei |
| --- | --- |
| Bereiche | `areas.ts` |
| Tags (Filter-UI) | `tags.ts` |
| IDs (Union-Types) | `types.ts` — `AREA_IDS` |
| Validierung | `validate.ts` + `validate.test.ts` |

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
    accent: '#a8dadc',
    icon: ICONS.mybereich,
},
```

4. Tools listen den Bereich in `catalog.areas`.

## Neuer Tag

Jeder `tags`-Eintrag in Tool-`catalog` muss in `tags.ts` registriert sein:

```ts
MeinTag: { id: 'MeinTag', label: 'Mein Tag', group: 'thema' },
```

Gruppen: `format`, `thema`, `aktion` (`TAG_GROUP_ORDER`).

## Slug-Regeln

- Bereichs- und Tool-Slugs müssen **global eindeutig** sein (auch vs. Tool-Variants).
- `slug` ≠ `id` erlaubt (kebab-case für URLs).

## Verifikation

```bash
bun test apps/website/src/data/catalog
bun run apps/website/scripts/validate-catalog-lite.mjs
```
