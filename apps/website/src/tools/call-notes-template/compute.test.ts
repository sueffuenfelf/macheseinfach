import { describe, expect, test } from 'bun:test';
import { generateCallNotesTemplate } from './compute';

describe('call-notes-template', () => {
    test('includes caller and topic', () => {
        const result = generateCallNotesTemplate({ caller: 'Max GmbH', topic: 'Angebot' });
        expect(result?.content).toContain('Max GmbH');
        expect(result?.content).toContain('Angebot');
    });
});
