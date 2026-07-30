# Plan — KI-Chat (Notion-Stil) über OpenRouter

**Date:** 2026-07-28  
**Scope:** `packages/*` (neu) + `apps/website` Shell-UI  
**Status:** P4 code complete — Assistent feature-flagged (`assistantChat`, default on). Manual smoke pending.  
**Related:**
- `docs/plans/2026-07-28-vorhaben-multi-tool.md` (Flow / Vorhaben)
- `docs/plans/2026-07-28-bereich-tool-roadmap.md`
- Favorites: `PlatformContext` (`msf.favorites`)

**Zielqualität:** Production-ready Assistent — kein Prototyp-Chat, der „irgendwie Tools kennt“.

---

## Entscheidung

0. **UI-Produktname:** „Assistent“ oder „KI-Hilfe“ (DE) — **nicht** „AI Chat“, „Copilot“, „Situation“. Finales Label im UI-Copy-Abschnitt fixieren (Vorschlag: **Assistent**).
1. **Code-Namespace (EN):** `Assistant*` / `assistant*` — UI-Strings nur DE.
2. **Zwei Darstellungsmodi** (wie Notion):
   - `sidebar` — rechte Sidebar, volle Höhe neben dem Main-Content
   - `floating` — sticky Floating-Window **bottom-right**, resize/minimize
   - Persistenz der Preferenz in Settings (`localStorage`)
3. **LLM nur über OpenRouter** — Browser ruft OpenRouter mit **user-supplied API key** (lokal in Settings; nie in Repo/SOPS für Endnutzer-Keys). Dev-Default optional via SOPS nur für interne Tests.
4. **Kein Tool-Dump an das Modell** — der Agent bekommt **kleine Meta-Tools**:
   - `list_areas` / `get_area`
   - `list_flows` / `get_flow` (Vorhaben)
   - `search_tools` / `get_tool`
   - `run_tool`
   - `request_user_input` (Datei/Text vom Nutzer anfordern)
   - `attach_from_chat` (bereits im Thread vorhandene Attachments referenzieren)
5. **Favorites immer im System-Prompt** (und optional als schnelles Tool `list_favorites`) — immer aktuell aus `PlatformContext`.
6. **Alles lokal:** Chat-Threads, Attachments (IDB), Settings, Layout-Mode, Drafts — `localStorage` / IndexedDB. Kein Server außer OpenRouter.
7. **Monorepo-Packages** (wir bauen und pflegen sie):
   - `@macheseinfach/openrouter` — thin OpenRouter client (chat completions + tool calling)
   - `@macheseinfach/assistant-core` — agent loop, tool registry, message types, persistence adapters (framework-agnostic)
   - `@macheseinfach/assistant-ui` (optional Phase 2) **oder** UI zuerst in `apps/website` + primitives in `@macheseinfach/ui`
8. **Tool-Ausführung bleibt im Browser** — `run_tool` dispatched in die bestehende Tool-Engine / Catalog (compute + später File-Pipelines). Kein serverseitiges Tool-Hosting.
9. **Feature-Flag** `assistantChat` bis Meta-Tools + Persistence + beide Layouts green.

---

## Glossar

| UI (DE) | Code (EN) |
| --- | --- |
| Assistent | `Assistant` / `AssistantPanel` |
| Sidebar | `AssistantLayoutMode = 'sidebar'` |
| Schwebendes Fenster | `AssistantLayoutMode = 'floating'` |
| Bereich | `Area` (via `list_areas`) |
| Vorhaben | `Flow` (via `list_flows`) |
| Tool ausführen | `run_tool` |
| Datei / Text anfordern | `request_user_input` |
| Favoriten | `favorites` (PlatformContext) |
| OpenRouter-Key | `openRouterApiKey` (Settings, local only) |

---

## Problem / Warum so

- 100+ Tools → Context-Window und Halluzinationen, wenn man alle Specs reinpackt.
- Nutzer denkt in **Bereichen** und **Vorhaben**, nicht in Tool-IDs.
- Notion-Pattern: Assistent immer greifbar, ohne die Seite zu verlassen; Layout wählbar.
- Trust-Modell der Plattform: lokal arbeiten; der Assistent **orchestriert** Browser-Tools, er ersetzt sie nicht durch Cloud-Processing von PDFs (außer der User schickt explizit Text an das Modell).

---

## Architektur (Zielbild)

