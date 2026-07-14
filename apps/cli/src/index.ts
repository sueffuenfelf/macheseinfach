#!/usr/bin/env bun

import { runDev } from './commands/dev';
import { runEnvCheck, runEnvDecrypt, runEnvEncrypt } from './commands/env';
import { listDevApps } from './commands/dev';

const args = process.argv.slice(2);
const command = args[0] ?? 'help';

const help = `macheseinfach — local dev & project management

Usage:
  macheseinfach help
  macheseinfach info
  macheseinfach env check|decrypt|encrypt
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

    if (command === 'env') {
        const sub = args[1];
        if (sub === 'check') return runEnvCheck();
        if (sub === 'decrypt') return runEnvDecrypt();
        if (sub === 'encrypt') return runEnvEncrypt();
        console.error('Usage: macheseinfach env check|decrypt|encrypt');
        return 1;
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
