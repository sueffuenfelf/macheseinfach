---
name: toast-jobs-queue
date: 2026-07-15
owner: sofien
target: apps/website
status: implemented
---

# Toast, system notifications & client job queue

## Goal

Non-blocking batch work (PDF/HEIC) with pause/resume, rich toasts linking back to the originating tool/route, and native OS notifications when the tab is open but unfocused.

## Architecture

```
shell/jobs/          — persisted queue, batch helper, JobDock UI
shell/toast/         — rich ToastInput + Notification bridge (Page Visibility)
SettingsContext      — backgroundNotifications + permission request
tools/heic-convert/  — first consumer (batch demo)
```

## Verification

```bash
bun run --filter @macheseinfach/website build
```

Manual: start HEIC batch → switch tab → OS notification; pause/resume in JobDock; click toast/link → correct route.
