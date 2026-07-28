# Implementation status — Vorhaben + KI-Chat (2026-07-28)

Cross-plan snapshot after P4 code/verify pass. **Both feature flags default ON.**

---

## Summary

| Plan | Code phases | Flag | Default |
| --- | --- | --- | --- |
| [Vorhaben Multi-Tool](2026-07-28-vorhaben-multi-tool.md) | P0–P4 code | `flowWorkspace` / `msf.flowWorkspace` | **ON** |
| [KI-Chat OpenRouter](2026-07-28-ki-chat-openrouter.md) | P0–P4 code | `assistantChat` / `msf.feature.assistantChat` | **ON** |

**Verify (2026-07-28):** `bun test` — 436 pass, 7 skip, 0 fail. `bun run build` (website) — green.

---

## How to disable flags (debugging)

### Vorhaben (`flowWorkspace`)

1. In browser console:
   ```js
   localStorage.setItem('msf.flowWorkspace', '0');
   location.reload();
   ```
2. Or build-time: `VITE_FLOW_WORKSPACE=false`

### Assistent (`assistantChat`)

1. In browser console:
   ```js
   localStorage.setItem('msf.feature.assistantChat', 'false');
   location.reload();
   ```
2. Or build-time: `VITE_FEATURE_ASSISTANT_CHAT=false`

## How to enable flags (local QA)

Features are on by default. Use the overrides above only to turn them off, or to force on after disabling:

### Vorhaben (`flowWorkspace`)

```js
localStorage.setItem('msf.flowWorkspace', '1');
location.reload();
```

Or build-time: `VITE_FLOW_WORKSPACE=true`

### Assistent (`assistantChat`)

```js
localStorage.setItem('msf.feature.assistantChat', 'true');
location.reload();
```

Or build-time: `VITE_FEATURE_ASSISTANT_CHAT=true`

Settings → Assistent aktivieren + OpenRouter API-Key (lokal, nie ins Repo) still required for API calls.

---

## Vorhaben — what's done

- `FlowDefinition`, slot kinds, validate rules, `useFlowInput` no-reask contract
- All shell factories + FilePipeline/Editor adapted; bespoke pilots (pdf-redact, girocode, iban, image pipeline)
- `FlowWorkspace` split UI (desktop rail + mobile sheet), ContextBar, Continue footer, leave confirm
- **3 P3 pilots** authored with slots + bindings:
  - `story-vermieter-nachweis` — PDF + optional image (wohnen / behörden / bilder)
  - `story-freelancer-zahlung` — IBAN + currency (buchhaltung)
  - `story-portal-foto` — image pipeline (bilder)
- Search UI type label „Vorhaben“; story docs include `Vorhaben` keyword; SEO search page copy fixed
- Unit/component tests: shell contract, workspace policy, P3 pilot gate test

## Vorhaben — smoke URLs (flag ON)

Base: `http://localhost:5173` (default Vite port)

| Pilot | Entry URL | First step tool |
| --- | --- | --- |
| Vermieter-Nachweis | `/bereich/wohnen/vermieter-nachweis` | landlord-docs-checklist |
| Freelancer-Zahlung | `/bereich/buchhaltung/freelancer-zahlung` | iban-validate |
| Portal-Foto | `/bereich/bilder/portal-foto` | image-convert |

**Quick check:** Fill slot in ContextBar → step 1 shows „Aus Vorhaben“ chip, no duplicate primary input → switch rail step → values persist → optional recommended opens in pane (side-quest).

---

## KI-Chat — what's done

- Packages: `@macheseinfach/openrouter`, `@macheseinfach/assistant-core` (loop, meta-tools, tests)
- Website: `AssistantHost` sidebar + floating, thread IDB persistence, attachments, settings
- Meta-tools wired: `list_areas`, `list_flows`, `get_flow`, `search_tools`, `get_tool`, `list_favorites`, `run_tool`, `request_user_input`, `attach_from_chat`, `open_flow`
- Headless `run_tool` for safe extract shells; file tools open UI with prefill
- Active Vorhaben summary in system prompt when flow context active
- Feature-flagged in `ToolShell`; settings page exposes assistant options when flag on

## KI-Chat — smoke (flag ON + API key)

1. **IBAN finden:** „Finde ein Tool für IBAN“ → `search_tools` → `run_tool` iban-validate
2. **PDF + Tool:** Attach PDF in composer → `open_tool` pdf-extract-text (prefill)
3. **Vorhaben:** `open_flow` with attachment prefill → story opens, slot chip visible (needs `flowWorkspace` on for full workspace UX)

Settings: `/einstellungen`

---

## Remaining manual QA

### Vorhaben

- [ ] E2E: `freelancer-zahlung` — set IBAN + amount in ContextBar → iban-validate + amount-in-words without re-ask → recommended vat-calculator opens in pane
- [ ] E2E: `vermieter-nachweis` — PDF slot → checklist → redact → optional EXIF step
- [ ] E2E: `portal-foto` — single photo through convert → resize → exif-strip
- [ ] Mobile: bottom sheet rail, context bar sticky, no broken layout
- [ ] Leave confirm when slots filled; password never persisted
- [ ] a11y: rail keyboard, focus after tool switch

### Assistent

- [ ] Three P4 journeys with real OpenRouter key (see KI-Chat plan table)
- [ ] Layout toggle sidebar ↔ floating persists
- [ ] Empty state without API key
- [ ] `request_user_input` modal cancel → `{ cancelled: true }`
- [ ] Mobile floating full-width sheet

### Cross-plan

- [ ] Assistent `open_flow` + Vorhaben workspace together (both flags on)
- [ ] No console errors on pilot URLs

---

## Explicitly not done (by design)

- Mass authoring of further Vorhaben (4–7 in plan examples)
- IDB blob survive refresh for file slots (memory + refresh warn only)
- `flows.ts` rename / `story-*` → `flow-*` ID migration (P1 optional)
