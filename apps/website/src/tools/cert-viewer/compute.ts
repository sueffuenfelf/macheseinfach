import type { PasteFinding } from '../_shared/shells';

function extractPemBlocks(input: string): string[] {
    const matches = input.match(
        /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g,
    );
    return matches ?? [];
}

/** Parse X.509 PEM certificates using the browser X509Certificate API. */
export function analyzeCertificate(input: string): PasteFinding[] {
    const trimmed = input.trim();
    if (!trimmed) {
        return [
            {
                id: 'empty',
                severity: 'info',
                title: 'Kein Zertifikat',
                detail: 'Füge einen PEM-Block ein (-----BEGIN CERTIFICATE-----).',
            },
        ];
    }

    const blocks = extractPemBlocks(trimmed);
    if (blocks.length === 0) {
        return [
            {
                id: 'no-pem',
                severity: 'error',
                title: 'Kein PEM-Block gefunden',
                detail: 'Erwartet -----BEGIN CERTIFICATE----- … -----END CERTIFICATE-----',
            },
        ];
    }

    if (typeof globalThis.X509Certificate === 'undefined') {
        return [
            {
                id: 'unsupported',
                severity: 'error',
                title: 'Browser nicht unterstützt',
                detail: 'X509Certificate wird in diesem Browser nicht unterstützt.',
            },
        ];
    }

    const findings: PasteFinding[] = [];

    for (let i = 0; i < blocks.length; i++) {
        try {
            const cert = new globalThis.X509Certificate(blocks[i]);
            const now = Date.now();
            const validFrom = new Date(cert.validFrom).getTime();
            const validTo = new Date(cert.validTo).getTime();
            const expired = now > validTo;
            const notYetValid = now < validFrom;

            findings.push({
                id: `cert-${i}-subject`,
                severity: 'info',
                title: blocks.length > 1 ? `Zertifikat ${i + 1}: Subject` : 'Subject',
                detail: cert.subject,
            });
            findings.push({
                id: `cert-${i}-issuer`,
                severity: 'info',
                title: 'Issuer',
                detail: cert.issuer,
            });
            findings.push({
                id: `cert-${i}-validity`,
                severity: expired || notYetValid ? 'warn' : 'ok',
                title: expired ? 'Abgelaufen' : notYetValid ? 'Noch nicht gültig' : 'Gültigkeit',
                detail: `${cert.validFrom} → ${cert.validTo}`,
            });
            findings.push({
                id: `cert-${i}-fp`,
                severity: 'info',
                title: 'SHA-256 Fingerprint',
                detail: cert.fingerprint256 ?? cert.fingerprint,
            });
            if (cert.subjectAltName) {
                findings.push({
                    id: `cert-${i}-san`,
                    severity: 'info',
                    title: 'Subject Alternative Names',
                    detail: cert.subjectAltName,
                });
            }
        } catch (err) {
            findings.push({
                id: `cert-${i}-error`,
                severity: 'error',
                title: `Zertifikat ${i + 1} nicht lesbar`,
                detail: err instanceof Error ? err.message : 'Parse-Fehler',
            });
        }
    }

    return findings;
}
