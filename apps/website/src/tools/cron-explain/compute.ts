import cronstrue from 'cronstrue/i18n';
import type { FieldValues, GenerateOutput } from '../_shared/shells';

/** Explain a 5- or 6-field cron expression in German. */
export function generateCronExplain(values: FieldValues): GenerateOutput {
    const expr = (values.expr ?? '').trim();
    if (!expr) return null;

    try {
        const description = cronstrue.toString(expr, {
            locale: 'de',
            use24HourTimeFormat: true,
        });
        return {
            kind: 'text',
            content: `${expr}\n\n→ ${description}`,
            filename: 'cron.txt',
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Ungültiger Cron-Ausdruck';
        return {
            kind: 'text',
            content: `Fehler: ${message}`,
            filename: 'cron-error.txt',
        };
    }
}
