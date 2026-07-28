import type { FieldValues, GenerateOutput } from '../_shared/shells';

export function generateCallNotesTemplate(values: FieldValues): GenerateOutput {
    const caller = (values.caller ?? '').trim() || '[Name / Firma]';
    const topic = (values.topic ?? '').trim() || '[Thema]';
    const now = new Date().toLocaleString('de-DE');

    const lines = [
        'Anrufnotiz',
        '—',
        `Datum/Zeit: ${now}`,
        `Anrufer:    ${caller}`,
        `Thema:      ${topic}`,
        '',
        'Gesprächsinhalt:',
        '- ',
        '- ',
        '',
        'Vereinbarte nächste Schritte:',
        '[ ] Aufgabe — Verantwortlich — Frist',
        '[ ] ',
        '',
        'Rückruf nötig: [ ] Ja  [ ] Nein',
        'Follow-up am: ___________',
    ];

    return { kind: 'text', content: lines.join('\n'), filename: 'anrufnotiz.txt' };
}
