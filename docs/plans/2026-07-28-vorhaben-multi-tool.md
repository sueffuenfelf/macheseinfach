# Plan — Vorhaben als Multi-Tool-Workspace (Production)

**Date:** 2026-07-28  
**Scope:** `apps/website` — Katalog, Shell-UI, Context-Runtime, Tool-Adaptation  
**Status:** P0–P4 code complete. **Flags default ON.** Next: manual browser QA.  
**Related:** `docs/plans/2026-07-28-bereich-tool-roadmap.md`  
**Zielqualität:** Production-ready Feature (kein Prototype, keine halb verdrahteten Kanten)

---

## Entscheidung

0. **Produktname: Vorhaben** (UI, SEO, Search) — User-facing Label für die Multi-Tool-Journey (Steps + Recommended + Shared Context + Split-View). **Nicht** „Situation“, „Szenario“, „User Story“, „Journey“. **Code-Namespace: `Flow*`** — alle Identifier englisch (`FlowDefinition`, `useFlowInput`, `FlowWorkspace`, `flowId`; siehe Glossar). URL: konkreter Flow-`slug` (z. B. `vermieter-nachweis`), kein deutsches Segment wie `vorhaben` oder `situation` im Pfad.
1. **Area-agnostische Plattform** — Context-Slots, Bindings und Shell-Adaptation gelten für **alle** Areas (`buchhaltung` … `kreativ`). Vorhaben dürfen Tools aus beliebigen Areas mischen. „Agnostisch“ ≠ „jedes Tool am Tag 1 in einem Vorhaben“ — es heißt: die **Plattform** funktioniert für jede Area, sobald Vorhaben authored werden.
2. **`steps[]` + `recommended[]`** — Journey vs. Side-Quest. Recommended ist visuell sekundär, öffnet im **gleichen** Workspace (Context bleibt), zählt nicht als Step-Progress.
3. **Split-View-Shell** — links Rail, rechts Tool in place. Provider hängt am Vorhaben, remountet nicht beim Tool-Wechsel.
4. **Generisches Slot-System** — `file` / `files` / `text` / `multiline` / `currency` / `iban` / `url` / `date` / `json` / `image` / `password` / `enum` (+ accept-Filter). Kein PDF-Sonderweg als Kernmodell.
5. **Contract: keine doppelte Eingabe (nicht optional)** — Wenn ein Slot gebunden und gefüllt ist, rendert das Tool **kein** eigenes Primary-Input für diesen Slot. Fallback nur außerhalb eines Vorhabens (`/tool/…`) oder bei leerem Slot.
6. **Shell-first** — alle Shell-Factories (`defineCalcTool`, `defineCheckTool`, …) und Layout-Shells (`FilePipeline`, `Editor`, …) bekommen first-class `contextBindings` **bevor** Massen-Authoring von Vorhaben.
7. **URL** — `/bereich/:area/:flowSlug[/:tool]` (Route-Param `flowSlug`, Wert = Katalog-`slug`); Context keyed by `flowId`; Tab-Session bis Leave (+ Confirm bei destruktivem Clear).
8. **Feature-Flag** — Workspace-UI + Context hinter Flag, bis Shell-Adaptation + ≥3 Cross-Area-Pilots green; dann Flag weg. Keine halb fertige UX für Nutzer.

---

## Glossar — Namen & Migration

| UI (DE) | Code (EN) | Notiz |
| --- | --- | --- |
| **Vorhaben** | `Flow` / `FlowDefinition` | Produktname nur in UI, SEO, Search-Typ |
| Aus Vorhaben (Chip) | `FlowBoundChip` · `source: 'flow'` | UI-String: „Aus Vorhaben: …“ |
| Im Vorhaben (Context-Bar) | `FlowContextBar` | UI-String: „Im Vorhaben: …“ |
| Vorhaben wählen | `FlowPickStep` / `goToFlow` | UI: „Wähle dein Vorhaben“ |
| **Ausgangslage** | Feld `situation` | Kurztext Problem — **nicht** das Produkt; optional später `problem` |
| `UserStory` (legacy) | → `FlowDefinition` | Alias `type UserStory = FlowDefinition` in P0 |
| `StoryId` / `story-*` | → `FlowId` / `flow-*` | P1; Alias in P0 |
| `stories.ts` | → `flows.ts` | P1 |
| `Situation*` (Plan-Draft) | — | Verworfen; nie in UI oder Code |
| Feature-Flag | `flowWorkspace` | env / runtime |
| Binding-Hook | `useFlowInput` (`source: 'flow' \| 'local'`) | `apps/website/src/flow/` |
| URL-Segment | `:flowSlug` | `/bereich/:area/:flowSlug[/:tool]` — Wert z. B. `vermieter-nachweis` |

