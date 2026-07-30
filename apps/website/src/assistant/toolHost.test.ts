import { describe, expect, test } from 'bun:test';
import { buildSystemPrompt } from '@macheseinfach/assistant-core';
import { createInMemoryPersistence } from '@macheseinfach/assistant-core';
import { allTools } from '../data/catalog';
import { createAssistantHost } from './toolHost';
import { runCatalogTool } from './shellRunner';

const catalogLoaded = allTools.length > 0;

describe('createAssistantHost', () => {
    const persistence = createInMemoryPersistence();
    const host = createAssistantHost({
        favoriteIds: ['iban-validate'],
        selectTool: () => {},
        navigateToTool: () => {},
        selectStory: () => {},
        persistence,
        getThread: () => ({
            id: 't1',
            title: 'Test',
            createdAt: 0,
            updatedAt: 0,
            messages: [],
            attachmentIds: [],
        }),
        updateThread: () => {},
        requestUserInput: async () => ({ cancelled: true }),
    });

    test('list_areas returns catalog areas', () => {
        const areas = host.listAreas();
        expect(areas.length).toBeGreaterThan(0);
        expect(areas[0]).toMatchObject({
            id: expect.any(String),
            label: expect.any(String),
            toolCount: expect.any(Number),
        });
    });

    test.skipIf(!catalogLoaded)('search_tools finds IBAN tools', () => {
        const hits = host.searchTools('iban', { limit: 5 });
        expect(hits.length).toBeGreaterThan(0);
        expect(hits.some((h) => h.id.includes('iban'))).toBe(true);
    });

    test.skipIf(!catalogLoaded)('list_favorites maps platform favorites', () => {
        const favorites = host.listFavorites();
        expect(favorites).toHaveLength(1);
        expect(favorites[0]?.id).toBe('iban-validate');
    });

    test('list_flows maps legacy stories', () => {
        const flows = host.listFlows();
        expect(flows.length).toBeGreaterThan(0);
        expect(flows[0]).toMatchObject({
            id: expect.stringMatching(/^story-/),
            title: expect.any(String),
        });
    });

    test.skipIf(!catalogLoaded)('runTool executes iban-validate', async () => {
        const result = await host.runTool('iban-validate', {
            iban: 'DE89370400440532013000',
        });
        expect(result.ok).toBe(true);
        expect(result.summary).toContain('IBAN');
    });

    test('resolveAttachment respects thread membership', async () => {
        const att = {
            id: 'att-1',
            kind: 'text' as const,
            name: 'note',
            text: 'hi',
            createdAt: Date.now(),
            source: 'user_upload' as const,
        };
        persistence.attachments.save(att);
        const hostWithAtt = createAssistantHost({
            favoriteIds: [],
            selectTool: () => {},
            navigateToTool: () => {},
            persistence,
            getThread: () => ({
                id: 't1',
                title: 'Test',
                createdAt: 0,
                updatedAt: 0,
                messages: [],
                attachmentIds: ['att-1'],
            }),
            updateThread: () => {},
            requestUserInput: async () => ({ cancelled: true }),
        });
        const resolved = await hostWithAtt.resolveAttachment('att-1');
        expect(resolved?.text).toBe('hi');
        const missing = await hostWithAtt.resolveAttachment('other');
        expect(missing).toBeNull();
    });
});

describe('buildSystemPrompt favorites', () => {
    test('includes live favorite titles', () => {
        const prompt = buildSystemPrompt({
            favorites: [{ id: 'iban-validate', title: 'IBAN prüfen' }],
            locale: 'de',
        });
        expect(prompt).toContain('IBAN prüfen (iban-validate)');
    });

    test('includes active flow slots when provided', () => {
        const prompt = buildSystemPrompt({
            favorites: [],
            locale: 'de',
            activeFlow: {
                id: 'story-pdf-pack',
                title: 'PDF-Paket',
                slots: [
                    { id: 'sourcePdf', label: 'Quell-PDF', status: 'gesetzt' },
                    { id: 'note', label: 'Notiz', status: 'leer' },
                ],
            },
        });
        expect(prompt).toContain('Aktives Vorhaben: PDF-Paket');
        expect(prompt).toContain('Quell-PDF (sourcePdf)=gesetzt');
    });
});

describe('runCatalogTool', () => {
    test('unknown tool fails gracefully', async () => {
        const result = await runCatalogTool('does-not-exist-xyz', {});
        expect(result.ok).toBe(false);
    });
});
