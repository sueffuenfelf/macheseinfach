# Workspace widget authoring

Dashboard widgets are **resizable grid tiles** inside a workspace — not full tool pages. Design for the smallest allowed size first, then enhance at wider sizes.

User-facing copy is **German**; this guide is English per repo convention.

## Purpose

Widgets expose a compact slice of a tool (quick check, mini generator, launcher). They live in `react-grid-layout` on the workspace dashboard (`WorkspaceDashboard.tsx`). Chrome owns the title bar when `embedded` is true — do not duplicate headers inside the widget body.

## Grid constraints

Each widget declares size bounds in `builtin.tsx` (or via `registerToolWidget`):

| Field | Meaning |
| --- | --- |
| `defaultW` / `defaultH` | Size when first placed or added from staging |
| `minW` / `minH` | Smallest resize — **design must work here** |
| `maxW` / `maxH` | Largest resize |

`applyWidgetBounds` in `src/shell/workspaces/model.ts` copies registry bounds onto every layout item and normalizes `useSharedInput`. Row height is **48 px** with **12 px** margins between rows (`WorkspaceDashboard` grid config — `gridConfig.rowHeight` / `gridConfig.margin`).

**Tile pixel math:** grid item height = `rowHeight × h + margin × (h − 1)`. Example `minH: 2` → `48×2 + 12×1` = **108 px** outer tile. Subtract the dashboard title bar (~36 px) and embedded body padding — roughly **55–70 px** for interactive content at minimum height. Scale expectations with `h`; never assume viewport width alone defines the tile.

## Tile-filling layout

Each placed widget occupies **exactly one grid cell** (or `w × h` cells when resized). The visual “card” is the grid item; the **embedded body** (below the dashboard title bar) must fill that cell and breathe — not cram controls with fixed tiny padding.

### Dashboard chrome vs widget body

- **Outside the widget:** `WorkspaceDashboard` renders the title bar (drag handle, shared-input badge, remove). Pass `embedded` so `WidgetCard` skips an inner header.
- **Inside the widget:** the `embedded` content area is the tile. Root must be `h-full w-full box-border` and participate in the dashboard’s flex column (`flex-1 min-h-0` on the body wrapper).

### Fill the cell

```css
.widget-tile {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  container-type: inline-size;
}
```

- Widget root: `height: 100%`, `min-height: 0`, `width: 100%`.
- Main content row/column: `flex: 1`, `min-height: 0`.
- Preview/output panels: `flex: 1`, `min-height: 0`, `overflow: hidden` — grow into remaining tile space; avoid fixed `min-h-[88px]` unless unavoidable.
- Images: `object-fit: contain`, `max-width/height: 100%`.

### Padding and gap scale with the tile

Do **not** use the same `p-3` / `gap-1` at every size. Prefer **relative** spacing:

```css
padding: clamp(0.35rem, 2.5cqi, 0.75rem);
gap: clamp(0.35rem, 2cqi, 0.65rem);
```

Increase gap at wider inline sizes via `@container (min-width: …)` so controls separate proportionally — wider tiles get more air, narrow tiles stay compact. Avoid negative margins to “undo” parent padding.

### One cell = one card

Internal layout should read as a single cohesive card filling the grid slot (+ consistent margin from grid `margin: [12, 12]`). Gaps between controls, preview, and output should grow slightly when the container widens — never stack everything with `gap-1` at all breakpoints.

Reference implementations: `.widget-tile` (shared shell), `.widget-password`, `.widget-qr`, `.widget-iban` in `src/index.css`.

```ts
// Example: compact widget (password, QR mini)
minW: 4, maxW: 8, minH: 2, maxH: 4, defaultW: 4, defaultH: 2
```

## Container queries (required)

Use CSS container queries so internal layout adapts to tile width, not viewport breakpoints.

1. Set on widget root:

```css
.widget-example {
  container-type: inline-size;
  container-name: example;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
```

2. Default = **narrow** (stacked). Enhance at wider inline sizes:

```css
@container example (min-width: 280px) {
  .widget-example__main {
    flex-direction: row;
  }
}
```

