import { defineDokployProject } from '@kounds/dokploy/config';

/**
 * macheseinfa.ch — static Vite SPA (Bun workspace), built via Dockerfile, served by nginx.
 *
 * Run from the agency repo root (the CLI resolves `@kounds/dokploy/config` via the
 * agency `node_modules`; the project is detected through `projects/macheseinfach/`):
 *
 *   kounds dokploy validate website -p macheseinfach --check-remote
 *   kounds dokploy plan website -p macheseinfach --create
 *   kounds dokploy apply website -p macheseinfach --create --with-env
 */
export default defineDokployProject({
    dokployProject: 'suefien',
    environment: 'production',
    servers: {
        client: 'server4you - 3€',
        build: 's4u - build server',
    },
    /** Required: deploy server (server4you) ≠ build server (s4u) → image via registry. */
    buildRegistryId: 'WqeR6oI7GXbZglo9UKPST',
    deployments: [
        {
            id: 'website',
            template: 'marketing-site-cms',
            remoteAppName: 'macheseinfa',
            github: {
                owner: 'sueffuenfelf',
                repository: 'macheseinfach',
                branch: 'main',
                buildPath: '.',
            },
            domain: 'macheseinfa.ch',
            build: {
                type: 'dockerfile',
                dockerfile: 'Dockerfile',
                dockerContextPath: '.',
            },
            server: { deploy: 'client', build: 'build' },
            envFile: '.kounds/env/website.env',
            env: {
                NODE_ENV: 'production',
                PORT: '8080',
            },
        },
    ],
});
