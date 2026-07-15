import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { findRepoRoot } from '../root';

function sopsEnv(root: string): NodeJS.ProcessEnv {
    const ageKey = join(root, '.kounds/age.key');
    if (existsSync(ageKey)) {
        return { ...process.env, SOPS_AGE_KEY_FILE: ageKey };
    }
    return { ...process.env };
}

export function runEnvCheck(): number {
    const hasSops = Bun.which('sops') !== null;
    const hasAge = Bun.which('age-keygen') !== null;
    console.log(`sops: ${hasSops ? 'ok' : 'missing'}`);
    console.log(`age-keygen: ${hasAge ? 'ok' : 'missing'}`);
    const root = findRepoRoot();
    const ageKey = join(root, '.kounds/age.key');
    console.log(
        `.kounds/age.key: ${existsSync(ageKey) ? 'ok' : 'missing (run age-keygen -o .kounds/age.key)'}`,
    );
    return hasSops && hasAge ? 0 : 1;
}

export async function runEnvDecrypt(): Promise<number> {
    const root = findRepoRoot();
    const secrets = join(root, '.kounds/secrets.env');
    if (!existsSync(secrets)) {
        console.error(`Missing ${secrets}`);
        return 1;
    }
    const proc = Bun.spawn(['sops', '-d', secrets], {
        cwd: root,
        env: sopsEnv(root),
        stdout: 'pipe',
        stderr: 'pipe',
    });
    const [stdout, stderr, code] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
    ]);
    if (code !== 0) {
        console.error(stderr.trim() || 'sops decrypt failed');
        return code;
    }
    await Bun.write(join(root, '.env'), stdout);
    console.log(`Wrote ${join(root, '.env')}`);
    return 0;
}

export async function runEnvEncrypt(): Promise<number> {
    const root = findRepoRoot();
    const envPath = join(root, '.env');
    if (!existsSync(envPath)) {
        console.error(`Missing ${envPath} — create it first or run env decrypt.`);
        return 1;
    }
    const proc = Bun.spawn(['sops', '-e', envPath], {
        cwd: root,
        env: sopsEnv(root),
        stdout: 'pipe',
        stderr: 'pipe',
    });
    const [stdout, stderr, code] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
    ]);
    if (code !== 0) {
        console.error(stderr.trim() || 'sops encrypt failed');
        return code;
    }
    await Bun.write(join(root, '.kounds/secrets.env'), stdout);
    console.log(`Wrote ${join(root, '.kounds/secrets.env')}`);
    return 0;
}
