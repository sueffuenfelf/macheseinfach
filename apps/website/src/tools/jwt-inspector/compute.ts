import type { PasteFinding } from '../_shared/shells';

function base64UrlDecode(segment: string): string {
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    const binary = atob(padded + pad);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

function tryParseJson(raw: string): { ok: true; value: unknown } | { ok: false; error: string } {
    try {
        return { ok: true, value: JSON.parse(raw) };
    } catch {
        return { ok: false, error: 'Kein gültiges JSON' };
    }
}

function formatJson(value: unknown): string {
    return JSON.stringify(value, null, 2);
}

/** Decode JWT header and payload locally — no signature verification. */
export function analyzeJwt(input: string): PasteFinding[] {
    const trimmed = input.trim();
    if (!trimmed) {
        return [
            {
                id: 'empty',
                severity: 'info',
                title: 'Kein JWT',
                detail: 'Füge einen JWT-String ein (drei durch Punkte getrennte Teile).',
            },
        ];
    }

    const parts = trimmed.split('.');
    if (parts.length !== 3) {
        return [
            {
                id: 'format',
                severity: 'error',
                title: 'Ungültiges JWT-Format',
                detail: `Erwartet 3 Segmente (Header.Payload.Signature), gefunden: ${parts.length}.`,
            },
        ];
    }

    const findings: PasteFinding[] = [];
    const [headerSeg, payloadSeg] = parts;

    const headerRaw = base64UrlDecode(headerSeg);
    const header = tryParseJson(headerRaw);
    if (header.ok) {
        findings.push({
            id: 'header',
            severity: 'info',
            title: 'Header',
            detail: formatJson(header.value),
        });
        const alg = (header.value as { alg?: string })?.alg;
        if (alg === 'none') {
            findings.push({
                id: 'alg-none',
                severity: 'error',
                title: 'Algorithmus „none“',
                detail: 'Ein JWT mit alg=none ist unsicher und sollte abgelehnt werden.',
            });
        }
    } else {
        findings.push({
            id: 'header-error',
            severity: 'error',
            title: 'Header nicht lesbar',
            detail: header.error,
        });
    }

    const payloadRaw = base64UrlDecode(payloadSeg);
    const payload = tryParseJson(payloadRaw);
    if (payload.ok) {
        findings.push({
            id: 'payload',
            severity: 'info',
            title: 'Payload',
            detail: formatJson(payload.value),
        });

        const exp = (payload.value as { exp?: number })?.exp;
        if (typeof exp === 'number') {
            const expDate = new Date(exp * 1000);
            const expired = expDate.getTime() < Date.now();
            findings.push({
                id: 'exp',
                severity: expired ? 'warn' : 'ok',
                title: expired ? 'Token abgelaufen' : 'Ablauf (exp)',
                detail: `${expDate.toLocaleString('de-DE')} (${expired ? 'abgelaufen' : 'noch gültig'})`,
            });
        }

        const sub = (payload.value as { sub?: string })?.sub;
        if (sub) {
            findings.push({
                id: 'sub',
                severity: 'info',
                title: 'Subject (sub)',
                detail: sub,
            });
        }
    } else {
        findings.push({
            id: 'payload-error',
            severity: 'error',
            title: 'Payload nicht lesbar',
            detail: payload.error,
        });
    }

    findings.push({
        id: 'no-verify',
        severity: 'warn',
        title: 'Signatur nicht geprüft',
        detail: 'Dieses Tool dekodiert nur — es prüft die Signatur nicht. Vertraue JWTs nie blind.',
    });

    return findings;
}
