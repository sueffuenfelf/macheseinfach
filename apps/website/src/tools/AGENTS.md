# Tool folder architecture

Each tool lives in one folder: `src/tools/<tool-id>/`.

## Add a new tool

1. Create `src/tools/<tool-id>/config.ts`.
2. Export `default defineTool({ catalog, page? }, '<tool-id>')` — or a shell factory (`defineCalcTool`, …).
3. Keep `catalog.id` equal to the folder name.
4. Add the page component in the same folder **only if** you are not using a shell factory.

`src/tools/discover.ts` auto-discovers `./*/config.ts`, validates folder/id consistency, builds catalog tools, and page mapping.

## Prefer shells for form tools

Many tools share the same UX — only logic and labels differ. Use `_shared/shells/`:

| Factory | Shell | Pattern |
| --- | --- | --- |
| `defineCalcTool` | `CalcToolShell` | Fields → live ResultCard |
| `defineCheckTool` | `CheckToolShell` | Input → valid/invalid + details |
| `defineGenerateTool` | `GenerateToolShell` | Form → text/QR/code + copy/download |
| `definePasteTool` | `PasteAnalyzeToolShell` | Paste → severity findings |
| `defineExtractTool` | `ExtractToolShell` | File/text → copyable fields |

### Shell-based tool layout

```text
tools/<tool-id>/
  config.ts     # defineCalcTool({ catalog, fields, compute }) — no page
  compute.ts    # pure logic (import into config + tests)
  compute.test.ts
```

Example:

```ts
import { defineCalcTool } from '../_shared/shells';
import { computePercent } from './compute';

export default defineCalcTool(
  {
    catalog: { id: 'percent-calc', /* … */, areas: ['einheiten'] },
    fields: [
      { id: 'a', type: 'number', label: 'A' },
      { id: 'b', type: 'number', label: 'B' },
    ],
    compute: computePercent,
  },
  'percent-calc',
);
```

Field types: `text`, `currency`, `number`, `segment`, `date`, `textarea`.
German numbers: `parseFieldNumber` / `parseFieldCurrency` from `_shared/shells`.
Copy/download: `useCopyAction` (toasts via `useToast`).

`FilePipelineToolShell` / `EditorToolShell` are thin layout helpers — keep PDF/image engines in `_shared/pdf/*` and `_shared/image/*`.

See `_shared/shells/README.md` and `docs/plans/2026-07-28-bereich-tool-roadmap.md` § Tool Shells.

## Sticky tool footer

For action bars at the bottom of a tool page, use `_shared/ToolStickyFooter.tsx`:

- `ToolStickyFooterLayout` — one fixed footer bar; animates `bottom` between viewport edge and dock slot at tool end
- `ToolStickyFooter` — visual shell only (positioning in layout)
- `ToolStickyFooterMeta` / `ToolStickyFooterActions` — optional layout helpers

No manual edits are needed in `src/data/catalog/tools.ts` or `src/shell/tools/index.tsx` for new tool folders.
