# Bilder-Überkategorie, Tool-Suite & globale Suche

> Vollständiger Plan: `.cursor/plans/bilder_suche_refactor_2ee03eab.plan.md`

## Ziel

- Neue Überkategorie **Bilder** (HEIC/Fotos aus Dokumente auslagern)
- Vereinheitlichtes **`image-convert`** mit SEO-Varianten (`/bereich/bilder/heic-zu-png/image-convert`)
- Bild-Tool-Suite (compress, resize, rotate, exif) + Pipeline
- Hybride Suche (`/suche`) — Lexical + Transformers.js + Chrome Prompt API

## Ausgangslage

- `story-heic-portal` / `heic-convert` unter Dokumente
- Keine `/suche`-Route; Suche fragmentiert über ⌘K und `searchTools()`
- Widget-Ports sind String-only — Bildketten brauchen `ImageArtifactStore`

## Implementierungswellen

### Wave 1 (dieses Deliverable)

| Bereich | Inhalt |
|---|---|
| Katalog | Area `bilder`, Stories verschieben/neu, Dokumente-Beschreibung, Theme-Token |
| Shared core | `tools/_shared/image/`: formats, convert, variants (artifact-store Stub) |
| image-convert | Tool + Widget, Variant-Registry, Routing, `heic-convert`-Redirect |
| SEO stub | `PageHead` — `document.title` aus Variante (kein SSG) |

### Wave 2+

- SSG/vite-plugin-ssg, sitemap.xml
- `image-compress`, `image-resize`, `image-rotate`, `image-exif-strip`
- SearchIndex, Lexical Scoring, Transformers Embeddings, `/suche`, Chrome AI
- Widget-Pipeline, `ImageArtifact`-Ports, Workspace-Vorlagen

## Kanonische Variant-URLs

```
/bereich/bilder/heic-zu-png/image-convert
/bereich/bilder/jpg-zu-png/image-convert
```

Redirects:

- `/tool/heic-convert` → `heic-zu-jpg`
- `/tool/heic-convert?to=png` → `heic-zu-png`

## Risiken

| Risiko | Mitigation |
|---|---|
| HEIC-Breaking Change | Redirect auf kanonische Variante |
| Widget-Linking String-only | ImageArtifactStore in Wave 2 |
| SSG-Komplexität | Wave 2; Wave 1 nur Client-`document.title` |
