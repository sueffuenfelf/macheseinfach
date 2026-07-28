import { describe, expect, test } from 'bun:test';
import { analyzeSitemap } from './compute';

const VALID = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://beispiel.de/</loc></url>
  <url><loc>https://beispiel.de/kontakt</loc></url>
</urlset>`;

describe('seo-sitemap-check', () => {
    test('valid urlset', () => {
        const findings = analyzeSitemap(VALID);
        expect(findings.some((f) => f.id === 'valid' && f.severity === 'ok')).toBe(true);
        expect(findings.some((f) => f.title.includes('2 URL'))).toBe(true);
    });

    test('invalid xml', () => {
        const findings = analyzeSitemap('<urlset><url>');
        expect(findings[0]?.severity).toBe('error');
    });

    test('empty input', () => {
        expect(analyzeSitemap('')[0]?.id).toBe('empty');
    });
});