**Rename-Pfad (empfohlen, nicht alles in einem Commit):**

1. **P0:** Types `FlowDefinition` + Alias `type UserStory = FlowDefinition`; IDs/Datei noch `story-*` / `stories.ts`.
2. **P1:** `flows.ts`, `FlowId`, IDs `flow-*`; Redirect-Map für alte `story-*` URLs wenn nötig.
3. **P2:** Shell/Context unter `src/flow/`; PlatformContext `goToFlow`.
4. **Optional:** Feld `situation` → `problem` nur wenn Semantik im Code klarer (UI-Label „Ausgangslage“ bleibt DE).

**UI-Copy-Beispiele (verbindlich):**

| Kontext | String |
| --- | --- |
| Nav / Pick | „Wähle dein Vorhaben“ |
| Context-Bar | „Im Vorhaben: datei.pdf“ |
| Binding-Chip | „Aus Vorhaben: datei.pdf“ · CTA „Ändern“ |
| Empty Pick | „Kein Vorhaben gefunden — Suche anpassen.“ |
| Search-Typ | „Vorhaben“ (nicht „Situation“) |

---

## Lücken im vorherigen Entwurf

Ehrlich, was am ersten Draft prototype-/PDF-lastig war:

| Lücke | Problem |
| --- | --- |
| **PDF/IBAN-Bias** | Slot-Kinds und Beispiele drehten sich um `pdf`/`iban`; Areas wie SEO, Security, Zeit, Einheiten, Barrierefreiheit fehlten als Modalitäts-Coverage. |
| **Tool-Adaptation vage** | „Prefill / Override“ — kein hartes Contract. IBAN-Sketch ließ das Feld sichtbar und syncte nur. Shell-Factories explizit „Phase 2 optional“. |
| **Keine No-Reask-Garantie** | Acceptance „zero redundant prompts“ fehlte. Nutzer hätte in Tool + ContextBar doppelt eingegeben. |
| **Empty/Error-States** | Kein Spec für leeren Slot, falsches MIME, korrupte Datei, Load-Fehler, Soft- vs. Hard-Block. |
| **Race / Sync** | `useState`+`useEffect`-Spiegelung Context↔lokal → doppelte Wahrheit, Stale-Overrides. |
| **URL + Provider** | Konzept ok, aber kein Remount-/Focus-Contract; Mobile nicht spezifiziert. |
| **Blob-Persistenz** | „Memory oder IDB später“ — Refresh-Verlust und Object-URL-Leaks ungelöst. |
| **Secrets** | Kein `password`-Slot-Policy (nie localStorage). |
| **Recommended vs Steps** | Visuell erwähnt, aber Side-Quest-Semantik und Progress-Zählung unscharf. |
| **Validation unvollständig** | Keine Slot-Kind-/Accept-Checks, keine Binding↔Field-Id-Validierung für Shells. |
| **a11y / Keyboard** | Rail-Pfeile, Focus-Management beim Tool-Wechsel fehlten. |
| **Rollout** | Shells nach Vorhaben — falschrum für Production; Feature-Flag fehlte. |

**Antwort auf die User-Frage:** „Tools müssen Daten des Vorhabens nicht erneut abfragen“ war **nicht** als verbindlicher Contract im Entwurf — nur als weicher Prefill. Das ist ab hier **Pflicht**.

---

## Zielbild — Agnostisches Context-Modell

### Catalog types

**Datei:** `apps/website/src/data/catalog/types.ts`

