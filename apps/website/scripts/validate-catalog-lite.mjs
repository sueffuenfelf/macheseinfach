/**
 * Lightweight catalog checks without Vite tool discovery.
 */
import { readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { areas } from '../src/data/catalog/areas.ts';
import { AREA_IDS } from '../src/data/catalog/types.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const toolDirs = new Set(
    readdirSync(join(root, 'src/tools')).filter((name) =>
        existsSync(join(root, 'src/tools', name, 'config.ts')),
    ),
);

const issues = [];

for (const id of AREA_IDS) {
    if (!areas[id]) issues.push(`AREA_IDS missing object: ${id}`);
}
for (const id of Object.keys(areas)) {
    if (!AREA_IDS.includes(id)) issues.push(`areas key not in AREA_IDS: ${id}`);
}

console.log(`areas=${Object.keys(areas).length} tools=${toolDirs.size} issues=${issues.length}`);
if (issues.length) {
    for (const issue of issues.slice(0, 40)) console.log(issue);
    process.exit(1);
}
console.log('catalog structural checks ok');
