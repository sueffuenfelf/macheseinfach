---
name: macheseinfach-plan
description: >-
  Drafts implementation plans under docs/plans/ before large macheseinfach
  changes. Use for non-trivial features, refactors, or multi-file work — plan
  only, no implementation in plan-only turns.
---

# Plan schreiben (`docs/plans/`)

**Plan-only:** In Plan-Turns nur das Dokument erstellen/überarbeiten — **nicht implementieren** (`CLAUDE.md` `/plan`).

## Wann?

- Mehrere Dateien oder Packages betroffen
- Neue Tool-Shell, Katalog-Bereich, oder `_shared`-Engine
- Architektur- oder UX-Entscheidung mit Trade-offs
- Vor größeren Diffs (Repo-Regel in `.cursor/rules/macheseinfach-always.mdc`)

Kleine Fixes (Typo, eine Zeile) → kein Plan.

## Pfad

| Scope | Ort |
| --- | --- |
| Repo-weit | `docs/plans/YYYY-MM-DD-<slug>.md` |
| Website-spezifisch | `apps/website/docs/plans/YYYY-MM-DD-<slug>.md` |

Slug: kebab-case, deutsch oder englisch konsistent zum Ticket/Thema.

## Vorlage

```markdown
# <Titel>

**Datum:** YYYY-MM-DD
**Scope:** `apps/website` | `packages/ui` | …
**Status:** Planung only — noch nicht bauen

## Problem

Was ist heute schlecht / fehlt? Nutzer-Situation in 2–4 Sätzen.

## Lösung

Was soll sich ändern? Verhalten, nicht Dateiliste.

## Umsetzung

### `<pfad/datei>` (neu|ändern)

Konkrete Schritte, APIs, Datenfluss.

## Nicht-Ziele

Was bewusst außerhalb bleibt.

## Verifikation

- [ ] `bun test …`
- [ ] Manuell: …
```

Referenz: `docs/plans/2026-07-19-image-resize-canvas.md` (fokussiert), `docs/plans/2026-07-28-bereich-tool-roadmap.md` (Roadmap).

## Gute Pläne

- **Problem vor Lösung** — Situation, nicht sofort Code
- **Testbare Schritte** — `compute.ts` + Tests vor UI
- **Shell zuerst** — gleiches UX → bestehende Factory (`defineCalcTool`, …)
- **Bidirektionale Katalog-Links** erwähnen wenn Stories/Bereiche betroffen
- **Verifikation** am Ende — welche Commands beweisen "done"

## Nach dem Plan

1. Nutzer bestätigt oder schärft Scope
2. Implementierung in separatem Turn
3. `macheseinfach-verify` vor Abschluss
4. Status im Plan auf `Umgesetzt` oder Archiv-Link setzen (optional)

## Verknüpfung mit anderen Skills

| Plan enthält … | Danach Skill |
| --- | --- |
| Neues Tool | `macheseinfach-new-tool` |
| UI-Komponente | `macheseinfach-ui-component` |
| Neuer Bereich/Story | `macheseinfach-catalog-entry` |
| Neues Package/App | `macheseinfach-new-package` / `macheseinfach-new-app` |
