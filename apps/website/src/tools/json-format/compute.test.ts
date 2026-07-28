import { describe, expect, test } from 'bun:test';
import { analyzeJson } from './compute';

describe('json-format', () => {
    test('formats valid object', () => {
        const findings = analyzeJson('{"a":1}');
        expect(findings.some((f) => f.id === 'ok')).toBe(true);
        const formatted = findings.find((f) => f.id === 'formatted');
        expect(formatted?.detail).toContain('"a": 1');
    });

    test('rejects invalid', () => {
        const findings = analyzeJson('{a}');
        expect(findings[0]?.severity).toBe('error');
    });
});
