import { describe, expect, test } from 'bun:test';
import { analyzeRobotsTxt } from './compute';

describe('seo-robots-check', () => {
    test('parses user-agent and sitemap', () => {
        const findings = analyzeRobotsTxt(
            'User-agent: *\nDisallow: /admin/\nSitemap: https://beispiel.de/sitemap.xml',
        );
        expect(findings.some((f) => f.id === 'sitemaps')).toBe(true);
        expect(findings.some((f) => f.title.includes('User-agent: *'))).toBe(true);
    });

    test('warns on full block', () => {
        const findings = analyzeRobotsTxt('User-agent: *\nDisallow: /');
        expect(findings.some((f) => f.id.startsWith('block-all'))).toBe(true);
    });
});
