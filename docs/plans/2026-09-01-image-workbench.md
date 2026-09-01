---
name: image-workbench-template
date: 2026-09-01
owner: sofien
target: projects/macheseinfach/apps/website
status: implemented
---

## Context & goal

Image tools currently stack dropzone, badges, settings, progress, and result as cards in a narrow column — while JobDock (bottom left) and job toasts (bottom right) both show the same run. Done looks like: a full-page workbench (preview stage + control rail) first shipped on **Bilder komprimieren**, with job status only in the existing bottom-right toasts.

## Non-goals

- Migrating every image tool in this change (resize, crop, … stay as-is).
- Live recompress-on-slider preview.
- Replacing the toast system with Sonner.

## Example architecture

```text
apps/website/src/tools/_shared/image/workbench/
  ImageWorkbenchShell.tsx   # fill remaining ToolWorkspace height; stage | rail
  ImageDropStage.tsx        # drop target IS the preview; filmstrip for N files
  useObjectUrl.ts           # create/revoke object URLs
  format-bytes.ts           # original size label

Flow: pick file → object URL on stage → rail (quality/format) → job toast only
Skip: FilePipelineToolShell (max-w-3xl card stack) — it is the anti-pattern
```

**Layout:** Desktop `flex-row`: preview `flex-1 min-h-0`, rail `~18rem` with `border-l`. Mobile: stage on top (~45vh), rail below. No `ms-card` wrappers.

**Status:** Remove in-page ProgressBar/ResultCard from compress. Remove `JobDock` (duplicate of job toasts). Pause/resume on persistent `kind: 'job'` toasts.

**ToolWorkspace:** inner pane `overflow-hidden` so the workbench can fill, not scroll a card list.

## Environment variables

None

## Tests & verification

- `bun test apps/website/src/tools/_shared/image/workbench/useObjectUrl.test.ts`
- Open `/tool/image-compress` at http://localhost:3010 — drop an image, see preview, no in-page progress bar, toast bottom-right during run

## Migration / data concerns

None

## Rollback

Revert the workbench files, restore JobDock in `App.tsx`, restore previous `ImageCompressTool` layout.

## Open questions

None