```ts
/** Generische Slot-Kinds — area-agnostisch, nicht PDF-spezifisch */
export type FlowSlotKind =
  | 'file'       // einzelne Datei; accept via mime/ext
  | 'files'      // File[]
  | 'image'      // File, typischerweise image/* (Convenience über file+accept)
  | 'text'       // einzeilig
  | 'multiline'  // Textarea / Paste-Body
  | 'currency'   // number + DE-Rohstring optional
  | 'iban'       // normalisierter String
  | 'url'
  | 'date'       // ISO date string
  | 'json'       // string (validiertes JSON) oder unknown
  | 'password'   // string — session-only, nie persistieren
  | 'enum';       // string ∈ options

export type FlowSlotAccept = {
  readonly mime?: readonly string[]; // e.g. ['application/pdf', 'image/*']
  readonly ext?: readonly string[];  // e.g. ['.pdf', '.png']
  readonly maxBytes?: number;        // hard limit pro Slot
};

export type FlowSlotDef = {
  readonly id: string;               // 'sourceDoc' | 'iban' | 'metaHtml' | …
  readonly kind: FlowSlotKind;
  readonly label: string;
  readonly required?: boolean;
  readonly accept?: FlowSlotAccept; // file/files/image
  readonly options?: readonly { value: string; label: string }[]; // enum
  /** password: immer sessionOnly; andere Slots default persistScalars */
  readonly persist?: 'session-scalar' | 'memory' | 'never';
};

export type FlowContextSchema = {
  readonly slots: readonly FlowSlotDef[];
};

export type FlowStep = {
  readonly toolId: ToolId;
  readonly label: string;
  readonly why?: string;
  readonly optional?: boolean;
};

export type FlowRecommendation = {
  readonly toolId: ToolId;
  readonly reason: string;
};

/**
 * toolId → { toolInputKey → flowSlotId }
 * toolInputKey = Shell-Field-Id ODER bespoke Key ('pdf', 'source', 'paste', …)
 */
export type FlowStepBindings = Readonly<
  Record<ToolId, Readonly<Record<string, string>>>
>;

export type FlowDefinition = {
  readonly id: StoryId;
  readonly slug: string;
  readonly areaIds: readonly AreaId[]; // primary first
  readonly role: string;
  readonly want: string;
  readonly title: string;
  /** Ausgangslage — Problemtext, nicht der Produktname „Vorhaben“ */
  readonly situation: string;
  readonly outcome: string;
  readonly status: 'ready' | 'planned';
  readonly steps: readonly FlowStep[];
  readonly recommended?: readonly FlowRecommendation[];
  readonly context: FlowContextSchema;
  readonly stepBindings: FlowStepBindings;
};

/** Alias während Migration */
export type UserStory = FlowDefinition;
```

**Default-Persist-Policy pro Kind:**

| Kind | Persist |
| --- | --- |
| `text`, `multiline`, `currency`, `iban`, `url`, `date`, `enum`, `json` | `session-scalar` (sessionStorage) |
| `file`, `files`, `image` | `memory` (+ optional IDB binary store) |
| `password` | **`never`** — nur In-Memory, Clear on leave / visibility hidden optional |

### Runtime values

```ts
// flow/context-types.ts
export type FlowSlotValue =
  | { kind: 'file'; file: File; name: string; byteSize: number; objectUrl?: string }
  | { kind: 'files'; files: { file: File; name: string; byteSize: number }[] }
  | { kind: 'image'; file: File; name: string; byteSize: number; objectUrl?: string }
  | { kind: 'text' | 'multiline' | 'iban' | 'url' | 'date' | 'password' | 'enum'; value: string }
  | { kind: 'currency'; value: number; raw?: string }
  | { kind: 'json'; value: unknown; raw: string }
  | null;
```

### Blob / File engineering

| Thema | Decision |
| --- | --- |
| Speicherung | In-Memory `Map` keyed `(flowId, slotId)` + **optional** IndexedDB (wie `artifact-store.ts`) für Refresh-Survive innerhalb Session |
| Object URLs | Erzeugen in `setSlot`; **revoke** bei Replace, `clearSlot`, Provider-Unmount, Leave |
| Size limits | Default `maxBytes` z.B. 40 MB/file; darüber Soft-Error in ContextBar |
| Tab refresh | Skalare aus sessionStorage; Files aus IDB wenn enabled, sonst Empty → Soft-Warn „Datei erneut wählen“ |
| Secrets | `password` nie in sessionStorage/IDB |

---

## Contract: Tool-Adaptation (CRITICAL — nicht optional)

### Kernregel

> Innerhalb eines Vorhabens mit Binding und gefülltem Slot: **kein zweites Primary-Input** für denselben Slot. Chip „Aus Vorhaben: …“ + optional „Ändern“ öffnet den **Flow-Slot-Editor** (`FlowContextBar`), keine lokale Parallel-Kopie.

### Pseudo-API