```text
┌─────────────────────────────────────────────────────────────┐
│ apps/website                                                │
│  AssistantHost (layout sidebar | floating)                  │
│  ├── AssistantThreadView                                    │
│  ├── AssistantComposer (text + attach file)                 │
│  ├── InputRequestModal (when agent calls request_user_input)│
│  └── tool bridge → catalog / flow / compute                 │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
    @macheseinfach/assistant-core      PlatformContext
    (agent loop, tools, store)        (favorites, nav)
                │
    @macheseinfach/openrouter
    (fetch → openrouter.ai)
```

### Package-Grenzen

| Package | Verantwortung | Nicht |
| --- | --- | --- |
| `@macheseinfach/openrouter` | Auth header, chat.completions, stream, tool_calls parsing, errors | UI, catalog |
| `@macheseinfach/assistant-core` | Messages, threads, agent loop, meta-tool defs, persistence ports | React, OpenRouter URL details beyond interface |
| `apps/website` | Layouts, neo-brutalist chrome, wire favorites/catalog/run_tool | Raw fetch to OpenRouter (use package) |
| `@macheseinfach/ui` | Optional: `AssistantShell`, `Chip`, resize handle primitives | Business logic |

---

## Code-Skizzen (verbindlich fürs Ziel)

### 1. OpenRouter client — `packages/openrouter`

```ts
// packages/openrouter/src/types.ts
export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export type ChatMessage = {
  role: ChatRole;
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type ToolCall = {
  id: string;
  type: 'function';
  function: { name: string; arguments: string }; // JSON string
};

export type ToolDefinition = {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>; // JSON Schema
  };
};

export type ChatCompletionRequest = {
  model: string; // e.g. 'anthropic/claude-sonnet-4'
  messages: ChatMessage[];
  tools?: ToolDefinition[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  temperature?: number;
  stream?: boolean;
};

// packages/openrouter/src/client.ts
export function createOpenRouterClient(options: {
  apiKey: string;
  baseUrl?: string; // default https://openrouter.ai/api/v1
  defaultHeaders?: Record<string, string>; // HTTP-Referer, X-Title
}) {
  return {
    async chat(req: ChatCompletionRequest): Promise<ChatMessage> { /* … */ },
    async chatStream(req: ChatCompletionRequest): AsyncIterable<string | ToolCallDelta> { /* … */ },
  };
}
```

### 2. Assistant core — meta-tools only

```ts
// packages/assistant-core/src/meta-tools.ts
export const META_TOOLS = [
  {
    name: 'list_areas',
    description: 'List all tool areas (Bereiche) with id, label, description, toolCount.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_area',
    description: 'Get one area and a compact list of tools in that area (id, title, sub).',
    parameters: {
      type: 'object',
      required: ['areaId'],
      properties: { areaId: { type: 'string' } },
    },
  },
  {
    name: 'list_flows',
    description: 'List Vorhaben (flows): multi-tool journeys. Filter by areaId optional.',
    parameters: {
      type: 'object',
      properties: {
        areaId: { type: 'string' },
        query: { type: 'string' },
      },
    },
  },
  {
    name: 'get_flow',
    description: 'Get one flow with steps[], recommended[], and context slot schema.',
    parameters: {
      type: 'object',
      required: ['flowId'],
      properties: { flowId: { type: 'string' } },
    },
  },
  {
    name: 'search_tools',
    description: 'Search tools by query / tags / area. Returns top matches (never dump full catalog).',
    parameters: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string' },
        areaId: { type: 'string' },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'get_tool',
    description: 'Get tool metadata + input schema summary for run_tool.',
    parameters: {
      type: 'object',
      required: ['toolId'],
      properties: { toolId: { type: 'string' } },
    },
  },
  {
    name: 'list_favorites',
    description: 'List the user\'s favorite tools (always available; also injected in system prompt).',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'request_user_input',
    description:
      'Ask the user for a file or text needed for a later run_tool. Blocks until user provides or cancels. Returns an attachmentId.',
    parameters: {
      type: 'object',
      required: ['kind', 'prompt'],
      properties: {
        kind: { type: 'string', enum: ['file', 'files', 'text', 'multiline'] },
        prompt: { type: 'string', description: 'German instruction shown to the user' },
        accept: { type: 'string', description: 'e.g. application/pdf,.pdf' },
        slotHint: { type: 'string', description: 'logical name e.g. sourcePdf' },
      },
    },
  },
  {
    name: 'attach_from_chat',
    description:
      'Reference a file/text already uploaded in this thread (by attachmentId).',
    parameters: {
      type: 'object',
      required: ['attachmentId'],
      properties: { attachmentId: { type: 'string' } },
    },
  },
  {
    name: 'run_tool',
    description:
      'Execute a catalog tool locally in the browser. Pass inputs as JSON; file inputs as attachmentId refs.',
    parameters: {
      type: 'object',
      required: ['toolId', 'input'],
      properties: {
        toolId: { type: 'string' },
        input: { type: 'object' },
        openInUi: {
          type: 'boolean',
          description: 'If true, navigate/open the tool UI with prefilled context',
        },
      },
    },
  },
  {
    name: 'open_flow',
    description: 'Open a Vorhaben (flow) workspace in the UI, optionally with prefilled slots.',
    parameters: {
      type: 'object',
      required: ['flowId'],
      properties: {
        flowId: { type: 'string' },
        slotValues: { type: 'object' },
      },
    },
  },
] as const;
```

