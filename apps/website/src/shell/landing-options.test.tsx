import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { allTools, type ToolDefinition } from '../data/catalog';
import { LandingHome } from './LandingHome';
import { LANDING_AREA_IDS, visibleLandingAreaIds } from './landing-areas';
import { resolveLandingOptions, toolMatchesLandingQuery } from './landing-options';

const sampleTool: ToolDefinition = {
    id: 'json-format',
    slug: 'json-format',
    shortTitle: 'JSON formatieren',
    title: 'JSON formatieren und prüfen',
    sub: 'API-Responses lesen.',
    pain: 'Minifiziertes JSON.',
    solution: 'Einfügen und formatieren.',
    trust: 'Lokal',
    tags: ['JSON'],
    keywords: ['json formatter'],
    fileHints: [],
    command: '/json',
    entry: 'form',
    theme: { accent: '#457b9d', accentStrong: '#000', accentSoft: '#dbeafe' },
    maturity: 'stable',
    areas: ['web'],
};

describe('landing areas', () => {
    test('exposes only the remaining public categories that still exist', () => {
        expect(visibleLandingAreaIds()).toEqual([...LANDING_AREA_IDS]);
        expect(visibleLandingAreaIds()).toEqual([
            'bilder',
            'einheiten',
            'web',
            'zeit',
            'text',
            'dokumente',
        ]);
    });
});

describe('resolveLandingOptions', () => {
    test('empty query lists remaining categories and no tools', () => {
        const { areas, tools } = resolveLandingOptions('');
        expect(areas.map((a) => a.id)).toEqual([...LANDING_AREA_IDS]);
        expect(tools).toEqual([]);
    });

    test('query filters categories by label, description, and tools', () => {
        const { areas } = resolveLandingOptions('json');
        expect(areas.some((a) => a.id === 'web')).toBe(true);
        expect(areas.some((a) => a.id === 'bilder')).toBe(false);
        expect(toolMatchesLandingQuery(sampleTool, 'json')).toBe(true);
        expect(toolMatchesLandingQuery(sampleTool, 'heic')).toBe(false);
        if (allTools.length > 0) {
            const { tools } = resolveLandingOptions('json');
            expect(tools.length).toBeGreaterThan(0);
        }
    });

    test('stays within remaining categories', () => {
        const empty = resolveLandingOptions('');
        expect(new Set(empty.areas.map((a) => a.id))).toEqual(new Set(LANDING_AREA_IDS));
        const billed = resolveLandingOptions('rechnung');
        expect(
            billed.areas.every((a) => (LANDING_AREA_IDS as readonly string[]).includes(a.id)),
        ).toBe(true);
    });
});

describe('LandingHome', () => {
    test('search field is the starting point and lists remaining categories', () => {
        const html = renderToStaticMarkup(
            <LandingHome
                query=""
                onQueryChange={() => {}}
                onSubmit={() => {}}
                areas={resolveLandingOptions('').areas}
                tools={[]}
                recentTools={[]}
                onSelectArea={() => {}}
                onSelectTool={() => {}}
            />,
        );
        expect(html).toContain('id="home-search"');
        expect(html).toContain('Finde das passende Tool');
        expect(html).toContain('Bilder');
        expect(html).toContain('Einheiten');
        expect(html).toContain('Dokumente');
        expect(html).not.toContain('Vorhaben');
        expect(html).not.toContain('Buchhaltung');
    });

    test('typed query shows matching tools under the search', () => {
        const pdfTool: ToolDefinition = {
            ...sampleTool,
            id: 'pdf-compress',
            slug: 'pdf-compress',
            shortTitle: 'PDF verkleinern',
            areas: ['dokumente'],
        };
        const html = renderToStaticMarkup(
            <LandingHome
                query="pdf"
                onQueryChange={() => {}}
                onSubmit={() => {}}
                areas={resolveLandingOptions('pdf').areas}
                tools={[pdfTool]}
                recentTools={[]}
                onSelectArea={() => {}}
                onSelectTool={() => {}}
            />,
        );
        expect(html).toContain('Passende Tools');
        expect(html).toContain('PDF verkleinern');
        expect(html).toContain('Dokumente');
    });
});
