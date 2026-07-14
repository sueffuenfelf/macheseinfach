# Workspaces & Dashboard Architecture

## Information architecture

- Home (`/`) is catalog-first and does not render dashboard state.
- Workspace (`/arbeitsbereich/:slug`) is a dedicated dashboard context.
- Tool pages (`/bereich/...`, `/tool/...`) remain canonical for full workflows.
- Palette split:
  - in workspace route: tool search scoped to current workspace
  - outside workspace route: global actions only (workspace/system navigation)

## Persistence model

The production workspace state is stored as one versioned payload:

- key: `msf.workspaces.state.v2`
- shape:
  - `version: 2`
  - `workspaces: Workspace[]`
  - `layouts: Record<workspaceId, WorkspaceLayoutSet>`

`Workspace` fields:

- `id` (stable internal id)
- `slug` (URL identity used in `/arbeitsbereich/:slug`)
- `name`
- `isDefault`
- `createdAt`, `updatedAt`
- `toolIds` (per-workspace tool search scope)
- `widgetIds` (widgets on dashboard)

`WorkspaceLayoutSet` stores responsive layouts by breakpoint (`lg`, `md`, `sm`, `xs`, `xxs`).

## Migration

On first boot, v2 loader migrates from legacy MVP keys when present:

- `msf.workspaces.v1`
- `msf.workspace-layouts.v1`

Migration behavior:

- generates slug-safe workspace routes from legacy names
- keeps widget assignments where widget ids still exist
- sanitizes layout items against registered widget bounds
- enriches with metadata (`isDefault`, timestamps, tool scope)

Corrupt or incomplete state falls back to a deterministic default workspace.

## Workspace lifecycle

Supported operations are state-safe and persisted:

- create workspace
- rename workspace (with slug regeneration + collision handling)
- duplicate workspace (widgets, tool scope, layouts)
- delete workspace (protected when only one workspace remains)
- reorder workspace tabs
- set default workspace

Unknown workspace routes auto-fallback to default workspace.

## Dashboard behavior

- Built with responsive `react-grid-layout` (`Responsive` + `WidthProvider`)
- Supports drag, resize, and bound constraints from widget definitions
- Empty-state onboarding includes suggested starter widgets
- Add-widget picker:
  - widget search/filter by title, tags, tool
  - metadata preview and one-click insertion
  - tool-scope editor tab (workspace `toolIds`)

Widget chrome includes:

- drag handle
- quick open into full tool
- remove action

## Widget registration contract

Widgets are centrally registered in `src/shell/widgets/registry.ts` and include:

- `id`, `title`, `description`, `tags`
- `toolId`
- render component
- sizing constraints (`min/max/default` dimensions)

Production defaults include compact widgets and launch widgets for all current tools that are feasible in dashboard context:

- IBAN, GiroCode, Leak-Check, Passwort-Generator, QR
- PDF compress/redact/merge/sign, HEIC convert, OCR, EPC read (compact launcher widgets)

## Accessibility and interaction

- keyboard focus states use `.ms-focus`
- all modal/dialog overlays include dismiss actions and labels
- `Cmd/Ctrl+K` remains the single palette shortcut with route-based behavior
- reduced-motion support inherits existing global CSS media handling