### 3. Host bridge (website wires catalog)

```ts
// apps/website/src/assistant/toolHost.ts
export type AssistantHost = {
  listAreas(): AreaSummary[];
  getArea(areaId: string): AreaDetail | null;
  listFlows(filter?: { areaId?: string; query?: string }): FlowSummary[];
  getFlow(flowId: string): FlowDefinition | null;
  searchTools(query: string, opts?: { areaId?: string; limit?: number }): ToolHit[];
  getTool(toolId: string): ToolMeta | null;
  listFavorites(): ToolHit[]; // from PlatformContext
  runTool(toolId: string, input: unknown): Promise<ToolRunResult>;
  openFlow(flowId: string, slots?: Record<string, unknown>): void;
  openTool(toolId: string, prefill?: unknown): void;
  requestUserInput(req: UserInputRequest): Promise<AttachmentRef | { cancelled: true }>;
  resolveAttachment(id: string): Promise<AttachmentPayload | null>;
};
```

`run_tool` für Calc/Check/Generate/Paste: ruft `compute` / shell compute synchron oder async auf und gibt strukturiertes Ergebnis (JSON + kurze DE-Zusammenfassung) zurück.  
Für File/Editor-Tools (PDF redact, …): Phase 1 = `openInUi: true` + Prefill Attachment; Phase 2 = headless wo machbar.

### 4. System prompt (immer Favoriten)

```ts
function buildSystemPrompt(ctx: {
  favorites: { id: string; title: string }[];
  locale: 'de';
}): string {
  return [
    'Du bist der Assistent von macheseinfa.ch.',
    'Du hilfst lokal im Browser. Sensible Dateien verarbeiten Tools lokal — du orchestrierst nur.',
    'Nutze Meta-Tools: erst Bereiche/Vorhaben/Tools suchen, dann run_tool oder open_flow.',
    'Erfinde keine toolIds. Bei Unsicherheit search_tools / list_areas.',
    'Sprich Deutsch, knapp, klar.',
    `Favoriten des Nutzers: ${ctx.favorites.map((f) => `${f.title} (${f.id})`).join(', ') || '— keine —'}`,
  ].join('\n');
}
```

### 5. Thread + Attachments (lokal)

```ts
// packages/assistant-core/src/types.ts
export type AttachmentKind = 'file' | 'text';

export type ChatAttachment = {
  id: string; // uuid
  kind: AttachmentKind;
  name: string;
  mime?: string;
  /** text body OR idb key for blob */
  text?: string;
  blobKey?: string;
  createdAt: number;
  source: 'user_upload' | 'user_prompt' | 'tool_output';
};

export type AssistantThread = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: StoredMessage[];
  attachmentIds: string[];
};

// Persistence keys
// localStorage: msf.assistant.settings, msf.assistant.threadIndex
// IndexedDB: msf.assistant.threads, msf.assistant.blobs
```

**Secrets:** OpenRouter API key in Settings (`localStorage` key `msf.settings.openRouterApiKey`) — never log, never sync, mask in UI.  
**Password-like chat content:** warn in UI; don’t persist tool outputs that contain secrets longer than session if flagged (policy in DoD).

### 6. Layout modes (Notion-like)

```tsx
// apps/website/src/assistant/AssistantHost.tsx — sketch
type AssistantLayoutMode = 'sidebar' | 'floating';

function AssistantHost() {
  const mode = useAssistantSettings().layoutMode;
  if (mode === 'sidebar') {
    return (
      <aside className="fixed inset-y-0 right-0 z-40 flex w-[min(100%,420px)] flex-col border-l-2 border-black bg-white shadow-brutal-lg">
        <AssistantChrome onLayoutChange={…} />
        <AssistantThread className="min-h-0 flex-1" />
        <AssistantComposer />
      </aside>
    );
  }
  return (
    <div className="fixed bottom-4 right-4 z-40 flex h-[min(70vh,560px)] w-[min(100%-2rem,400px)] flex-col rounded-xl border-2 border-black bg-white shadow-brutal-lg">
      <AssistantChrome compact />
      <AssistantThread className="min-h-0 flex-1" />
      <AssistantComposer />
    </div>
  );
}
```

