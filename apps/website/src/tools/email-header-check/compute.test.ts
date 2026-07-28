import { describe, expect, test } from 'bun:test';
import { analyzeEmailHeaders } from './compute';

const SAMPLE_HEADERS = `From: Bank <service@beispiel.de>
Reply-To: attacker@evil.example
Authentication-Results: mx.example; spf=pass; dkim=pass; dmarc=pass
Subject: DRINGEND: Konto gesperrt
Received: from mail1.example
Received: from mail2.example`;

describe('email-header-check compute', () => {
    test('detects reply-to mismatch', () => {
        const findings = analyzeEmailHeaders(SAMPLE_HEADERS);
        expect(findings.some((f) => f.id === 'reply-mismatch')).toBe(true);
    });

    test('flags suspicious subject', () => {
        const findings = analyzeEmailHeaders(SAMPLE_HEADERS);
        expect(findings.some((f) => f.id === 'subject')).toBe(true);
    });
});
