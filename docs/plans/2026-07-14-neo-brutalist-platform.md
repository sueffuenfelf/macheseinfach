# Plan — macheseinfa.ch Neo-Brutalist Platform (5-year mature)

**Date:** 2026-07-14
**Scope:** `apps/website` full visual + feature rebuild based on `Macheseinfa.ch Plattform.zip` design.

## Goal

Rebuild the website visual layer into a bold **neo-brutalist** design system and expand it into the mature platform it would be after years of iteration — real tool interactions, full state coverage, micro-animations, and a richer feature set. Navigation flow (Bereich → Situation → Tool) stays; the look changes completely.

## Design language (from reference)

- **Fonts:** Space Grotesk (display/headings, UI labels) + Hanken Grotesk (body). Loaded via Google Fonts in `index.html`.
- **Borders:** `2px solid #000` everywhere; `border-radius` 8–18px.
- **Shadows:** hard offset, no blur — `4px 4px 0 #000` (cards `6px 6px 0 #000`). Hover: translate(-2px,-2px) + shadow grows to `6px/8px`.
- **Background:** warm off-white `#fdfcf9`. Surfaces white `#fff`.
- **Selection:** `#ff90e8`.
- **Area accent colors:** Buchhaltung `#ff90e8`, Behörden `#ffc900`, Dokumente `#90a8ed`, Security `#23c9a0`, SEO `#c3aef0`.
- **Trust badge:** green `#c6f2a8` with lock icon, "Lokal · kein Konto".
- **Focus:** inputs get `box-shadow: 4px 4px 0 #000; transform: translate(-1px,-1px)`.

## Token layer (theme.css `@theme`)

Tailwind v4 `@theme` tokens so utilities like `border-2 border-ink`, `shadow-brutal`, `bg-area-buchhaltung`, `font-display` work.

- `--font-display: "Space Grotesk"`, `--font-sans: "Hanken Grotesk"`
- `--color-canvas: #fdfcf9`, `--color-ink: #000`, `--color-ink-muted`, `--color-surface: #fff`
- `--color-area-{buchhaltung,behoerden,dokumente,security,seo}`
- `--shadow-brutal: 4px 4px 0 #000`, `--shadow-brutal-lg: 6px 6px 0 #000`
- Radii, success/danger/warn tokens.

## Architecture

- `App.tsx` → `PlatformProvider` + `ToolShell` (unchanged wiring).
- `PlatformContext` — extend with: `recentTools` (localStorage), `toggleFavorite`, `favorites`, `variant` (situation view), `setQuery`, `goToSituation`. Keep existing nav API.
- `data/catalog` — keep model; extend `AreaDefinition` with `accent` color + `icon` (inline SVG path data string); add more mature tool metadata (e.g. `category`, `maturity: 'stable'|'beta'|'planned'`).
- `shell/` — rebuilt:
  - `ToolShell` — sticky header (logo `m` box, "Tools finden" ⌘K button, trust badge), breadcrumb pills `Bereich › Situation › Tool`, footer.
  - `AreaStep` — 2-col grid of brutalist area cards (icon, name, blurb, tool-count badge, arrow), planned badge for SEO, hover lift.
  - `StoryPickStep` — variant switcher (Sätze / Suche / Kacheln); three render modes; search has chips + filtered list + empty state.
  - `ToolContextBar` — back link, tool icon+title, sub, trust badge; "Datei im Fokus" bar for dokumente tools.
  - `ToolWorkspace` (replaces ScenarioWorkspace) — routes to per-tool components.
  - `CommandPalette` — brutalist modal, search input, results with tags, quick commands.
- `shell/tools/` — one component per tool with real-ish logic + states:
  - `GiroCodeTool`, `IbanCheckTool`, `PdfCompressTool`, `PdfRedactTool`, `HeicTool`, `LeakCheckTool`, `PdfMergeTool`, `PdfSignTool`, `OcrTool`, `EpcReadTool`, `PlannedTool`.
- `shell/components/` — shared primitives: `BrutalButton`, `BrutalInput`, `BrutalCard`, `Dropzone`, `Badge`, `Icon` (inline SVGs), `Toast`.

## Real-ish tool logic (client-side, no server)

- **IBAN validate:** real IBAN mod-97 checksum + BLZ→bank lookup (small embedded DE bank table subset). States: idle → checking → valid/invalid with bank/bic/country.
- **GiroCode:** build EPC-QR payload from form; render QR via a tiny inline QR generator (lightweight, no deps — or canvas-based placeholder that looks real). Download PNG.
- **PDF compress / HEIC / merge / sign / OCR / redact:** mock pipeline with realistic states (idle → processing with progress → done with result + download). No real bytes processing in v1 of this rebuild, but believable UX.
- **Leak check:** mock HIBP-style result (deterministic from input hash prefix) — never sends full input; show "found in N leaks" list or "clean".
- **EPC read / generic:** file list with drag-to-reorder, detect/extract mock.

## States & animations

- Every tool: `idle | working | success | error`.
- Working state: animated progress (brutalist striped bar, CSS keyframes).
- Card hover: translate + shadow grow (CSS transition `.1s`).
- Input focus: translate + brutal shadow.
- Breadcrumb active step: yellow fill.
- Modal: fade + slight scale; backdrop blur-lite.
- `prefers-reduced-motion`: disable transforms/animations.
- Toast on copy/download success.

## 5-year feature set (mature platform)

- Recently used tools (localStorage, shown on home under area grid).
- Favorites (star on tool header; persisted).
- Situation view variants persisted per area.
- Command palette with keyboard nav (↑↓ Enter Esc).
- "Datei im Fokus" — a sticky selected file reused across dokumente tools.
- Trust/datalocal badges consistently.
- Footer: privacy + open-source links.
- Empty + error + no-results states everywhere.
- Accessibility: focus-visible, aria-labels, keyboard reachable.

## Validation

- `bun run build` green.
- `bun test` (catalog validate) green.
- Browser walkthrough: home → each area → each situation variant → each tool → states. No console errors, no broken nav, no runtime crashes.
- `prefers-reduced-motion` respected.

## Out of scope (this pass)

- Real PDF/HEIC/OCR byte processing (mock pipelines only).
- Backend / accounts / persistence beyond localStorage.
- SEO real routes (planned state only).
- Removing all dead code (cockpits/, domains/) — leave untouched, not wired.

## Delegation

- Phase A (subagent): shell rebuild + command palette.
- Phase B (subagent): tool workspaces + shared primitives.
- Validation: direct browser MCP + `kounds-verify` for tests.
