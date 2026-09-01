# URL-Routing — macheseinfa.ch Website

Die Website nutzt **react-router-dom** (BrowserRouter). Der Pfad ist die Quelle der Wahrheit; `PlatformRouterSync` spiegelt URL → `PlatformContext`. Navigation erfolgt über `usePlatformNav()` (schreibt in die URL).

## Routen

| Seite | Pfad | Beispiel |
| --- | --- | --- |
| Start | `/` | `https://macheseinfa.ch/` |
| Bereich (Tool-Liste) | `/bereich/:areaSlug` | `/bereich/bilder` |
| Tool (Kurzlink) | `/tool/:toolSlug` | `/tool/pdf-merge` |
| Variant-Hub (Conversion) | `/bereich/bilder/:variantSlug/:toolSlug` | `/bereich/bilder/heic-zu-png/image-convert` |
| Bildformat-Übersicht | `/bereich/bilder/format-aendern` | |
| Einstellungen | `/einstellungen` | `/einstellungen` |
| Suche | `/suche` | `/suche?q=HEIC` |

## Slugs im Katalog

Jede Entität in `src/data/catalog/` hat ein Feld `slug` (stabil, teilbar):

- **Bereiche** (`areas.ts`): Slug = ID, z. B. `bilder`, `dokumente`
- **Tools**: Kurzlinks unter `/tool/:slug`

Pfad-Bauer: `src/routing/paths.ts` (`areaPath`, `toolShortcutPath`, …).

## Tag-Prefilter (Query)

Auf Bereichsseiten:

```
/bereich/bilder?tags=HEIC,JPG
```

- Query-Parameter: `tags` — kommagetrennt, **AND-Semantik**

## Code-Einstiegspunkte

- `src/App.tsx` — `BrowserRouter`, Routes
- `src/routing/PlatformRouterSync.tsx` — URL → State
- `src/routing/RouteRedirects.tsx` — Legacy-Tool-Shortcuts (z. B. HEIC)
- `src/routing/usePlatformNav.ts` — State-Aktionen → navigate()
