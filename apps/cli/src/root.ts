import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function findRepoRoot(startDir = process.cwd()): string {
    let dir = startDir;
    while (true) {
        const pkgPath = join(dir, 'package.json');
        if (existsSync(pkgPath)) {
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { workspaces?: string[] };
            if (pkg.workspaces?.length) return dir;
        }
        const parent = join(dir, '..');
        if (parent === dir) {
            throw new Error(
                'Could not find macheseinfach monorepo root (no workspaces in package.json).',
            );
        }
        dir = parent;
    }
}
