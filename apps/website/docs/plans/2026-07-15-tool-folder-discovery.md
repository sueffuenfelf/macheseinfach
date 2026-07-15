---
name: tool-folder-discovery
date: 2026-07-15
owner: sofien
target: apps/website
status: ready
---

# Tool folder auto-discovery (`config.ts`)

## Context & goal

Tools are split across `data/catalog/tools.ts`, `shell/tools/index.tsx` switch, and `shell/widgets/builtin.tsx`. Adding a tool touches 4–8 files. **Done** when each tool lives in `src/tools/<id>/config.ts` (auto-discovered via `import.meta.glob`), colocating catalog metadata, full-page UI, and widgets — areas/stories stay central navigation.

## Non-goals

- Moving areas/stories/tags out of `data/catalog/`
- Slash-command registry refactor
- Per-tool CSS modules (keep `index.css` widget classes for now)

## Example architecture

```
src/tools/
├── types.ts              # ToolModule, defineTool()
├── discover.ts           # glob('./*/config.ts') → tools + widgets + page map
├── _shared/
│   ├── PlannedTool.tsx
│   ├── GenericFileTool.tsx
│   ├── ToolPage.tsx      # <ToolBody tool={tool} />
│   └── widgets/
│       ├── WidgetCard.tsx
│       └── LaunchWidget.tsx
├── iban-validate/
│   ├── config.ts         # catalog + page + widgets[]
│   ├── IbanCheckTool.tsx
│   └── widgets/QuickCheck.tsx
└── pdf-compress/
    ├── config.ts
    └── PdfCompressTool.tsx
```

```typescript
// iban-validate/config.ts
export default defineTool({
  catalog: { slug, title, areas, storyIds, … },
  page: IbanCheckTool,
  widgets: [{ id: 'widget-iban-quick', component: QuickCheck, supportsSharedInput: true, … }],
});
```

```typescript
// discover.ts
const modules = import.meta.glob('./*/config.ts', { eager: true });
// folder name must match catalog.id; register widgets; build Record<ToolId, ToolDefinition>
```

**Catalog wiring:** `data/catalog/tools.ts` re-exports `tools` from `discover.ts`. `shell/tools/index.tsx` renders via `getToolPage(tool.id)`. `shell/widgets/registry.ts` registers from discover (remove `builtinWidgets` monolith).

## Environment variables

None.

## Tests & verification

```bash
cd projects/macheseinfach && bun run --filter @macheseinfach/website build
cd projects/macheseinfach/apps/website && bun test src/data/catalog/validate.test.ts
```

- All 10 tools resolve by slug
- Widgets register (13 widgets)
- `assertCatalogValid()` passes

## Migration / data concerns

None (client-only SPA).

## Rollback

Revert to flat `catalog/tools.ts` + `shell/tools` switch + `builtin.tsx`.

## Open questions

None.
