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
        favoriteIds: ['percent-calc'],
        selectTool: () => {},
        navigateToTool: () => {},
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

    test.skipIf(!catalogLoaded)('search_tools finds JSON tools', () => {
        const hits = host.searchTools('json', { limit: 5 });
        expect(hits.length).toBeGreaterThan(0);
        expect(hits.some((h) => h.id.includes('json'))).toBe(true);
    });

    test.skipIf(!catalogLoaded)('list_favorites maps platform favorites', () => {
        const favorites = host.listFavorites();
        expect(favorites).toHaveLength(1);
        expect(favorites[0]?.id).toBe('percent-calc');
    });

    test.skipIf(!catalogLoaded)('runTool executes percent-calc', async () => {
        const result = await host.runTool('percent-calc', {
            a: '10',
            b: '200',
            mode: 'of',
        });
        expect(result.ok).toBe(true);
        expect(result.summary).toContain('%');
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
            favorites: [{ id: 'percent-calc', title: 'Prozentrechner' }],
            locale: 'de',
        });
        expect(prompt).toContain('Prozentrechner (percent-calc)');
    });
});

describe('runCatalogTool', () => {
    test('unknown tool fails gracefully', async () => {
        const result = await runCatalogTool('does-not-exist-xyz', {});
        expect(result.ok).toBe(false);
    });
});
