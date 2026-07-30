import { describe, expect, test } from 'bun:test';
import { filterComposerSlashCommands, parseComposerSlashInput } from './composer-commands';

describe('composer slash commands', () => {
    test('filters commands by prefix', () => {
        const cmds = filterComposerSlashCommands('/to');
        expect(cmds.some((c) => c.name === 'tool')).toBe(true);
    });

    test('parses command args', () => {
        const parsed = parseComposerSlashInput('/tool iban prüfen');
        expect(parsed?.commandName).toBe('tool');
        expect(parsed?.args).toBe('iban prüfen');
    });
});