```ts
type ToolInputSource<T> =
  | { source: 'flow'; value: T; locked: true; slotId: string; editInFlow: () => void }
  | { source: 'local'; value: T | null; setValue: (v: T | null) => void };

/**
 * Pflicht-Hook für Shells und Bespoke-Tools.
 * Fallback local nur wenn: kein Provider ODER kein Binding ODER Slot leer
 *   (dann: lokales Input sichtbar; bei setValue optional zurück in Slot schreiben wenn Binding existiert).
 */
function useFlowInput<T>(
  toolId: ToolId,
  inputKey: string,
  decode: (slot: FlowSlotValue) => T | null,
): ToolInputSource<T>;
```

### Implementierungsskizze

```ts
// flow/useFlowInput.ts
export function useFlowInput<T>(
  toolId: ToolId,
  inputKey: string,
  decode: (slot: FlowSlotValue) => T | null,
): ToolInputSource<T> {
  const ctx = useFlowContext(); // null außerhalb /tool/…
  const flow = useActiveFlowOrNull();
  const slotId = flow?.stepBindings[toolId]?.[inputKey];
  const [local, setLocal] = useState<T | null>(null);

  if (ctx && slotId) {
    const raw = ctx.getSlot(slotId);
    const value = raw ? decode(raw) : null;
    if (value != null) {
      return {
        source: 'flow',
        value,
        locked: true,
        slotId,
        editInFlow: () => ctx.focusSlotEditor(slotId), // scroll/open ContextBar editor
      };
    }
    // Binding existiert, Slot leer → lokal erfassen UND in Slot schreiben
    return {
      source: 'local',
      value: local,
      setValue: (v) => {
        setLocal(v);
        if (v != null) ctx.setSlot(slotId, encodeForSlot(flow.context, slotId, v));
      },
    };
  }

  return { source: 'local', value: local, setValue: setLocal };
}
```

Convenience-Aliase:

```ts
useOptionalFlowBinding('sourcePdf') // nur lesen Binding-Meta
useFlowSlot(slotId)                 // Flow-UI (ContextBar), nicht Tools
```

### UI-Regel (verbindlich)

```tsx
function FlowBoundChip({ label, onEdit }: { label: string; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
      <span>Aus Vorhaben: {label}</span>
      <button type="button" onClick={onEdit}>Ändern</button>
    </div>
  );
}

// Primary-Input NUR wenn source === 'local'
function BoundFileField({ toolId }: { toolId: ToolId }) {
  const input = useFlowInput(toolId, 'file', decodeFile);
  if (input.source === 'flow') {
    return (
      <FlowBoundChip
        label={input.value.name}
        onEdit={input.editInFlow}
      />
    );
    // KEIN <FileDrop /> hier
  }
  return <FileDrop onFile={(f) => input.setValue(f)} />;
}
```

### Shell-Adaptation-Matrix (ALLE Shells — Pflicht vor Massen-Authoring)

| Shell / Factory | Was gebunden wird | Verhalten bei `source === 'flow'` |
| --- | --- | --- |
| `defineCalcTool` / `CalcToolShell` | Field-Ids (`currency`, `number`, `date`, `segment`→`enum`, `text`) | Bound Fields: **kein** FieldRenderer-Input; Chip + Wert fließt in `compute` |
| `defineCheckTool` / `CheckToolShell` | Primary check field (iban, text, …) | Check-Input ausgeblendet; Ergebnis live aus Slot |
| `defineGenerateTool` / `GenerateToolShell` | Form fields die Slots mappen | Gebundene Fields → Chip; ungebundene bleiben editierbar |
| `definePasteTool` / `PasteAnalyzeToolShell` | `paste` → `multiline`/`text`/`password` | Paste-Textarea **nicht** rendern; Chip „Aus Vorhaben“ |
| `defineExtractTool` / `ExtractToolShell` | `source` file/text | Dropzone/Textarea ausblenden |
| `FilePipelineToolShell` | `file` / `image` | Dropzone ausblenden; Pipeline startet mit Context-File |
| `EditorToolShell` | `file` / `image` / `pdf`-via-`file` | Kein zweiter Upload; Canvas/Editor mit Context-Blob |
| Bespoke (ohne Factory) | `useFlowInput(toolId, key, decode)` | Gleiches Chip-/Hide-Pattern |

**Shell-Config API:**

```ts
// First-class — nicht Pilot-Hack
defineCalcTool({
  catalog: { /* … */ },
  fields: [/* … */],
  /**
   * Optional Hint für Docs/Validate; Runtime-Binding kommt aus `FlowDefinition.stepBindings`.
   * Shell liest: stepBindings[toolId][field.id] → useFlowInput
   */
  compute,
}, 'vat-calculator');

// FilePipeline / Editor: Prop von ToolBody
<FilePipelineToolShell
  contextInject={{ fileInputKey: 'file' }} // maps to stepBindings[toolId].file
  /* … */
/>
```

