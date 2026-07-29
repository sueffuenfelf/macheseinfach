# Cursor skills — macheseinfach

Project-specific skills for the Bun monorepo. Loaded from `.cursor/skills/` when the task matches the description.

## Available

| Skill | Use when |
| --- | --- |
| [`macheseinfach-plan`](macheseinfach-plan/SKILL.md) | Draft `docs/plans/` before large or multi-file work |
| [`macheseinfach-new-tool`](macheseinfach-new-tool/SKILL.md) | New calculator, checker, converter, or file tool on the website |
| [`macheseinfach-ui-component`](macheseinfach-ui-component/SKILL.md) | New primitive or composed component in `@macheseinfach/ui` |
| [`macheseinfach-new-package`](macheseinfach-new-package/SKILL.md) | New shared library under `packages/` |
| [`macheseinfach-new-app`](macheseinfach-new-app/SKILL.md) | New app under `apps/` (Vite, Bun server, CLI bin) |
| [`macheseinfach-cli-command`](macheseinfach-cli-command/SKILL.md) | New `macheseinfach <cmd>` in `apps/cli` |
| [`macheseinfach-catalog-entry`](macheseinfach-catalog-entry/SKILL.md) | New area, user story, tags, or story↔tool links |
| [`macheseinfach-verify`](macheseinfach-verify/SKILL.md) | Pre-PR gate: format, lint, test, build |

## Typical flow

```text
Plan → Implement (tool / UI / package / app) → Catalog links → Verify
```

Sync from repo conventions (`AGENTS.md`, `apps/website/src/tools/AGENTS.md`) — skills link to SSOT, they do not duplicate it.
