import type { PasteFinding } from '../_shared/shells';

/** Format / validate JSON and return findings. */
export function analyzeJson(input: string): PasteFinding[] {
    const trimmed = input.trim();
    if (!trimmed) {
        return [{ id: 'empty', severity: 'info', title: 'Kein JSON', detail: 'JSON einfügen.' }];
    }

    try {
        const parsed = JSON.parse(trimmed) as unknown;
        const pretty = JSON.stringify(parsed, null, 2);
        const type = Array.isArray(parsed) ? 'Array' : parsed === null ? 'null' : typeof parsed;
        const findings: PasteFinding[] = [
            {
                id: 'ok',
                severity: 'ok',
                title: 'Gültiges JSON',
                detail: `Typ: ${type}`,
            },
            {
                id: 'formatted',
                severity: 'info',
                title: 'Formatiert',
                detail: pretty,
            },
        ];
        if (pretty.length > 200_000) {
            findings.push({
                id: 'large',
                severity: 'warn',
                title: 'Sehr groß',
                detail: 'Ausgabe ist sehr lang — Browser kann stocken.',
            });
        }
        return findings;
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unbekannter Parse-Fehler';
        return [
            {
                id: 'invalid',
                severity: 'error',
                title: 'Ungültiges JSON',
                detail: message,
            },
        ];
    }
}
