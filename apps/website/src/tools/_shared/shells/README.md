# Tool shells

Shared UX frames for form-only tools. Category agents add **logic + labels**; the shell owns layout, fields, debounce, ResultCard, and copy/download.

## Quick start (calc)

```ts
// tools/vat-calculator/config.ts
import { defineCalcTool } from '../_shared/shells';
import { computeVat } from './compute';

export default defineCalcTool(
  {
    catalog: { /* id, slug, title, areas: ['buchhaltung'], … */ },
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

## Field types

`text` · `currency` · `number` · `segment` · `date` · `textarea`

German amounts: `parseFieldNumber` / `parseFieldCurrency` (strict) or `parseGermanAmount` (empty → 0).
