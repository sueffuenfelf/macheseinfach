# Workspace tabs & shell chrome alignment

**Date:** 2026-07-29  
**Status:** removed (2026-07-29)

> Workspace tabs and the main-column top chrome bar were removed. Navigation is route-only via sidenav + CommandPalette (⌘K). Sidenav logo header height (`--ms-shell-chrome-h`) remains.

## Goals

1. Align sidenav logo header border with main top chrome (`--ms-shell-chrome-h`).
2. Remove top-right Suche button (keep sidenav + ⌘K palette).
3. VS Code–style workspace tabs for tools and multi-step flows.
4. Unified `SideNavItem` for all sidenav entries.
5. Remove Assistent from sidenav (FAB/AssistantHost unchanged).

## Architecture

```
App.tsx
  └── TabStoreProvider          # localStorage + route sync
        └── ToolShell
              ├── AppShell
              │     ├── AppSideNav (SideNavItem)
              │     └── TabBar (replaces title bar)
              └── TabWorkspaceCache  # keep visited panes mounted
```

### Tab store (`apps/website/src/shell/tabs/`)

| File | Role |
|------|------|
| `types.ts` | `WorkspaceTab`, `TabGroup`, colors |
| `storage.ts` | `msf.workspaceTabs` persistence |
| `TabStoreContext.tsx` | open/close/pin/group/reorder + route sync |
| `TabBar.tsx` | chrome header, overflow, DnD |
| `TabGroupSection.tsx` | group label, collapse, color |
| `TabItem.tsx` | single tab, ×, pin, middle-click |
| `TabContextMenu.tsx` | pin, group assign, rename group |
| `useTabKeyboard.ts` | ⌘W, Ctrl+Tab, Ctrl+PgUp/Dn |
| `TabWorkspaceCache.tsx` | mount hidden panes per tab snapshot |
| `resolveTabFromRoute.ts` | route → tab meta (title, kind, id) |

### Tab behaviour

- **Open:** navigating to `page === 'tool'` or active flow workspace opens/activates a tab.
- **Id:** tools use pathname; flows use `flow:{areaId}:{storyId}` (path updates when step changes).
- **Pin:** pinned tabs stay left; cannot close via × (unpin first).
- **Groups:** create/rename/color via context menu; collapse hides member tabs; DnD reorders `tabOrder`.
- **Close active:** activate next tab in order, else previous, else `homePath()`.
- **Persist:** tabs, groups, order, pins, collapsed flags → `localStorage`.
- **Empty tabs:** TabBar shows current page title (home, settings, …).
- **State:** `TabWorkspaceCache` renders each tab's `RouteSnapshot` once; hidden panes stay mounted.

### Chrome height

Shared token in `index.css`:

```css
--ms-shell-chrome-h: 2.75rem; /* 44px — matches previous h-11 */
```

Both sidenav logo row and main `TabBar` use `h-[var(--ms-shell-chrome-h)]`.

### Keyboard (no browser fights)

| Shortcut | Action |
|----------|--------|
| ⌘/Ctrl+W | Close active tab (if not pinned) |
| Ctrl+Tab | Next tab |
| Ctrl+Shift+Tab | Previous tab |
| Ctrl+PageDown / Ctrl+PageUp | Next / previous tab |

⌘K palette unchanged (`PlatformContext`).

## Files changed

- `apps/website/src/shell/AppShell.tsx` — TabBar, remove search, chrome height
- `apps/website/src/shell/AppSideNav.tsx` — SideNavItem, remove Assistent
- `apps/website/src/shell/SideNavItem.tsx` — new shared nav row
- `apps/website/src/shell/ToolShell.tsx` — TabWorkspaceCache
- `apps/website/src/shell/tabs/*` — new module
- `apps/website/src/index.css` — chrome token + tab bar styles
- `apps/website/src/App.tsx` — TabStoreProvider

## Verification

- `bun run build` (website)
- Browser: home, tool with 2+ tabs, sidenav alignment, header border alignment
