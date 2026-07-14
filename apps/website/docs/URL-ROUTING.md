# URL-Routing — macheseinfa.ch Website

Die Website nutzt **react-router-dom** (BrowserRouter). Der Pfad ist die Quelle der Wahrheit; `PlatformRouterSync` spiegelt URL → `PlatformContext`. Navigation erfolgt über `usePlatformNav()` (schreibt in die URL).

## Routen

| Seite | Pfad | Beispiel |
| --- | --- | --- |
| Start | `/` | `https://macheseinfa.ch/` |
| Bereich (Situationsliste) | `/bereich/:areaSlug` | `/bereich/buchhaltung` |
| Situation (Tool-Auswahl bei mehreren Tools) | `/bereich/:areaSlug/:storySlug` | `/bereich/buchhaltung/rechnung` |
| Tool (voller Pfad) | `/bereich/:areaSlug/:storySlug/:toolSlug` | `/bereich/buchhaltung/rechnung/girocode-gen` |
| Tool (Kurzlink) | `/tool/:toolSlug` | `/tool/pdf-compress` |
| Favoriten | `/favoriten` | `/favoriten` |
| Einstellungen | `/einstellungen` | `/einstellungen` |

## Slugs im Katalog

Jede Entität in `src/data/catalog/` hat ein Feld `slug` (stabil, teilbar):

- **Bereiche** (`areas.ts`): Slug = ID, z. B. `buchhaltung`, `behoerden`
- **Stories** (`stories.ts`): kurze lesbare Slugs, z. B. `rechnung`, `iban-pruefen`, `elster-pdf`
- **Tools** (`tools.ts`): Slug = ID, z. B. `pdf-compress`, `girocode-gen`

Lookup-Helfer: `getAreaBySlug`, `getStoryBySlug`, `getToolBySlug` in `src/data/catalog/index.ts`.

Pfad-Bauer: `src/routing/paths.ts` (`areaPath`, `storyPath`, `toolPath`, …).

## Tag-Prefilter (Query)

Auf **Bereichs-** und **Situations-**Seiten (ohne Tool-Segment):

```
/bereich/buchhaltung/rechnung?tags=PDF,Rechnung
```

- Query-Parameter: `tags` — kommagetrennt, **AND-Semantik** (wie Multi-Select in der UI)
- Beim Laden: `PlatformRouterSync` → `activeTags` im Context
- Bei Tag-Klick: `TagUrlSync` aktualisiert die URL per `replaceState` (shareable Links)
- Auf Tool-Seiten werden Tags aus der URL ignoriert

## Browser-Verhalten

- **Zurück/Vor** funktioniert: jede URL-Änderung synchronisiert den Context
- Ein-Tool-Stories: Aufruf nur mit Story-Segment leitet auf die kanonische Tool-URL um (replace)
- Mehrbereich-Stories (z. B. `iban-aus-rechnung` in Buchhaltung & Dokumente): Bereichs-Slug in der URL ist relevant

## Entwicklung

```bash
bun run --filter @macheseinfach/website dev
```

Build:

```bash
bun run --filter @macheseinfach/website build
```

## Code-Einstiegspunkte

- `src/App.tsx` — `BrowserRouter`, Routes
- `src/routing/PlatformRouterSync.tsx` — URL → State
- `src/routing/TagUrlSync.tsx` — Tags → URL
- `src/routing/usePlatformNav.ts` — State-Aktionen → navigate()
- `src/shell/FavoritesPage.tsx` — `/favoriten`
