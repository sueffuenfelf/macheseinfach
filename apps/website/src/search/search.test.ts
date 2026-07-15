import { describe, expect, test } from 'bun:test';
import { normalizeQuery, normalizeToken } from './normalize';
import { tokenize } from './tokenize';
import { extractQuerySlots, slotBoostForDocument } from './slots';
import { buildSearchDocuments } from './documents';
import { scoreLexical, normalizeLexicalScores } from './score-lexical';
import { mergeWeightsForQuery, mergeHybridScores, shouldTriggerChrome } from './score-merge';
import { SEARCH_FIXTURES } from './fixtures/queries';
import { tools } from '../tools/discover';

const hasDiscoveredTools = Object.keys(tools).length > 0;

describe('normalize', () => {
    test('normalizes umlauts and casing', () => {
        expect(normalizeQuery('HEIC zu PNG')).toBe('heic zu png');
        expect(normalizeQuery('Größe prüfen')).toBe('groesse pruefen');
        expect(normalizeToken('schwärzen')).toBe('schwaerzen');
    });

    test('strips special characters', () => {
        expect(normalizeQuery('pdf!!! verkleinern???')).toBe('pdf verkleinern');
    });
});

describe('tokenize', () => {
    test('drops german stopwords when requested', () => {
        const tokens = tokenize('ich will heic zu png', { dropStopwords: true });
        expect(tokens).toContain('heic');
        expect(tokens).toContain('png');
        expect(tokens).not.toContain('ich');
        expect(tokens).not.toContain('will');
    });
});

describe('slots', () => {
    test('extracts format and action slots', () => {
        const slots = extractQuerySlots('heic zu png konvertieren');
        expect(slots.formats).toContain('heic');
        expect(slots.formats).toContain('png');
        expect(slots.actions).toContain('convert');
    });

    test('detects multi-step queries', () => {
        expect(extractQuerySlots('heic konvertieren und dann verkleinern').multiStep).toBe(true);
        expect(extractQuerySlots('heic zu png').multiStep).toBe(false);
    });

    test('slot boost rewards matching document slots', () => {
        const querySlots = extractQuerySlots('heic konvertieren');
        const docSlots = { formats: ['heic'], actions: ['convert'], context: ['iphone'], multiStep: false };
        expect(slotBoostForDocument(querySlots, docSlots)).toBeGreaterThan(0.2);
    });
});

describe('documents', () => {
    test('builds documents from catalog', () => {
        const docs = buildSearchDocuments();
        expect(docs.length).toBeGreaterThan(hasDiscoveredTools ? 30 : 10);
        expect(docs.some((d) => d.id === 'variant:heic-zu-png')).toBe(true);
        expect(docs.some((d) => d.id === 'template:bild-portal')).toBe(true);
    });
});

describe('score-lexical', () => {
    test('ranks heic variant above unrelated tools', () => {
        if (!hasDiscoveredTools) return;
        const docs = buildSearchDocuments();
        const raw = scoreLexical('heic zu png', docs);
        const normalized = normalizeLexicalScores(raw);
        const variantScore = normalized.get('variant:heic-zu-png') ?? 0;
        const ibanScore = normalized.get('tool:iban-validate:buchhaltung:story-iban-vor-ueberweisung') ?? 0;
        expect(variantScore).toBeGreaterThan(ibanScore);
    });

    test('fixture queries match expected top results', () => {
        if (!hasDiscoveredTools) return;
        const docs = buildSearchDocuments();
        for (const fixture of SEARCH_FIXTURES) {
            const raw = scoreLexical(fixture.query, docs);
            const normalized = normalizeLexicalScores(raw);
            const ranked = [...normalized.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([id]) => id);

            const topId = ranked[0] ?? '';
            const match = ranked.some((id) => id.includes(fixture.expectIdContains));
            expect(match).toBe(true);

            if (fixture.expectTopKind) {
                const topDoc = docs.find((d) => d.id === topId);
                expect(topDoc?.kind).toBe(fixture.expectTopKind);
            }
        }
    });
});

describe('score-merge', () => {
    test('short queries favor lexical weight', () => {
        const weights = mergeWeightsForQuery('heic');
        expect(weights.lexical).toBeGreaterThan(weights.semantic);
    });

    test('long queries favor semantic weight', () => {
        const weights = mergeWeightsForQuery('ich muss mein iphone heic foto für ein portal umwandeln');
        expect(weights.semantic).toBeGreaterThan(weights.lexical);
    });

    test('merge combines lexical and semantic scores', () => {
        const lexical = new Map([['a', 0.8], ['b', 0.4]]);
        const semantic = new Map([['a', 0.2], ['b', 0.9]]);
        const meta = new Map([
            ['a', { score: 0.8, slotBoost: 0.1, querySlots: { formats: [], actions: [], context: [], multiStep: false } }],
            ['b', { score: 0.4, slotBoost: 0, querySlots: { formats: [], actions: [], context: [], multiStep: false } }],
        ]);
        const merged = mergeHybridScores(lexical, semantic, meta, { lexical: 0.5, semantic: 0.5 });
        expect(merged.get('b')!.merged).toBeGreaterThan(merged.get('a')!.merged);
    });

    test('chrome trigger conditions', () => {
        expect(shouldTriggerChrome({ multiStep: true, formats: [], actions: [], context: [] }, 0.9, [0.9, 0.5])).toBe(true);
        expect(shouldTriggerChrome({ multiStep: false, formats: [], actions: [], context: [] }, 0.2, [0.2, 0.18])).toBe(true);
        expect(shouldTriggerChrome({ multiStep: false, formats: [], actions: [], context: [] }, 0.8, [0.8, 0.3])).toBe(false);
    });
});