`ToolBody` / Workspace übergibt `toolId` + Binding-Lookup an Shells automatisch (Provider + active flow). Tools brauchen **keine** manuelle Provider-Verdrahtung außer Bespoke-Hooks.

### Bespoke-Pattern (pdf-redact, image-crop, girocode, …)

```tsx
// tools/pdf-redact/PdfRedactTool.tsx
export function PdfRedactTool({ tool }: { tool: ToolDefinition }) {
  const pdf = useFlowInput(tool.id, 'pdf', (s) =>
    s?.kind === 'file' || s?.kind === 'image' ? s.file : null,
  );

  if (pdf.source === 'flow') {
    return (
      <EditorToolShell>
        <FlowBoundChip label={pdf.value.name} onEdit={pdf.editInFlow} />
        <RedactCanvas
          file={pdf.value}
          onExport={(out) => {
            // schreibt zurück in denselben Flow-Slot (kein lokaler Parallel-State)
            useFlowContext()!.setSlot(
              pdf.slotId,
              { kind: 'file', file: out, name: out.name, byteSize: out.size },
            );
          }}
        />
      </EditorToolShell>
    );
  }

  // /tool/… oder leerer Slot
  return (
    <EditorToolShell>
      <FileDrop accept=".pdf" onFile={(f) => pdf.setValue(f)} />
      {pdf.value ? <RedactCanvas file={pdf.value} /* local export */ /> : null}
    </EditorToolShell>
  );
}
```

**Anti-Pattern (verboten):**

```tsx
// ❌ doppelte Wahrheit
const bound = useBound…();
const [local, setLocal] = useState(bound.value);
useEffect(() => setLocal(bound.value), [bound.value]);
return <IbanInput value={local} onChange={setLocal} />; // Feld bleibt sichtbar
```

### Acceptance (Contract-Tests)

1. Vorhaben mit gefüllten Slots öffnen → für jeden gebundenen InputKey **kein** Dropzone/IBAN-Feld/Primary-Textarea im Tool.
2. Tool-Wechsel in der Rail → Slot-Werte bleiben; kein Re-Prompt.
3. „Ändern“ → Focus/Scroll zur ContextBar-Slot-UI; nach Edit sehen alle gebundenen Tools den neuen Wert.
4. `/tool/:slug` → volles lokales Input, kein Chip.
5. Leerer required Slot → Soft-Warn (siehe UX); Tool darf lokales Capture zeigen, schreibt in Slot.

### Leave-Policy

- Context bleibt für `flowId` in der **Tab-Session**, bis Nutzer das Vorhaben verlässt (Back zur Area) **oder** explizit „Kontext löschen“.
- Destruktives Clear (alle Slots / Leave mit Files): **Confirm-Dialog** wenn irgendein Slot gesetzt.
- `password`-Slots: clear on leave immer, ohne Persist.

---

## Production UX

### Layout

| Viewport | Verhalten |
| --- | --- |
| Desktop ≥ `md` | Split: Rail ~280px links, Main rechts. Sticky Context-Bar oben im Main. |
| Mobile `< md` | **Stacked:** Context-Bar sticky oben → Tool Main → Bottom-Sheet / Drawer für Steps+Recommended (nicht kaputte Side-by-Side). Step-Wechsel schließt Sheet. |

### Vorhaben Landing / Workspace-Zonen

1. **Sticky Context Bar** (`FlowContextBar`) — immer sichtbar im Workspace: alle Slots (filled / empty / error). Required mit Marker.
2. **Step Rail** — required vollkontrast, optional gedämpft + Badge; Keyboard ↑↓ / Home/End.
3. **Recommended Drawer/Section** — visuell sekundär („Auch interessant“); Klick = Side-Quest im **rechten Pane**, Vorhaben bleibt, Progress-Zähler der Steps unverändert.
4. **Tool Pane** — `ToolBody` in place.
5. **Continue Footer** — nach Tool-Success (Context noch valid): „Weiter: {nextStep.label}“; Skip bei optional.

### Empty / Block Policy

**Entscheidung: Soft-Warn, kein Hard-Block.**

- Rationale: Nutzer darf Rail springen (z.B. Checkliste vor Upload); Hard-Block frustriert und widerspricht „kein Wizard“.
- Required-Slot leer: ContextBar zeigt Warn-State; Continue-CTA disabled **oder** Label „Zuerst {slot.label}“; Tool zeigt Capture-UI für den Slot.
- Optional-Slot leer: kein Warn.

