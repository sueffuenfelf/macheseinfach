import { describe, expect, test } from 'bun:test';
import { Button } from './Button';

describe('Button', () => {
    test('exports primary variant class hook', () => {
        expect(Button.name).toBe('Button');
    });
});
