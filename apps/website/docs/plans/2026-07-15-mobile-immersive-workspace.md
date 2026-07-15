# Plan: Mobile pass + immersive workspace fullscreen

## Context

- Scope is `apps/website` in `projects/macheseinfach`.
- Priority fix is immersive fullscreen so workspace users cannot navigate away while fullscreen is active.
- Secondary pass is mobile optimization for shell pages, overlays, workspace controls, and compact widgets.

## Goals

1. Fullscreen mode hides non-workspace shell chrome and keeps only workspace content plus an exit control.
2. Mobile layout remains usable at narrow viewport widths (~375px) without horizontal overflow.
3. Desktop layouts remain stable.
4. Build succeeds (`pnpm build` in `apps/website`).

## Implementation approach

### 1) Immersive fullscreen architecture

- Lift fullscreen state to `ToolShell`.
- Add a dedicated immersive class on `body` while workspace fullscreen is active.
- Hide shell chrome in immersive mode (`header`, `footer`, and workspace tab strip).
- Keep an internal fullscreen top bar inside `WorkspaceDashboard` with title + exit button.
- Exit immersive fullscreen on:
  - explicit exit button,
  - `Escape` / native fullscreen exit,
  - workspace switch / route change away from workspace.

### 2) Mobile shell optimization

- Refactor `ToolShell` header actions into mobile-friendly stacked/wrapping layout.
- Ensure workspace tab strip and workspace management controls remain accessible on small screens.
- Update modal/palette wrappers to use viewport-safe height and full-width behavior on mobile.
- Tighten large heading scales and card paddings on small screens for `AreaStep`, `StoryPickStep`, `ToolPickForStory`, `ToolWorkspace`, `FavoritesPage`, `SettingsPage`.

### 3) Workspace + widget mobile pass

- Add shell-level media queries in `index.css` for workspace controls and overlays.
- Improve staging chips and control rows for touch targets and wrapping.
- Normalize key widget controls to avoid clipping at narrow widths (input sizes, preview areas, button heights).
- Keep widgets using container queries for internal adaptation; avoid viewport-only widget logic.

## Verification

- `pnpm build` from `apps/website`.
- Manual visual sanity in code-level review:
  - immersive mode hides shell chrome,
  - exit path works by button + ESC + workspace switch,
  - mobile classes avoid horizontal overflow in shell pages, overlays, and workspace controls.