### Error States

| State | UI |
| --- | --- |
| Wrong MIME / ext | Inline-Error am Slot; Datei nicht gesetzt |
| Over `maxBytes` | Inline-Error mit Limit |
| Corrupt / unreadable file | Tool-level Error + „Andere Datei wählen“ → `editInFlow` |
| Slot decode fail (iban/json) | Chip + Validation-Hint; Tool Check/Compute zeigt invalid |
| Provider missing mid-nav | Fail soft → local mode (shouldn’t happen if routing correct) |

### Keyboard & Focus

- Rail: Pfeiltasten zwischen Steps; Enter aktiviert.
- Tool-Wechsel: Focus auf Main-Landmark (`<main tabIndex={-1} ref.focus()`), **nicht** ins Leere; Chip oder erstes unbound Field.
- ContextBar-Slot-Editor: Escape schließt Inline-Edit.

### Trust Copy

- Einzeiler im Workspace: „Alles bleibt lokal in diesem Tab — nichts wird hochgeladen.“
- Secrets-Slots: zusätzlicher Hinweis „wird nicht gespeichert“.

### Empfohlen (Recommended)

- Visuell secondary (kleinere Type, muted border, kein Nummernkreis).
- Klick → Tool im rechten Pane **innerhalb** des Vorhabens (Side-Quest), URL `…/:toolSlug`, Query oder Flag `?side=1` optional für Analytics — Progress der Steps ignoriert Side-Quests.
- Nicht: Navigation auf isolierte `/tool/…` Seite.

### Next-Step CTA

Nach erfolgreicher Aktion (Shell `onSuccess` / Export / valid Check): Footer „Weiter: …“ wenn nächster required/optional Step existiert und Context für dessen Bindings ready oder soft-warn ok.

---

## Production Engineering

### React-Struktur

```text
ToolShell
  └─ FlowWorkspace          ← mountet Provider EINMAL pro flowId
       ├─ FlowContextProvider
       │    ├─ FlowContextBar (sticky)
       │    ├─ FlowStepRail | MobileSheet
       │    ├─ <main> ToolBody(activeTool) </main>   ← nur Tool remountet
       │    └─ FlowContinueFooter
```

- Provider **über** Tool-Outlet; Step-Wechsel remountet **nicht** den Provider.
- URL sync: path segment toolSlug; bei fehlendem Segment → first required step (replace).
- Deep-Link `/…/:flowSlug/:toolSlug` mit leerem Context: Soft-Warn, Tool im Capture-Mode.

### Catalog Validation (`validate.ts`)

| Code | Regel |
| --- | --- |
| `FLOW_MIN_STEPS` | `steps.length >= 2` (außer Variant-SEO) |
| `FLOW_STEP_UNKNOWN` / `REC_UNKNOWN` | Tool-Ids existieren |
| `FLOW_REC_DUP_STEP` | recommended ∩ steps = ∅ |
| `FLOW_STEP_DUP` | unique steps |
| `FLOW_SLOT_ID_DUP` | unique slot ids |
| `FLOW_SLOT_KIND` | kind ∈ enum; `enum` braucht `options`; file-kinds dürfen `accept` |
| `FLOW_BINDING_UNKNOWN_SLOT` | binding values ∈ slot ids |
| `FLOW_BINDING_UNKNOWN_TOOL` | binding keys ⊆ steps ∪ recommended |
| `FLOW_BINDING_INPUT_KEY` | für Shell-Tools: inputKey ∈ field ids / documented keys |
| `FLOW_PASSWORD_PERSIST` | password-Slots `persist: 'never'` |
| `FLOW_CROSS_AREA_OK` | Tool-Area muss nicht ⊂ flow.areaIds |
| `FLOW_TOOL_SYNC` | bidirektional storyIds ↔ steps (+ optional recommended) |
| `TOOL_DIRECT_OK` | `storyIds.length === 0` erlaubt |

### Testing Plan

| Ebene | Was |
| --- | --- |
| Unit | Bindings resolve; `useFlowInput` source-Zweig (mock Provider); persist skip password; accept filter; validate rules |
| Component | Tool mit filled binding → **kein** FileDrop/IBAN-Input im DOM; Chip sichtbar; Ändern ruft `focusSlotEditor` |
| Component | `/tool` ohne Provider → Input sichtbar |
| E2E smoke | 1 Multi-Slot-Vorhaben (z.B. Freelancer): Slot setzen → Step1 ohne Re-Ask → Step2 gleiches IBAN/Amount → Recommended öffnet in Pane |
| a11y smoke | Rail keyboard; focus land after switch |

