---
name: macheseinfach-cli-command
description: >-
  Adds a new subcommand to the macheseinfach CLI in apps/cli with Bun, help
  text, and tests. Use when extending local dev, project management, or ops
  commands.
---

# Neuer CLI-Befehl (`macheseinfach <cmd>`)

CLI: `apps/cli` — Package `@macheseinfach/cli`, Bin `macheseinfach` → `src/index.ts`.

## Workflow

```text
- [ ] apps/cli/src/commands/<cmd>.ts — Logik exportieren
- [ ] src/index.ts — command dispatch + help erweitern
- [ ] apps/cli/src/commands/<cmd>.test.ts — reine Logik testen
- [ ] bun run --filter @macheseinfach/cli test
- [ ] bun run dev:cli -- <cmd>   # manuell prüfen
```

## Befehl anlegen

`apps/cli/src/commands/<cmd>.ts`:

```ts
export async function runMyCmd(arg: string | undefined): Promise<number> {
    if (!arg) {
        console.error('Usage: macheseinfach my-cmd <arg>');
        return 1;
    }
    // …
    return 0;
}
```

`apps/cli/src/index.ts`:

```ts
import { runMyCmd } from './commands/my-cmd';

// help-String um Zeile ergänzen:
//   macheseinfach my-cmd <arg>

async function main(): Promise<number> {
    // …
    if (command === 'my-cmd') {
        return runMyCmd(args[1]);
    }
    // …
}
```

**Exit-Codes:** `0` = Erfolg, `1` = Nutzerfehler/Unbekannter Befehl. Kein `process.exit` in Commands — `index.ts` ruft `process.exit(code)` nach `main()`.

## Bestehende Patterns

| Befehl | Datei | Muster |
| --- | --- | --- |
| `dev <app>` | `commands/dev.ts` | `DEV_APPS`-Map, `Bun.spawn` mit `--filter` |
| `info` | `index.ts` inline | Einfache Ausgabe |
| `help` | `index.ts` | Default bei fehlendem/ungültigem Befehl |

Repo-Root finden: `findRepoRoot()` aus `src/root.ts` (sucht `package.json` mit `workspaces`).

## Tests

```ts
import { describe, expect, test } from 'bun:test';
import { runMyCmd } from './my-cmd';

describe('my-cmd', () => {
    test('fails without arg', async () => {
        expect(await runMyCmd(undefined)).toBe(1);
    });
});
```

Spawn/IO nicht mocken unless nötig — Logik in testbare Funktionen extrahieren.

## Verifikation

```bash
bun run --filter @macheseinfach/cli test
bun apps/cli/src/index.ts help
bun apps/cli/src/index.ts my-cmd
bun run format
```

## Anti-Patterns

- Keine interaktiven Prompts (kein `readline` ohne expliziten Auftrag).
- Destruktive Ops (force-push, rm -rf) — nicht ohne Nutzerbestätigung.
- Keine Secrets in argv oder stdout loggen.
