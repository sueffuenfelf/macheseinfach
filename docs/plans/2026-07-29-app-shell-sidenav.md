# Plan — App shell with persistent sidenav

**Date:** 2026-07-29  
**Scope:** `apps/website` layout chrome — Notion/Slack-style app shell

## Goal

Replace the marketing-style header + footer with a fixed-viewport app shell: persistent left sidenav (desktop), scrollable main pane, thin top bar. All routes render inside the main content container.

## Non-goals

- Catalog/story expansion (other agent)
- List badge/highlight tweaks (other agent)
- Route path changes

## Architecture

```
App (dvh flex column, overflow hidden)
└── ToolShell
    ├── AppShell (h-dvh flex row)
    │   ├── AppSideNav (240px desktop / drawer mobile)
    │   └── Main column (flex-1 min-h-0 flex col)
    │       ├── AppTopBar (mobile menu, page title, ⌘K)
    │       └── main.ms-app-main (flex-1 min-h-0 overflow-auto|hidden)
    │           └── route page content
    ├── CommandPalette (portal, unchanged)
    └── AssistantHost (portal FAB/panel, unchanged)
```

- **Viewport chain:** `html/body/#root` → `h-dvh overflow-hidden` → shell `flex min-h-0` → main `flex-1 min-h-0 overflow-auto`.
- **Flow/tool pages:** main uses `overflow-hidden`; child workspaces manage internal scroll.
- **Assistant sidebar inset:** `html[data-assistant-sidebar=open] .ms-app-main` padding-right (replaces `.ms-shell-main`).

## Sidenav items

| Item | Route | Notes |
|------|-------|-------|
| Logo / Start | `/` | compact wordmark |
| Suche | palette ⌘K | button, not navigate |
| Favoriten | `/favoriten` | badge if count > 0 |
| Bereiche | collapsible list | `areaOrder`, active highlight |
| Einstellungen | `/einstellungen` | footer section |
| Assistent | — | opens panel when feature flag on |

Footer links (Datenschutz, Quelltext, Impressum) move to sidenav bottom — no dominant page footer.

## Page restyle

- Shared `PageContainer` + `PageHeader` — dense typography (h1 ~22–24px), consistent `px-5 py-5` padding.
- Remove redundant `BackButton` on top-level nav pages (home, suche, favoriten, einstellungen).
- Keep subtle back on drill-down (bereich → story → tool).
- `AreaStep`: compact grid, smaller cards, inline search retained.

## Mobile

- Sidenav hidden; `AppTopBar` shows hamburger + title + search icon.
- Drawer: left slide-over + backdrop; closes on nav selection / Escape / backdrop tap.
- Assistant FAB unchanged (bottom-right, safe-area).

## Files

| Action | Path |
|--------|------|
| add | `shell/AppShell.tsx` |
| add | `shell/AppSideNav.tsx` |
| add | `shell/PageContainer.tsx` |
| edit | `shell/ToolShell.tsx` |
| edit | `shell/AreaStep.tsx`, `AreaToolsStep.tsx`, `SearchPage.tsx`, `FavoritesPage.tsx`, `SettingsPage.tsx`, `ToolWorkspace.tsx`, `ConversionVariantHub.tsx` |
| edit | `index.css` |

## Verification

- `bun test` / manual browse: `/`, `/bereich/bilder`, `/suche`, `/favoriten`, `/einstellungen`, one tool URL
- Screenshots via browser MCP
- Assistant panel + sidebar mode still inset main content
