import { findRepoRoot } from '../root';

/** App alias → workspace package name */
export const DEV_APPS: Record<string, { package: string; script?: string }> = {
    website: { package: '@macheseinfach/website' },
    'ocr-service': { package: '@macheseinfach/ocr-service' },
    ocr: { package: '@macheseinfach/ocr-service' },
    storybook: { package: '@macheseinfach/ui', script: 'storybook' },
    ui: { package: '@macheseinfach/ui', script: 'storybook' },
    cli: { package: '@macheseinfach/cli', script: 'dev' },
};

export function listDevApps(): string[] {
    return Object.keys(DEV_APPS);
}

export async function runDev(appArg: string | undefined): Promise<number> {
    if (!appArg) {
        console.error('Usage: macheseinfach dev <app>');
        console.error(`Apps: ${listDevApps().join(', ')}`);
        return 1;
    }

    const target = DEV_APPS[appArg];
    if (!target) {
        console.error(`Unknown app "${appArg}".`);
        console.error(`Apps: ${listDevApps().join(', ')}`);
        return 1;
    }

    const root = findRepoRoot();
    const script = target.script ?? 'dev';
    const proc = Bun.spawn(['bun', 'run', '--filter', target.package, script], {
        cwd: root,
        stdin: 'inherit',
        stdout: 'inherit',
        stderr: 'inherit',
    });
    return proc.exited;
}
