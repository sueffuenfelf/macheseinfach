import { describe, expect, test } from 'bun:test';
import { analyzeHeadingA11y } from './compute';

test('flags skipped heading level', () => {
    const f = analyzeHeadingA11y('<h1>A</h1><h3>C</h3>');
    expect(f.some((x) => x.severity === 'warn')).toBe(true);
});
