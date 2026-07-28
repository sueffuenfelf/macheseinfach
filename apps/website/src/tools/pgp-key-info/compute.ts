import type { PasteFinding } from '../_shared/shells';

const ARMOR_RE =
    /-----BEGIN PGP (PUBLIC KEY BLOCK|PRIVATE KEY BLOCK|SIGNATURE)-----([\s\S]*?)-----END PGP \1-----/g;

/** Lightweight OpenPGP armored block parser — metadata only, no crypto verify. */
export function analyzePgpKey(input: string): PasteFinding[] {
    const trimmed = input.trim();
    if (!trimmed) {
        return [
            {
                id: 'empty',
                severity: 'info',
                title: 'Kein Key-Block',
                detail: 'Füge einen ASCII-armored OpenPGP-Block ein.',
            },
        ];
    }

    const findings: PasteFinding[] = [];
    const matches = [...trimmed.matchAll(ARMOR_RE)];

    if (matches.length === 0) {
        return [
            {
                id: 'no-block',
                severity: 'error',
                title: 'Kein gültiger PGP-Block',
                detail: 'Erwartet -----BEGIN PGP PUBLIC KEY BLOCK----- (oder PRIVATE KEY BLOCK).',
            },
        ];
    }

    for (let i = 0; i < matches.length; i++) {
        const full = matches[i][0];
        const kind = matches[i][1];
        const body = matches[i][2] ?? '';

        const headerLines = body
            .split('\n')
            .filter((line) => line.startsWith('Comment:') || line.startsWith('Version:'));
        const comments = headerLines
            .filter((l) => l.startsWith('Comment:'))
            .map((l) => l.replace(/^Comment:\s*/, '').trim());
        const version = headerLines.find((l) => l.startsWith('Version:'));

        const isPrivate = kind?.includes('PRIVATE');

        findings.push({
            id: `block-${i}-type`,
            severity: isPrivate ? 'warn' : 'info',
            title: `Block ${i + 1}: ${kind}`,
            detail: isPrivate
                ? 'Privater Schlüssel — niemals teilen oder hochladen!'
                : 'Öffentlicher Schlüssel',
        });

        if (version) {
            findings.push({
                id: `block-${i}-version`,
                severity: 'info',
                title: 'Version',
                detail: version.replace(/^Version:\s*/, ''),
            });
        }

        if (comments.length) {
            findings.push({
                id: `block-${i}-comments`,
                severity: 'info',
                title: 'Kommentare / User-ID-Hinweise',
                detail: comments.join(' · '),
            });
        }

        const base64 = body
            .split('\n')
            .filter((line) => line && !line.startsWith('Comment:') && !line.startsWith('Version:'))
            .join('');
        const approxBytes = Math.floor((base64.length * 3) / 4);
        findings.push({
            id: `block-${i}-size`,
            severity: 'info',
            title: 'Geschätzte Größe',
            detail: `~${approxBytes} Bytes Payload`,
        });
    }

    findings.push({
        id: 'no-fingerprint',
        severity: 'info',
        title: 'Fingerprint nicht berechnet',
        detail: 'Vollständige Key-Infos (Fingerprint, Ablauf) erfordern eine OpenPGP-Bibliothek — hier nur Block-Metadaten.',
    });

    return findings;
}
