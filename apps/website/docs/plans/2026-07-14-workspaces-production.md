---
name: workspaces-production
date: 2026-07-14
owner: codex
target: apps/website
status: ready
---

# Production Workspaces + Dashboard (Replacement Plan)

## Context & goal

The current workspace/dashboard implementation is an MVP scaffold: it mixes home/workspace behavior, has limited widget coverage, and lacks robust lifecycle/persistence guarantees. This change replaces it with a product-grade workspace experience: clear navigation boundaries, robust local persistence and migration, full dashboard builder interactions, and rich widget coverage aligned to real tools.

## Non-goals

- Backend persistence or user accounts
- Multi-device sync
- Rewriting existing standalone tool pages
- Introducing a new design system beyond existing `.ms-*` visual language

## Example architecture

```text
apps/website/src/
  routing/
    paths.ts                         # `/arbeitsbereich/:slug` parsing + helpers
  shell/
    ToolShell.tsx                    # shell orchestration and palette mode split
    GlobalActionPalette.tsx          # global actions only (non-tool)
    WorkspaceDashboard.tsx           # dashboard grid + add-widget flow
    widgets/
      registry.ts                    # widget registration API
      types.ts                       # widget metadata + sizing constraints
      builtin.tsx                    # compact widget set mapped to tools
    workspaces/
      model.ts                       # v2 persisted schema + migration + CRUD helpers
  docs/
    WORKSPACES.md                    # architecture and user interaction contract
```

### Information architecture

- **Home (`/`)**: catalog/situational navigation only.
- **Workspace (`/arbeitsbereich/:slug`)**: tabbed workspace context with dashboard + per-workspace tool search.
- **Tool page (`/bereich/...` and `/tool/...`)**: deep tool execution.
- **Global actions (`Cmd+K` outside workspace)**: workspace/system actions only; no tool catalog results.
- **Workspace search (`Cmd+K` inside workspace)**: scoped tool search based on workspace tool-set and pinned widgets.

### Workspace lifecycle

- Persistent model includes: `id`, `slug`, `name`, `isDefault`, `createdAt`, `updatedAt`, `toolIds`, `widgetIds`.
- Operations: create, rename, duplicate, delete (guarding last workspace), reorder tabs, set default.
- Deleting active workspace routes to fallback default.
- Duplicate creates unique slug and cloned layout/widget/tool set.

### Dashboard UX

- Use `react-grid-layout` responsive mode (`Responsive + WidthProvider`) for drag + resize.
- Widget constraints enforced by definition (`minW/maxW/minH/maxH/defaultW/defaultH`).
- Add-widget flow via searchable modal/picker:
  - filter by title/tags/tool
  - preview metadata
  - add with auto-placement + toast feedback
- Empty state includes onboarding CTA + suggested widgets.
- Widget chrome provides title, drag handle, remove, open full tool.

### Widget system

- Registry remains centralized; each widget definition carries:
  - sizing constraints
  - tool mapping (`toolId`)
  - display metadata (`title`, `description`, `tags`)
  - component renderer
- Builtins include compact widgets for all feasible current tools:
  - IBAN, GiroCode, Leak-Check, Passwort-Generator, QR helper
  - File-heavy tools (PDF compress/redact/merge/sign, HEIC, OCR, EPC) as compact launch/status widgets with direct deep-open into full tool flow

### Search/palette split

- **Global palette**: switch workspace, create workspace, duplicate, rename, delete, set default, open settings/favorites/home.
- **Workspace palette**: tool search and slash commands, restricted to workspace tool set.

### Persistence and migration

- Introduce versioned storage container key (v2) for workspace + layout state.
- One-time migration from MVP keys:
  - `msf.workspaces.v1`
  - `msf.workspace-layouts.v1`
- Migration maps old `id` to new slug-safe route, preserves widget/layout assignments where valid, and seeds missing metadata.
- Invalid/corrupt localStorage falls back to deterministic default workspace state.

### Routing

- Canonical workspace route: `/arbeitsbereich/:slug`.
- Route parser resolves workspace slug in platform state.
- Workspace navigation and global actions always emit slug routes.

### Responsive/mobile behavior

- Dashboard uses breakpoints (`lg/md/sm/xs/xxs`) and per-breakpoint layout persistence.
- On mobile:
  - tabs are horizontally scrollable with clear active state
  - widget picker is full-width modal sheet
  - grid columns reduce progressively

### Accessibility + keyboard

- All interactive controls have explicit labels and focus-visible affordances.
- `Cmd/Ctrl+K` remains primary palette shortcut.
- Widget picker supports keyboard search and escape close.
- Drag/resize affordances remain pointer-first; fallback actions (remove/open) stay keyboard accessible.

### Animation/micro-interactions

- Keep neo-brutalist style and `.ms-*` tokens.
- Apply purposeful transitions:
  - tab activation slide/fade
  - widget add/remove toast confirmation
  - picker open pop animation
  - subtle drag/resize states via existing brutal shadows and borders
- Respect reduced-motion media query in existing CSS.

## Environment variables

None.

## Tests & verification

- `bun run --filter @macheseinfach/website build`
- Manual sanity:
  - create/rename/duplicate/delete/set-default workspace
  - reorder tabs
  - add/remove widgets
  - drag/resize widgets and refresh persistence
  - Cmd+K behavior split (workspace vs non-workspace)

## Migration / data concerns

- Existing users with MVP keys are migrated on first load.
- Unknown widgets/layout entries are discarded safely.
- Slug collisions resolved by numeric suffixing.

## Rollback

- Revert workspace-related shell/routing files and docs to previous commit.
- Existing v1 keys remain untouched; rollback can continue reading MVP keys.

## Open questions

- None. All required interactions are specified and can be implemented within existing shell architecture.
