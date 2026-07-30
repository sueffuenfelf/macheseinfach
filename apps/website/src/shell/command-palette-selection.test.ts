import { describe, expect, test } from 'bun:test';
import { buildSearchDocuments } from '../search/documents';
import { tools } from '../tools/discover';
import { resolvePaletteSearchSelection } from './command-palette-selection';

const hasDiscoveredTools = Object.keys(tools).length > 0;

describe('resolvePaletteSearchSelection', () => {
    test('uses toolId when catalog tool exists', () => {
        if (!hasDiscoveredTools) return;

        const variantDoc = buildSearchDocuments().find((d) => d.id === 'variant:heic-zu-png');
        expect(variantDoc).toBeDefined();

        const selection = resolvePaletteSearchSelection({
            document: variantDoc!,
            score: 1,
            source: 'lexical',
        });

        expect(selection).toEqual({ kind: 'tool', toolId: variantDoc!.toolId });
    });

    test('falls back to href when toolId is missing', () => {
        const areaDoc = buildSearchDocuments().find((d) => d.kind === 'area');
        expect(areaDoc).toBeDefined();
        expect(areaDoc!.toolId).toBeUndefined();

        const selection = resolvePaletteSearchSelection({
            document: areaDoc!,
            score: 1,
            source: 'lexical',
        });

        expect(selection).toEqual({ kind: 'href', href: areaDoc!.href });
    });

    test('falls back to href when toolId does not resolve in catalog', () => {
        const doc = {
            id: 'tool:ghost',
            kind: 'tool' as const,
            title: 'Ghost',
            subtitle: '',
            body: '',
            keywords: [],
            slots: { formats: [], actions: [], context: [], multiStep: false },
            href: '/tool/ghost-tool',
            toolId: 'ghost-tool' as const,
        };

        const selection = resolvePaletteSearchSelection({
            document: doc,
            score: 1,
            source: 'lexical',
        });

        expect(selection).toEqual({ kind: 'href', href: '/tool/ghost-tool' });
    });
});
