# Tool folder architecture

Each tool lives in one folder: `src/tools/<tool-id>/`.

## Add a new tool

1. Create `src/tools/<tool-id>/config.ts`.
2. Export `default defineTool({ catalog, page? }, '<tool-id>')`.
3. Keep `catalog.id` equal to the folder name.
4. Add the page component in the same folder.

`src/tools/discover.ts` auto-discovers `./*/config.ts`, validates folder/id consistency, builds catalog tools, and page mapping.

No manual edits are needed in `src/data/catalog/tools.ts` or `src/shell/tools/index.tsx` for new tool folders.
