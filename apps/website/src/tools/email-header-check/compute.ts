import type { PasteFinding } from '../_shared/shells';

function parseHeaders(raw: string): Map<string, string[]> {
    const headers = new Map<string, string[]>();
    const lines = raw.split(/\r?\n/);
    let currentKey = '';

    for (const line of lines) {
        if (/^\s/.test(line) && currentKey) {
            const list = headers.get(currentKey) ?? [];
            list[list.length - 1] += ` ${line.trim()}`;
            headers.set(currentKey, list);
            continue;
        }
        const match = line.match(/^([^:]+):\s*(.*)$/);
        if (!match) continue;
        currentKey = match[1].trim().toLowerCase();
        const value = match[2].trim();
        const list = headers.get(currentKey) ?? [];
        list.push(value);
        headers.set(currentKey, list);
    }
    return headers;
}

function first(headers: Map<string, string[]>, key: string): string | undefined {
    return headers.get(key)?.[0];
}

function extractEmail(value: string): string | undefined {
    const match = value.match(/<([^>]+)>/) ?? value.match(/[\w.+-]+@[\w.-]+\.\w+/);
    return match ? (match[1] ?? match[0]).toLowerCase() : undefined;
}

/** Heuristic phishing indicators from pasted email headers. */
export function analyzeEmailHeaders(input: string): PasteFinding[] {
    const trimmed = input.trim();
    if (!trimmed) {
        return [
            {
                id: 'empty',
                severity: 'info',
                title: 'Keine Header',
                detail: 'Füge den kompletten E-Mail-Header-Text ein (z. B. „Original anzeigen“).',
            },
        ];
    }

    const headers = parseHeaders(trimmed);
    const findings: PasteFinding[] = [];

    const from = first(headers, 'from');
    const replyTo = first(headers, 'reply-to');
    const returnPath = first(headers, 'return-path');
    const authentication = [
        ...(headers.get('authentication-results') ?? []),
        ...(headers.get('arc-authentication-results') ?? []),
    ].join(' ');

    if (from) {
        findings.push({ id: 'from', severity: 'info', title: 'From', detail: from });
    } else {
        findings.push({
            id: 'no-from',
            severity: 'warn',
            title: 'Kein From-Header',
            detail: 'Ohne Absender schwer einzuschätzen.',
        });
    }

    if (replyTo) {
        findings.push({ id: 'reply-to', severity: 'info', title: 'Reply-To', detail: replyTo });
        const fromEmail = from ? extractEmail(from) : undefined;
        const replyEmail = extractEmail(replyTo);
        if (fromEmail && replyEmail && fromEmail !== replyEmail) {
            findings.push({
                id: 'reply-mismatch',
                severity: 'warn',
                title: 'Reply-To weicht ab',
                detail: `Antworten gehen an ${replyEmail}, nicht an ${fromEmail}.`,
            });
        }
    }

    if (returnPath && from) {
        const returnEmail = extractEmail(returnPath);
        const fromEmail = extractEmail(from);
        if (returnEmail && fromEmail && returnEmail !== fromEmail) {
            findings.push({
                id: 'return-path',
                severity: 'warn',
                title: 'Return-Path ≠ From',
                detail: `Return-Path: ${returnEmail}, From: ${fromEmail}`,
            });
        }
    }

    const hasSpf = /spf=pass/i.test(authentication);
    const hasDkim = /dkim=pass/i.test(authentication);
    const hasDmarc = /dmarc=pass/i.test(authentication);

    findings.push({
        id: 'auth',
        severity: hasSpf && hasDkim ? 'ok' : 'warn',
        title: 'Authentifizierung',
        detail: [
            `SPF: ${hasSpf ? 'pass' : 'fehlt/fehlgeschlagen'}`,
            `DKIM: ${hasDkim ? 'pass' : 'fehlt/fehlgeschlagen'}`,
            `DMARC: ${hasDmarc ? 'pass' : 'fehlt/fehlgeschlagen'}`,
        ].join(' · '),
    });

    const received = headers.get('received') ?? [];
    if (received.length > 5) {
        findings.push({
            id: 'hops',
            severity: 'info',
            title: 'Viele Server-Hops',
            detail: `${received.length} Received-Einträge — bei Phishing manchmal ungewöhnliche Routen.`,
        });
    }

    const suspiciousSubjects = ['dringend', 'konto gesperrt', 'verify', 'bestätigen', 'paypal', 'amazon'];
    const subject = (first(headers, 'subject') ?? '').toLowerCase();
    if (suspiciousSubjects.some((s) => subject.includes(s))) {
        findings.push({
            id: 'subject',
            severity: 'warn',
            title: 'Auffälliger Betreff',
            detail: first(headers, 'subject'),
        });
    }

    if (findings.every((f) => f.severity === 'info' || f.severity === 'ok')) {
        findings.push({
            id: 'ok',
            severity: 'ok',
            title: 'Keine klaren Phishing-Signale',
            detail: 'Trotzdem Vorsicht bei Links und Anhängen — dies ist nur eine Heuristik.',
        });
    }

    return findings;
}
