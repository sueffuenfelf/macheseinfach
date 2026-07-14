import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { DEV_APPS, listDevApps } from './dev';

describe('dev apps', () => {
    test('lists known app aliases', () => {
        expect(listDevApps()).toContain('website');
        expect(listDevApps()).toContain('storybook');
    });

    test('maps storybook to ui package', () => {
        expect(DEV_APPS.storybook).toEqual({ package: '@macheseinfach/ui', script: 'storybook' });
    });
});

describe('findRepoRoot', () => {
    test('finds monorepo from apps/cli', async () => {
        const { findRepoRoot } = await import('../root');
        const root = findRepoRoot(join(import.meta.dir, '../../..'));
        expect(root.endsWith('macheseinfach')).toBe(true);
    });
});