### Feature-Flag & Rollout

**Flag:** `flowWorkspace` (env / runtime).

| Phase | Deliverable | User-safe? |
| --- | --- | --- |
| **P0** | Types, validate, `toolIds`→`steps` Migration, Context Provider + Blob store | Ja (Flag off = alte UI) |
| **P1** | **Shell-Adaptation ALL shells** + Chip-Komponente + Contract-Tests | Ja (Flag off) |
| **P2** | `FlowWorkspace` Split + Mobile Sheet + ContextBar + Footer | Nur hinter Flag |
| **P3** | 3 Cross-Area Pilot-Vorhaben (unten) + Bespoke-Adaptation der gebundenen Tools | Flag on für interne QA |
| **P4** | Code polish (search/SEO „Vorhaben“, pilot tests); flag default on | Flag on |

**Reihenfolge kritisch:** Shell-Support **vor** Massen-Authoring. Kein Vorhaben live, deren Tools noch doppelte Inputs zeigen.

### Migration Notes

- `UserStory.toolIds` → `steps` (label = tool.shortTitle vorerst); `recommended: []`; `context: { slots: [] }`; `stepBindings: {}` bis authored.
- 1:1-Stories: demoten, erweitern auf ≥2 Steps, oder als Direkt-Tool belassen ohne `FlowWorkspace`.
- Alias `UserStory = FlowDefinition` in P0; Rename-Datei `stories.ts` → `flows.ts` in P1 (siehe Glossar).

---

## Area-agnostische Beispiel-Vorhaben

Ziel: ≥1 Vorhaben pro **Hauptmodalität**; bestehende Tools; Cross-Area betont. Nicht jede Area braucht am Tag-1 eine Story — die **Plattform** muss sie können.

### 1 — PDF + Image (wohnen / behoerden / bilder)

`story-vermieter-nachweis` — Slots: `sourcePdf:file(accept pdf)`, `optionalPhoto:image`. Tools: checklist → pdf-redact → image-exif-strip; recommended pdf-compress.

### 2 — IBAN + Currency (buchhaltung)

`story-freelancer-zahlung` — Slots: `iban`, `amount:currency`. Tools: iban-validate → amount-in-words → girocode-gen; recommended vat-calculator.

### 3 — Text / Paste Security (security)

`story-leak-check-flow` — Slots: `secret:password` (never persist), `email:text`. Tools: breach-password-check → (optional) related check; recommended text-hash. **Zeigt password-Policy.**

### 4 — SEO Paste (seo / web)

`story-seo-meta-pass` — Slot: `pageHtml:multiline`. Tools: meta-preview → sitemap-related / alt-text-length je nach Katalog; Bindings auf Paste-Shell.

### 5 — Image Pipeline (bilder)

`story-portal-foto` — Slot: `photo:image`. Tools: convert → resize → exif-strip (alle FilePipeline); ein Slot durchgereicht, Export schreibt zurück.

### 6 — Calc / Zeit (zeit + einheiten exemplarisch)

`story-frist-berechnen` — Slots: `startDate:date`, `days:text|currency→number via text`. Tools: add-days → business-days / calendar-week; Shell-Calc Bindings.

### 7 — Extract PDF Text (dokumente / behoerden)

`story-scan-text` — Slot: `scanPdf:file`. Tools: pdf extract-text → char-counter / case-converter (text area); Cross-area dokumente→text.

**Pilot für Flag-On (P3):** Vorhaben 1, 2, 5 (file + scalar + image) — decken Shell-Matrix + Bespoke ab. 3/4/6/7 folgen sobald Shells grün.

### Modalitäts-Coverage (Plattform-Check)

| Modalität | Slot-Kinds | Shells | Pilot |
| --- | --- | --- | --- |
| PDF/File | `file` | FilePipeline, Editor, Extract | 1, 7 |
| Image | `image` | FilePipeline, Editor | 1, 5 |
| Scalar form | `iban`, `currency`, `date`, `text`, `enum` | Calc, Check, Generate | 2, 6 |
| Paste/Text | `multiline`, `password` | Paste, Check | 3, 4 |
| Generate out | (inputs bound) | Generate | 2 |