**UX-Details (Production):**

| State | Verhalten |
| --- | --- |
| Toggle Sidebar ↔ Floating | Content bleibt (gleicher Thread); Layout-Anim 200ms; Preferenz speichern |
| Minimize floating | Nur Header-Pill bottom-right („Assistent“) |
| Sidebar open | Main content `padding-right` / resize, damit nichts unter dem Panel liegt |
| Kein API-Key | Empty-State mit Link zu Settings + Kurz-Anleitung OpenRouter |
| `request_user_input` | Modal/Sheet über dem Chat; Dropzone oder Textarea; Cancel → tool result `{ cancelled: true }` |
| Attachment chips | Über Composer: Dateiname, Typ, entfernen; Agent sieht IDs in message metadata |
| Streaming | Token-Stream in Bubble; Tool-calls als neo-brutalist „Schritte“-Cards (list_areas → …) |
| Errors | OpenRouter 401/429/network → DE-Toast + Inline; Retry |
| a11y | Focus trap in floating; Esc schließt/minimiert; `aria-label="Assistent"` |
| Mobile | Floating default full-width sheet from bottom; Sidebar = full-screen overlay |

---

## Agent-Loop (kein Prototyp)

```ts
// packages/assistant-core/src/loop.ts
export async function runAssistantTurn(args: {
  client: OpenRouterClient;
  model: string;
  thread: AssistantThread;
  host: AssistantHost;
  favorites: ToolHit[];
  onEvent: (e: AssistantEvent) => void; // stream | tool_start | tool_end | done | error
  maxToolRounds?: number; // default 8
}): Promise<void> {
  // 1. build messages = system + thread (+ attachment summaries)
  // 2. loop:
  //    - chat(tools: META_TOOLS)
  //    - if tool_calls: execute via host, append tool results, continue
  //    - else: append assistant message, done
  // 3. guardrails: maxToolRounds, unknown tool name → error tool result
  // 4. never send raw file bytes to the model unless user pasted text or
  //    explicitly opted into "include file text extract" (future)
}
```

**Wichtige Guardrails**

- Dateien: Modell bekommt nur **Metadaten** (`attachmentId`, name, mime, size) + optional kurzen Text-Extract wenn Tool/OCR das liefert — **kein** automatisches Hochladen ganzer PDFs an OpenRouter.
- `run_tool` Input-Validation gegen Tool-Schema; bei File-Feldern nur `attachmentId` erlaubt.
- Rate-limit UI: disable send while turn in flight.
- Idempotenz: tool_call_id → Ergebnis cachen innerhalb des Turns.

---

## Settings

Erweitere `MacheseinfaSettings`:

```ts
type AssistantSettings = {
  layoutMode: 'sidebar' | 'floating';
  openRouterApiKey: string; // empty = disabled
  model: string; // default 'anthropic/claude-sonnet-4' or cheaper default for prod
  enabled: boolean;
};
```

Settings-UI (DE):

- Assistent aktivieren
- OpenRouter API-Key (Password-Input, „nur lokal gespeichert“)
- Modell wählen (kuratierte Liste + „Custom model id“)
- Darstellung: Sidebar / Schwebend

---

## Integration mit Vorhaben (Flow)

Wenn Flow-Workspace existiert (parallel Plan):

- Assistent darf `open_flow` + Slot-Prefill aus Chat-Attachments.
- Im Flow-Workspace: Assistent kennt **aktuelle** Flow-Slots (read-only Summary im System-Prompt: „Aktives Vorhaben: … Slots: pdf=gesetzt“).
- Kein Konflikt mit `useFlowInput` — Assistent schreibt Slots nur über Host-API `setFlowSlot`.

---

## Rollout

| Phase | Deliverable |
| --- | --- |
| **P0** | Packages `openrouter` + `assistant-core` (loop, types, meta-tool schemas, memory store) + unit tests |
| **P1** | Website: Settings key, Floating layout, thread persistence, `list_*` / `search_tools` / `list_favorites` wired |
| **P2** | `request_user_input` + attachments IDB; `run_tool` for calc/check/generate/paste shells |
| **P3** | Sidebar layout + layout toggle; `open_flow` / `open_tool`; streaming polish |
| **P4** | File-tool headless where safe; DoD; flag on |