**Rule:** narrow layout first, side-by-side at ≥ ~280 px container width. Spacing must follow [Tile-filling layout](#tile-filling-layout) — container queries drive layout **and** padding/gap tiers.

## Progressive shrink strategy

When a tile gets narrower, degrade in **tiers** — trim declarative text before changing grid structure.

| Tier | What yields | Examples |
| --- | --- | --- |
| **1** | Decorative / descriptive text | Field labels (`Länge`), verbose button copy (`QR erzeugen` → `QR`), hints |
| **2** | Secondary chrome | Empty-state placeholders, optional metadata, badges |
| **3** | Layout switch | Stacked ↔ side-by-side via `@container (min-width: …)` |
| **4** | Tertiary UI | Optional actions, copy icons, non-essential affordances |

**Order matters:** Tier 1 breakpoints must sit **outside** (wider than) the Tier 3 layout breakpoint so text disappears while the current layout still holds, then the layout switches only if needed.

```css
/* Tier 1 — hide decorative label below 320px (still side-by-side 280–319px) */
@container password (max-width: 319px) {
  .widget-password__label--decorative { display: none; }
}

/* Tier 3 — layout switch at 280px */
@container password (min-width: 280px) {
  .widget-password__main { flex-direction: row; }
}
```

**Markup conventions**

- Mark trimmable copy: `widget-*__label--decorative`, `widget-*__generate-label--full` / `--short`.
- Keep full meaning in `aria-label` on the control; hide short variants with `aria-hidden`.
- Functional text (stepper values, mono output) stays visible longest.
- Design at **minW × minH** first; add `@container (min-width: …)` enhancements — never the reverse.

Reference: `.widget-password` and `.widget-qr` in `src/index.css`.

## Layout patterns

| Pattern | Narrow | Wide (≥ 280 px) |
| --- | --- | --- |
| Input + output | Stacked rows | Controls left, preview/output right |
| Generator | Stepper + action row, result below | Controls column, result fills height |
| Launcher | Title/description + button | Same; avoid tall hero blocks |

Avoid range sliders — they waste height and are hard to hit in small tiles. Prefer **steppers**, compact buttons, or inline rows.

Use `flex: 1; min-height: 0; overflow: hidden` on preview/output areas. Scale images with `object-fit: contain`, not fixed `min-h-[88px]`. Wrap embedded content in `.widget-tile` (see Tile-filling layout).

## Shared input

Widgets that consume text should set `supportsSharedInput: true` in the registry. Per layout item, `useSharedInput` defaults **on** when supported (`resolveUseSharedInput` in `model.ts`).

```tsx
function MyWidget({ sharedInput = '', useSharedInput = false }: WidgetComponentProps) {
  const linked = useSharedInput && sharedInput.trim().length > 0;
  const effective = linked ? sharedInput : localValue;
  // When linked: hide local input, auto-run on sharedInput changes
}
```

Workspace-wide input lives in the dashboard toolbar; linked widgets show a "Gemeinsame Eingabe" badge in the tile header. Toggle via the per-widget settings gear (see [Per-widget settings](#per-widget-settings-gear)).

## Embedded mode & drag handles

- Pass `embedded` from the dashboard — use `WidgetCard` with `embedded` to skip inner title chrome.
- Add `widget-no-drag` on interactive controls (inputs, buttons) so grid drag does not steal pointer events. The dashboard cancels drag on `.widget-no-drag` via `dragConfig.cancel`.
- In layout edit mode, the dashboard disables the widget fieldset — no special handling needed inside the widget.

## Per-widget settings (gear)

Every dashboard tile header shows a **gear icon** (always visible — locked and edit mode). Click opens a neo-brutalist settings popover anchored to the gear; closes on outside click or Escape.

- **Password widget:** length stepper + character-type checkboxes (Großbuchstaben, Kleinbuchstaben, Zahlen, Sonderzeichen). Options persist per layout item as `passwordOptions` in `WorkspaceLayoutItem`.
- **Shared-input widgets (IBAN, QR):** „Gemeinsame Eingabe" toggle lives here — not in edit-mode chrome. Linked widgets show a subtle badge in the header.
- **Other widgets:** empty/minimal state until widget-specific settings exist.

Options that do not fit at minimum tile size stay in the popover only. When the container is tall enough (`@container password (min-height: 100px)`, roughly `h ≥ 3`), password char-type checkboxes also appear inline in the widget body. At default `h=2`, only length + output are inline; char types are settings-only.

Reference: `WidgetSettingsPopover.tsx`, `setWidgetPasswordOptions` / `setWidgetUseSharedInput` in `model.ts`.

## Checklist before shipping

- [ ] Fills tile at **minW × minH** — body uses `h-full`, output/preview grows with `flex: 1`; padding/gap scale (no cramped fixed `gap-1` everywhere)
- [ ] Works at **minW × minH** without clipping or scroll overflow
- [ ] Progressive shrink: decorative text hides before layout breakpoint (see above)
- [ ] Works at **defaultW × defaultH**
- [ ] Reasonable at **maxW** (and maxH if content grows)
- [ ] Layout edit mode (disabled, dimmed) vs locked mode (interactive)
- [ ] Shared input **on** (linked + unlinked) and **off** (local input only)
- [ ] German labels, placeholders, and aria text
- [ ] Neo-brutalist tokens: `.ms-input`, `.ms-btn`, `border-2 border-black`, `var(--color-chip)`

## File locations

| File | Role |
| --- | --- |
| `src/shell/widgets/builtin.tsx` | Widget components + registry entries |
| `src/shell/widgets/types.ts` | `ToolWidgetDef`, `WidgetComponentProps` |
| `src/shell/widgets/WidgetSettingsPopover.tsx` | Gear trigger + settings popover |
| `src/shell/widgets/registry.ts` | Registration helpers |
| `src/shell/workspaces/model.ts` | Layout state, `applyWidgetBounds`, shared input |
| `src/shell/WorkspaceDashboard.tsx` | Grid render, embedded props, edit mode |
| `src/index.css` | Widget-specific CSS (`.widget-*` classes) |

## Adding a new widget

1. Implement component in `builtin.tsx` (or separate file imported there).
2. Add `ToolWidgetDef` with realistic min/default/max sizes.
3. Add `.widget-<name>` styles with container queries in `index.css`.
4. Test in the dashboard at min, default, and max sizes.
5. If text-driven, enable `supportsSharedInput` and handle the `linked` state.
