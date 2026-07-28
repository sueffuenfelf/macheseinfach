import { describe, expect, test } from 'bun:test';
import { computeSmsCount, smsEncodingStats } from './compute';

describe('sms-counter', () => {
    test('gsm single segment', () => {
        const stats = smsEncodingStats('Hallo');
        expect(stats.encoding).toBe('GSM-7');
        expect(stats.units).toBe(5);
        expect(stats.segments).toBe(1);
    });

    test('euro costs two septets', () => {
        const stats = smsEncodingStats('€');
        expect(stats.encoding).toBe('GSM-7');
        expect(stats.units).toBe(2);
    });

    test('emoji forces ucs-2', () => {
        const stats = smsEncodingStats('Hi 👋');
        expect(stats.encoding).toBe('UCS-2');
        expect(stats.units).toBe(4);
    });

    test('compute rows', () => {
        const result = computeSmsCount({ text: 'Test' });
        expect(result.error).toBeUndefined();
        expect(result.heading).toBe('GSM-7');
    });
});
