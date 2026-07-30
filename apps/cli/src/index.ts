#!/usr/bin/env bun

import { runDev } from './commands/dev';
import { listDevApps } from './commands/dev';

const args = process.argv.slice(2);
const command = args[0] ?? 'help';

const help = `macheseinfach — local dev & project management

Usage:
  macheseinfach help
  macheseinfach info
  macheseinfach dev <app>

Apps: ${listDevApps().join(', ')}
`;

async function main(): Promise<number> {
    if (command === 'help' || command === '--help' || command === '-h') {
        console.log(help);
        return 0;
    }

    if (command === 'info') {
        console.log('Macheseinfach monorepo — Bun workspaces');
        console.log(`Apps: ${listDevApps().join(', ')}`);
        return 0;
    }

    if (command === 'dev') {
        return runDev(args[1]);
    }

    console.error(`Unknown command: ${command}\n`);
    console.log(help);
    return 1;
}

const code = await main();
process.exit(code);
