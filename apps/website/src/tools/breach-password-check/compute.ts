import { checkPwnedPassword } from '../_shared/security/hibp';
import type { CheckResult, FieldValues } from '../_shared/shells';

function formatCount(count: number): string {
    return count.toLocaleString('de-DE');
}

/** Check password against HIBP Pwned Passwords API (k-anonymity). */
export async function checkBreachPassword(values: FieldValues): Promise<CheckResult> {
    const password = values.password ?? '';
    if (!password) {
        return {
            ok: false,
            tone: 'info',
            heading: 'Passwort eingeben',
            message: 'Gib ein Passwort ein, um es gegen bekannte Leaks zu prüfen.',
        };
    }

    try {
        const { count, hashPrefix } = await checkPwnedPassword(password);
        if (count === 0) {
            return {
                ok: true,
                tone: 'success',
                heading: 'Nicht in Leaks gefunden',
                summary: 'Dieses Passwort taucht nicht in der HIBP-Datenbank auf.',
                details: [
                    { label: 'Gesendeter Hash-Prefix', value: `${hashPrefix}… (5 Zeichen)` },
                    { label: 'Treffer', value: '0' },
                ],
                message: 'Trotzdem: einzigartige Passwörter pro Dienst nutzen.',
            };
        }

        return {
            ok: false,
            tone: 'danger',
            heading: 'In Leaks gefunden',
            summary: `Dieses Passwort wurde ${formatCount(count)}× in Datenlecks gesehen.`,
            details: [
                { label: 'Gesendeter Hash-Prefix', value: `${hashPrefix}… (5 Zeichen)` },
                { label: 'Treffer in HIBP', value: formatCount(count) },
            ],
            message: 'Sofort ändern — und nirgends mehr verwenden.',
        };
    } catch (err) {
        return {
            ok: false,
            tone: 'danger',
            heading: 'Prüfung fehlgeschlagen',
            message: err instanceof Error ? err.message : 'Netzwerkfehler bei HIBP.',
        };
    }
}