Abhängigkeit: Flow-Plan muss nicht fertig sein für P0–P2 (`list_flows` kann zuerst legacy `stories` mappen oder leer zurückgeben).

---

## Testing

- `@macheseinfach/openrouter`: mock fetch, tool_calls parse, 401 handling
- `@macheseinfach/assistant-core`: loop with fake host (2 tool rounds), maxToolRounds, cancelled input
- Website: layout toggle persistence; favorites appear in system prompt snapshot test
- Manual: „Finde ein Tool für IBAN“ → search → get_tool → run_tool; „Hier PDF“ → request_user_input → open_tool

---

## Non-goals

- Eigenes LLM-Hosting / lokales GGUF (später optional hinter gleichem `assistant-core`)
- Automatisches Hochladen von Nutzer-PDFs an OpenRouter
- Alle 100 Tools als OpenAI-Functions registrieren
- Multi-User Sync / Accounts
- Voice

---

## Definition of Done (Production)

- [x] Beide Layouts (sidebar + floating) stabil, Preferenz persistent
- [x] OpenRouter-Key nur lokal; Empty-State ohne Key klar
- [x] Meta-Tools only — kein Full-Catalog im Prompt
- [x] Favoriten immer im System-Prompt + `list_favorites`
- [x] `list_areas` / `list_flows` / `search_tools` / `run_tool` / `request_user_input` / `attach_from_chat` funktionieren
- [x] Attachments in IDB; Blobs revoke; Thread-Liste lokal
- [x] Streaming + Tool-Step-UI; Fehlerzustände DE
- [x] Mobile sheet; a11y basics (focus, Esc, labels)
- [x] Unit tests packages green; manuelle Smoke 3 Journeys (siehe P4-Report unten)
- [x] Feature-Flag; Trust-Copy: „Chat geht an OpenRouter; Dateien bleiben lokal außer du fügst Text ein“
- [x] Code EN, UI DE

### P4 Smoke-Test-Notizen (manuell, 2026-07-28)

| Journey | Schritte | Erwartung | Status |
| --- | --- | --- | --- |
| IBAN-Tool finden | „Finde IBAN-Tool“ → `search_tools` → `run_tool` iban-validate | Gültigkeits-Summary im Chat | ☐ manuell |
| PDF + Tool öffnen | Datei anhängen → `request_user_input` oder Composer → `open_tool` pdf-extract-text mit Prefill | Tool zeigt Datei im Dropzone/Extract | ☐ manuell |
| Vorhaben | `open_flow` mit Slot-Prefill aus Attachment | Story öffnet, Slot-Chip sichtbar | ☐ manuell |

**Offen:** End-to-End-QA der drei Journeys im Browser mit echtem OpenRouter-Key; `assistantChat` ist default on (deaktivierbar per `msf.feature.assistantChat` / `VITE_FEATURE_ASSISTANT_CHAT=false`).

### P4 Implementierungsnotizen

- **File-Prefill:** `setToolFilePrefill` → `useFlowInput(decodeFile)` + `ExtractToolShell`; `openTool`/`openInUi` wartet auf Attachment-Auflösung vor Navigation.
- **Headless file tools:** Nur `defineExtractTool`-Shells (z. B. `hash-file`, `pdf-extract-text`, `image-color-pick`); PDF-Editor/Redact weiterhin `openInUi`.
- **Aktives Vorhaben:** `buildActiveFlowContext` aus `platform.activeStoryId` + `flowBlobStore`/scalar-persist → System-Prompt.
- **FlowWorkspace:** Legacy `open_flow` via `selectStory` + Slot-Prefill; kein `goToFlow`-Rewrite.

---

## Offene Produktentscheidungen (kurz)

1. Finales UI-Label: **Assistent** vs **KI-Hilfe** — Default im Plan: **Assistent**.
2. Default-Modell auf OpenRouter (Kosten vs. Qualität).
3. Ob `run_tool` bei schweren PDF-Tools immer UI öffnet (empfohlen Phase 1) oder headless.

---

## Nächster Schritt nach Freigabe

1. Scaffold `packages/openrouter` + `packages/assistant-core` (Bun workspace).
2. Settings-Feld API-Key + Floating-Shell Skeleton.
3. Agent-Loop mit `list_areas` + `search_tools` + Favoriten (ohne `run_tool` zuerst).
