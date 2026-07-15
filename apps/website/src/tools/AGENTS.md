# Tool folder architecture

Each tool lives in one folder: `src/tools/<tool-id>/`.

## Add a new tool

1. Create `src/tools/<tool-id>/config.ts`.
2. Export `default defineTool({ catalog, page, widgets? }, '<tool-id>')`.
3. Keep `catalog.id` equal to the folder name.
4. Add the page component in the same folder.
5. If the tool has dashboard widgets, add them under `widgets/` in the same folder.

`src/tools/discover.ts` auto-discovers `./*/config.ts`, validates folder/id consistency, builds catalog tools, page mapping, and widget registrations.

No manual edits are needed in `src/data/catalog/tools.ts`, `src/shell/tools/index.tsx`, or widget registries for new tool folders.
