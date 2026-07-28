import { describe, expect, test } from 'bun:test';
import { generateMeetingAgenda } from './compute';

describe('meeting-agenda', () => {
    test('includes title', () => {
        const result = generateMeetingAgenda({ title: 'Sprint Review', duration: '45' });
        expect(result?.content).toContain('Sprint Review');
    });
});
