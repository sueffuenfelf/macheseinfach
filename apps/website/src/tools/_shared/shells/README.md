# Tool shells

Shared UX frames for form-only tools. Category agents add **logic + labels**; the shell owns layout, fields, debounce, ResultCard, and copy/download.

## Quick start (calc)

```ts
// tools/percent-calc/config.ts
import { defineCalcTool } from '../_shared/shells';
import { computePercent } from './compute';

export default defineCalcTool(
  {
    catalog: { /* id, slug, title, areas: ['einheiten'], … */ },
    fields: [
      { id: 'amount', type: 'currency', label: 'Betrag', placeholder: '119,00' },
      {
        id: 'mode',
        type: 'segment',
        label: 'Richtung',
        options: [
          { value: 'gross-to-net', label: 'Brutto → Netto' },
          { value: 'net-to-gross', label: 'Netto → Brutto' },
        ],
      },
      {
        id: 'rate',
        type: 'segment',
        label: 'MwSt',
        options: [
          { value: '19', label: '19 %' },
          { value: '7', label: '7 %' },
        ],
      },
    ],
    compute: computeVat,
  },
  'vat-calculator',
);
```

Put pure logic in `compute.ts` and test it with `bun test`. No `*Tool.tsx` page needed when using `define*Tool`.

## Shells

| Factory | Shell | When |
| --- | --- | --- |
| `defineCalcTool` | `CalcToolShell` | Fields → live ResultCard |
| `defineCheckTool` | `CheckToolShell` | Input → valid/invalid |
| `defineGenerateTool` | `GenerateToolShell` | Form → text/QR/code + copy/download |
| `definePasteTool` | `PasteAnalyzeToolShell` | Paste → severity findings |
| `defineExtractTool` | `ExtractToolShell` | File/text → copyable fields |

`FilePipelineToolShell` / `EditorToolShell` are thin layout helpers — keep using `_shared/image/*` and `_shared/pdf/*` for engines.

**Image tools** use `ImageWorkbenchShell`: left thumb rail, center `ImageDisplayStage` (`fit` · `compare-slider`, more kinds later), right control rail. Job progress lives in bottom-right toasts only.

## Field types

`text` · `currency` · `number` · `segment` · `date` · `textarea`

German amounts: `parseFieldNumber` / `parseFieldCurrency` (strict) or `parseGermanAmount` (empty → 0).
