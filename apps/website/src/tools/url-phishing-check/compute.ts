import type { CheckResult, FieldValues } from '../_shared/shells';

const SUSPICIOUS_TLDS = new Set([
    'zip',
    'mov',
    'top',
    'xyz',
    'click',
    'loan',
    'work',
    'gq',
    'tk',
    'ml',
    'cf',
    'ga',
]);

const HOMOGRAPH_CHARS = /[^\u0000-\u007F]/;

function decodePunycode(hostname: string): string {
    try {
        if (typeof URL !== 'undefined' && 'canParse' in URL) {
            const url = new URL(`http://${hostname}`);
            return url.hostname;
        }
    } catch {
        // fall through
    }
    return hostname;
}

/** URL phishing heuristics — IDN, homographs, suspicious patterns. */
export function checkUrlPhishing(values: FieldValues): CheckResult {
    const raw = (values.url ?? '').trim();
    if (!raw) {
        return {
            ok: false,
            tone: 'info',
            heading: 'URL eingeben',
            message: 'Gib eine URL oder einen Link ein.',
        };
    }

    let parsed: URL;
    try {
        const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
        parsed = new URL(withScheme);
    } catch {
        return {
            ok: false,
            tone: 'danger',
            heading: 'Ungültige URL',
            message: 'Die Eingabe konnte nicht als URL gelesen werden.',
        };
    }

    const warnings: string[] = [];
    const hostname = parsed.hostname;
    const decodedHost = decodePunycode(hostname);

    if (HOMOGRAPH_CHARS.test(hostname)) {
        warnings.push('Nicht-ASCII-Zeichen in der Domain (IDN/Homograph-Risiko)');
    }
    if (hostname.startsWith('xn--')) {
        warnings.push(`Punycode-Domain — dekodiert: ${decodedHost}`);
    }
    if (hostname !== decodedHost && decodedHost !== hostname) {
        warnings.push(`Angezeigte Domain kann abweichen: ${decodedHost}`);
    }

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
        warnings.push('IP-Adresse statt Domainname');
    }

    if (parsed.username || parsed.password) {
        warnings.push('Enthält Benutzername/Passwort in der URL (@-Trick möglich)');
    }

    const tld = hostname.split('.').pop()?.toLowerCase();
    if (tld && SUSPICIOUS_TLDS.has(tld)) {
        warnings.push(`Auffällige TLD: .${tld}`);
    }

    const labelCount = hostname.split('.').length;
    if (labelCount >= 4) {
        warnings.push('Viele Subdomains — kann Täuschung verschleiern');
    }

    const haystack = `${hostname}${parsed.pathname}`.toLowerCase();
    const brands = ['paypal', 'amazon', 'apple', 'microsoft', 'sparkasse', 'volksbank', 'postbank'];
    for (const brand of brands) {
        if (haystack.includes(brand) && !hostname.endsWith(`${brand}.com`) && !hostname.endsWith(`${brand}.de`)) {
            warnings.push(`Markenname „${brand}" in URL, aber nicht offizielle Domain`);
            break;
        }
    }

    if (parsed.protocol === 'http:') {
        warnings.push('Unverschlüsselt (http) — keine sichere Verbindung');
    }

    const ok = warnings.length === 0;

    return {
        ok,
        tone: ok ? 'success' : warnings.length >= 2 ? 'danger' : 'warn',
        heading: ok ? 'Keine offensichtlichen Warnsignale' : 'Vorsicht — Auffälligkeiten',
        summary: `${parsed.protocol}//${hostname}${parsed.pathname}`,
        details: [
            { label: 'Host', value: hostname },
            { label: 'Pfad', value: parsed.pathname || '/' },
            ...(warnings.length
                ? [{ label: 'Hinweise', value: warnings.join(' · ') }]
                : [{ label: 'Prüfung', value: 'Keine IDN-/Homograph-Warnungen erkannt' }]),
        ],
        message: ok
            ? 'Trotzdem: Links nie blind anklicken — Domain im Browser prüfen.'
            : 'Prüfe die URL genau, bevor du Daten eingibst.',
    };
}
