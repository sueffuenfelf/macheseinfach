---
name: widget-primitives-linking
date: 2026-07-15
owner: sofien
target: apps/website
status: ready
---

# Launch-Widgets entfernen, Primitive Widgets + Advanced Linking

## Context & goal

Mehrere Tools nutzen noch generische `LaunchWidget`-Kacheln ohne echten Nutzen im Dashboard. Gleichzeitig gibt es bisher nur einen globalen `sharedInput`, aber keine gezielte Widget-zu-Widget-Verknuepfung. **Done** wenn `LaunchWidget` komplett entfernt ist, betroffene Tools echte Mini-Widgets haben, neue primitive Organisations-Widgets verfuegbar sind, und eine settings-gesteuerte Verknuepfung (default aus) Widget-Ausgaben auf andere Widget-Eingaenge routen kann.

## Non-goals

- Kein graphischer Node-Editor oder Linien-Canvas fuer Links
- Kein serverseitiges Persistenzmodell (nur lokal wie bestehende Workspace-/Settings-Daten)
- Keine Aenderung am globalen Routing oder Tool-Katalog-IA

## Example architecture

```
src/tools/
├── _shared/
│   └── widgets/
│       ├── WidgetCard.tsx
│       └── (LaunchWidget.tsx entfernt)
├── _primitives/
│   ├── config.ts
│   └── widgets/
│       ├── PrimitiveTextInputWidget.tsx
│       └── PrimitiveFileDropWidget.tsx
├── heic-convert/widgets/
│   └── HeicConvertWidget.tsx
├── pdf-compress/widgets/
│   └── PdfCompressWidget.tsx
├── pdf-merge/widgets/
│   └── PdfMergeWidget.tsx
├── pdf-redact/widgets/
│   └── PdfRedactWidget.tsx
├── pdf-sign/widgets/
│   └── PdfSignWidget.tsx
├── epc-read/widgets/
│   └── EpcReadWidget.tsx
└── ocr-local/widgets/
    └── OcrLocalWidget.tsx

src/shell/
├── WorkspaceDashboard.tsx
├── SettingsPage.tsx
├── widgets/
│   ├── WidgetSettingsPopover.tsx
│   └── types.ts
└── workspaces/model.ts
```

```ts
// workspaces/model.ts (MVP shape)
type WidgetValuePort = 'text' | 'value' | 'fileName' | 'fileText';
type WorkspaceWidgetLink = {
  id: string;
  sourceWidgetId: string;
  sourcePort: WidgetValuePort;
  targetWidgetId: string;
  targetPort: 'input';
};
// Workspace.links[] persisted in existing localStorage model.
```

```ts
// Widget runtime contract
type WidgetComponentProps = {
  ...
  linkedInput?: string;
  linkedSourceLabel?: string;
  emitValue?: (port: WidgetValuePort, value: string) => void;
};
// Existing sharedInput path stays intact; linkedInput overrides local typing when advanced mode enabled.
```

## Environment variables

None.

## Tests & verification

```bash
cd projects/macheseinfach/apps/website && pnpm build
```

- Build succeeds without TS errors
- `validateDiscovery()` still passes (every tool has `widgets[]`, no duplicates)
- No remaining imports/usages of `LaunchWidget` / `createLaunchWidget`
- Settings toggle `Erweiterte Widget-Verknuepfungen` persists across reload
- Advanced linking UI hidden when toggle off, visible + functional when on

## Migration / data concerns

- `WorkspaceState.version` auf `3` erhoehen
- Migration von v2: bestehende Workspaces bleiben erhalten, `widgetLinks: []` wird hinzugefuegt
- Legacy v1/v2 Schluessel weiter lesbar ueber bestehende Migration

## Rollback

- Revert der neuen Primitive-/Mini-Widgets und Modellfelder
- Rueckkehr zu `version: 2` und altem `sharedInput`-only Verhalten
- Re-aktivierung von `LaunchWidget`-basierter Tool-Konfiguration

## Open questions

- Fuer v1 wird der Link-Output auf Stringwerte begrenzt (Dateiinhalt als Text/Name). Binardaten und Mehrdatei-Streams bleiben spaeteren Iterationen vorbehalten.
