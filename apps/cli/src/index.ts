#!/usr/bin/env bun

const args = process.argv.slice(2);
const command = args[0] ?? 'help';

const help = `macheseinfach — local dev & project management

Usage:
  macheseinfach help
  macheseinfach info
  macheseinfach env check
`;

if (command === 'help' || command === '--help' || command === '-h') {
    console.log(help);
    process.exit(0);
}

if (command === 'info') {
    console.log('Macheseinfach monorepo — Bun workspaces');
    console.log('Apps: website, cli, ocr-service, beispiele');
    process.exit(0);
}

if (command === 'env') {
    const sub = args[1];
    if (sub === 'check') {
        const hasSops = Bun.which('sops') !== null;
        const hasAge = Bun.which('age-keygen') !== null;
        console.log(`sops: ${hasSops ? 'ok' : 'missing'}`);
        console.log(`age-keygen: ${hasAge ? 'ok' : 'missing'}`);
        process.exit(hasSops && hasAge ? 0 : 1);
    }
}

console.error(`Unknown command: ${command}\n`);
console.log(help);
process.exit(1);
