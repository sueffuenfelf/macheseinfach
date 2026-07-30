# Fix custom model settings + default OpenRouter free

## Problem

Choosing **„Eigenes Modell …“** in Einstellungen snaps back to Sonnet: the select `onChange` returns early on `custom` and never opens the custom-ID input. Default model is still `anthropic/claude-sonnet-4`.

## Goals

1. Selecting custom keeps the select on „Eigenes Modell …“ and shows a text field for any OpenRouter model id.
2. Persist the typed model via existing `writeAssistantSettings`.
3. Default model: **Openrouter Free Rotation** (`openrouter/free`), also as a curated option.
4. Same-tab: settings changes refresh the live assistant (use `useAssistant().updateSettings` when provider is available).

## Out of scope

Migrating existing localStorage blobs beyond new defaults for fresh installs.
