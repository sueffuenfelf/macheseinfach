import { checkPwnedPassword } from '../_shared/security/hibp';
import type { CheckResult, FieldValues } from '../_shared/shells';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatCount(count: number): string {
    return count.toLocaleString('de-DE');
}

/** Unified leak check — email guidance + password HIBP k-anonymity. */
export async function checkPwned(values: FieldValues): Promise<CheckResult> {
    const mode = values.mode ?? 'password';
    const input = (values.input ?? '').trim();

    if (!input) {
        return {
            ok: false,
            tone: 'info',
            heading: 'Eingabe fehlt',
            message: mode === 'email' ? 'Gib eine E-Mail-Adresse ein.' : 'Gib ein Passwort ein.',
        };
    }

    if (mode === 'email') {
        if (!EMAIL_RE.test(input)) {
            return {
                ok: false,
                tone: 'danger',
                heading: 'Ungültige E-Mail',
                message: 'Bitte eine gültige E-Mail-Adresse eingeben.',
            };
        }

        return {
            ok: false,
            tone: 'warn',
            heading: 'E-Mail-Leak: direkt bei HIBP prüfen',
            summary: `Für ${input}`,
            details: [
                {
                    label: 'Warum nicht hier?',
                    value: 'HIBP erlaubt E-Mail-Abfragen nur mit API-Schlüssel — nicht sicher im Browser.',
                },
                {
                    label: 'Empfehlung',
                    value: 'haveibeenpwned.com — offizielle, kostenlose E-Mail-Prüfung',
                },
            ],
            message:
                'Für Passwort-Leaks nutze den Modus „Passwort" oder das Tool „Passwort-Leak prüfen".',
        };
    }

    try {
        const { count, hashPrefix } = await checkPwnedPassword(input);
        if (count === 0) {
            return {
                ok: true,
                tone: 'success',
                heading: 'Passwort nicht geleakt',
                summary: 'Kein Treffer in der HIBP-Passwort-Datenbank.',
                details: [{ label: 'Hash-Prefix gesendet', value: `${hashPrefix}…` }],
            };
        }
        return {
            ok: false,
            tone: 'danger',
            heading: 'Passwort in Leaks',
            summary: `${formatCount(count)}× in Datenlecks gesehen.`,
            details: [{ label: 'Hash-Prefix gesendet', value: `${hashPrefix}…` }],
            message: 'Passwort sofort ändern.',
        };
    } catch (err) {
        return {
            ok: false,
            tone: 'danger',
            heading: 'Prüfung fehlgeschlagen',
            message: err instanceof Error ? err.message : 'Netzwerkfehler.',
        };
    }
}