Alle Areas (`AREA_IDS`) können Vorhaben authoren, sobald Tools existieren — **kein** Area-Sonderweg im Context-Code.

---

## Non-goals

- Nicht jedes Tool am Tag 1 in ein Vorhaben pressen.
- Agnostisch ≠ vollständige Katalog-Abdeckung am Launch — es bedeutet **plattformfähig für jede Area**.
- Kein Server-/Account-Sync für Context.
- `/tool/:slug` bleibt first-class ohne Provider.
- Kein erzwungener linearer Wizard.
- Variant-SEO-Routes bleiben 1-Tool-Shortcuts.
- Keine AI-Massen-Generierung von Vorhaben.
- Privacy-Linie: Dateien lokal; Secrets nie persistieren.

---

## Mapping Ist → Soll

| Heute | Soll |
| --- | --- |
| `UserStory.toolIds` | `steps` + `recommended` |
| `ToolPickForStory` / 1-Tool-Redirect | `FlowWorkspace` (Flag) |
| `ToolWorkspace` | Direkt-Tools + Varianten |
| Image `artifact-store` | Vorbild für File-Slot-Store (generalisiert) |
| `ContinueWithNextTool` | `FlowContinueFooter` |
| Shell fields ohne Context | `useFlowInput` in allen Factories |
| Prefill-Skizze | **Hide primary input** + Chip-Contract |

---

## Definition of Done — Production Launch

Checklist — alles muss true sein bevor Flag default-on / Launch:

### Plattform

- [x] `FlowDefinition` + generische Slot-Kinds (inkl. `password` never-persist) im Katalog _(P0)_
- [x] `FlowContextProvider` remountet nicht bei Tool-Wechsel; URL sync stabil _(P2)_
- [x] File/Blob: Object-URL revoke; Size-Limits; IDB oder dokumentierter Memory+Refresh-Warn _(P0: Memory + revoke; IDB optional später)_
- [x] Validate-Regeln inkl. Bindings↔Slots, min 2 Steps, recommended disjoint, accept, password _(P0; FLOW_MIN_STEPS gilt für authored Multi-Tool)_

### No-Reask Contract

- [x] `useFlowInput` API + Chip-Komponente _(P1)_
- [x] **Alle** Shell-Factories + FilePipeline/Editor blenden gebundene Primary-Inputs aus _(P1)_
- [x] ≥1 Bespoke-Tool (pdf-redact, girocode-gen, iban-validate, pdf-compress + image pipeline) folgt demselben Pattern _(P3)_
- [x] Component-Tests: filled flow → zero redundant prompts; `/tool` → Input sichtbar _(P1)_
- [x] Leave: Confirm bei gesetztem Context; password cleared _(P2)_

### UX

- [x] Desktop Split + Mobile Bottom-Sheet/Stack (kein broken Mobile) _(P2)_
- [x] Sticky Context Bar; Soft-Warn für leere required Slots _(P2)_
- [x] Recommended secondary + Side-Quest im Pane _(P2)_
- [x] Continue Footer nach Success _(P2; shells + bespoke call `useFlowSession().reportToolSuccess`)_
- [x] Keyboard Rail + Focus-Management _(P2)_
- [x] Trust-Copy; Error-States (MIME, size, corrupt) _(P2)_

### Coverage & Rollout

- [x] ≥3 Cross-Area/-Modalität Pilot-Vorhaben ready _(P3: vermieter-nachweis, freelancer-zahlung, portal-foto)_
- [x] Search/SEO label „Vorhaben“ (nicht „Situation“) in Such-UI, Story-Keywords, Suche-SEO _(P4)_
- [ ] E2E smoke einer Multi-Slot-Vorhaben grün _(manuell)_
- [x] Feature-Flag default on nach QA
- [x] Kein Vorhaben live, deren gebundenes Tool noch doppelte Inputs zeigt _(Pilots hinter Flag; gebundene Tools adapted)_

### Explizit nicht DoD

- [ ] Nicht: jede Area hat schon Vorhaben
- [ ] Nicht: jedes Tool adaptiert, wenn es in keinem Vorhaben vorkommt (Direkt-Tool ok)

---

## Nächster Schritt (wenn Implementierung freigegeben)

1. P0 Types + validate + Migration.  
2. P1 Shell-Adaptation + `useFlowInput` + Tests (**vor** UI-Polish).  
3. P2 Workspace UI (Desktop + Mobile) hinter Flag.  
4. P3 Drei Pilots + Bespoke.  
5. DoD-Checklist abhaken → Flag on.
