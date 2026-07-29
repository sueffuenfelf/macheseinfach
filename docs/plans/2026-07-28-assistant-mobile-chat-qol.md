# Mobile assistant overlay + chat QoL

## Goals

1. On viewports &lt; md, the assistant is a **toggleable fullscreen main chat** on top of the page (not a capped bottom sheet), with body scroll lock, safe areas, focus trap, and soft-keyboard-aware height (`dvh` + `visualViewport`).
2. Rich chat QoL: stop generation, copy message, lightweight markdown, new/switch/delete threads, regenerate last answer, larger touch targets, draft persistence.

## Approach

- `AssistantHost`: mobile always fullscreen overlay; desktop keeps sidebar/floating.
- `AssistantProvider`: AbortController stop, thread CRUD, regenerate.
- OpenRouter + loop: optional `AbortSignal`.
- UI: chrome thread menu, composer Stop, markdown bubbles, copy actions.

## Out of scope

Dragging/resizing floating panel; third-party markdown libraries.
