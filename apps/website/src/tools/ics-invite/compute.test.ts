import { describe, expect, test } from 'bun:test';
import { generateIcsInvite } from './compute';

describe('ics-invite', () => {
    test('generates ics content', () => {
        const result = generateIcsInvite({
            title: 'Team-Call',
            date: '2026-07-28',
            startTime: '10:00',
            endTime: '11:00',
        });
        expect(result?.content).toContain('BEGIN:VCALENDAR');
        expect(result?.content).toContain('Team-Call');
    });
});
