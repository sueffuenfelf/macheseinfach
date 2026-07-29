# Deploy — macheseinfa.ch (Dokploy + Nixpacks)

Production runs the **Nixpacks image** with **Caddy** serving `apps/website/dist`. There is no Dockerfile or nginx config in this repo.

## Dokploy application settings

| Setting | Value |
| --- | --- |
| **Build type** | Nixpacks |
| **Build path** | `/` (repo root) |
| **Publish directory** | **empty** — do not set `apps/website/dist` or any `.next` path |
| **Port** | `3000` (Caddy default in `Caddyfile`) |

If **Publish directory** is set, Dokploy ignores the Nixpacks runtime, copies files out of the build container, and starts its own **nginx** image instead. That breaks SPA routing and is not supported for this project.

## Build (Nixpacks)

Configured in [`nixpacks.toml`](../nixpacks.toml):

1. `bun install` (workspace root)
2. `bun run --filter @macheseinfach/website build` → `apps/website/dist`
3. Start: `caddy run --config Caddyfile`

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Set by Dokploy; Caddy listens here |
| `VITE_SITE_URL` | Canonical URL for SEO (optional) |
| `FF_DISALLOW_INDEXING` | `false` in production when indexing is allowed |

## Local production smoke test

```bash
bun run --filter @macheseinfach/website build
PORT=3000 caddy run --config Caddyfile --adapter caddyfile
```

## Search embeddings

After catalog/search document changes, regenerate locally and commit:

```bash
bun run --filter @macheseinfach/website build:embeddings
```

Production builds skip this step and use the committed `apps/website/public/search/embeddings.json`.
