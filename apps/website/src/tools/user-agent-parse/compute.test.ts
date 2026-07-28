import { describe, expect, test } from 'bun:test';
import { analyzeUserAgent, parseUserAgent } from './compute';

describe('user-agent-parse', () => {
    test('parses chrome on mac', () => {
        const ua =
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        const p = parseUserAgent(ua);
        expect(p.browser).toBe('Chrome');
        expect(p.browserVersion.startsWith('120')).toBe(true);
        expect(p.os).toContain('macOS');
    });

    test('findings include browser', () => {
        const findings = analyzeUserAgent(
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
        );
        expect(findings.some((f) => f.id === 'browser')).toBe(true);
        expect(findings.some((f) => f.id === 'device' && f.detail?.includes('iPhone'))).toBe(true);
    });
});
