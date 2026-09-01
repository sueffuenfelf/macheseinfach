# Deploy — macheseinfa.ch (Dokploy + Nixpacks)

Wie [`convent`](../../convent): Nixpacks baut das Image und startet danach ein **`start`-Script** im Container. Kein separates nginx-Image, kein Publish-Directory-Kopieren.

## Dokploy — Pflichtfelder

| Feld | Wert |
| --- | --- |
| **Build type** | `Nixpacks` |
| **Build path** | `/` (Repo-Root) |
| **Publish directory** | **leer lassen** |
| **Port** | `3000` |

### Warum nginx in den Logs?

Wenn **Publish directory** gesetzt ist (z. B. `apps/cms/.next` oder `apps/website/dist`), macht Dokploy:

1. Nixpacks-Build (OK)
2. `docker cp` der Artefakte auf den Host
3. Start eines **nginx**-Containers

Dann siehst du `/docker-entrypoint.sh` und `nginx/1.31.3` — **nicht** den App-Start.

Ohne Publish directory läuft das **Nixpacks-Image** weiter und startet:

```text
> @macheseinfach/website start
> vite preview --host 0.0.0.0 --port 3000
```

(convent-Äquivalent: `pnpm --filter cms start` → `next start`)

## Build & Start (Repo)

[`nixpacks.toml`](../nixpacks.toml):

1. `bun install`
2. `bun run --filter @macheseinfach/website build` → `apps/website/dist`
3. `bun run --filter @macheseinfach/website start` → `vite preview` auf `$PORT`

## Umgebungsvariablen (optional)

| Variable | Zweck |
| --- | --- |
| `PORT` | von Dokploy gesetzt (Standard `3000`) |
| `VITE_SITE_URL` | Canonical URL für SEO |
| `FF_DISALLOW_INDEXING` | Indexierung **an** (Default). `true` setzt die ganze Site auf noindex. Impressum und Datenschutz bleiben immer noindex. |

## Lokal testen

```bash
bun run --filter @macheseinfach/website build
PORT=3000 bun run --filter @macheseinfach/website start
```

## Search-Embeddings

Nach Katalog-Änderungen lokal regenerieren und committen:

```bash
bun run --filter @macheseinfach/website build:embeddings
```
