import type { FieldValues, GenerateOutput } from '../_shared/shells';

export function generateMeetingAgenda(values: FieldValues): GenerateOutput {
    const title = (values.title ?? '').trim() || 'Meeting';
    const duration = (values.duration ?? '').trim() || '30';
    const attendees = (values.attendees ?? '').trim();

    const lines = [
        `Agenda: ${title}`,
        `Dauer (geplant): ca. ${duration} Minuten`,
        attendees ? `Teilnehmer: ${attendees}` : '',
        '—',
        '',
        '1. Begrüßung & Ziel (2 Min)',
        '   - Ziel des Calls in einem Satz',
        '',
        '2. Status / Updates (10 Min)',
        '   - [ ] Punkt 1',
        '   - [ ] Punkt 2',
        '',
        '3. Entscheidungen & Blocker (10 Min)',
        '   - Entscheidung:',
        '   - Blocker / Verantwortlich:',
        '',
        '4. Nächste Schritte (5 Min)',
        '   - [ ] Aufgabe — Verantwortlich — bis Datum',
        '',
        '5. Abschluss (3 Min)',
        '   - Zusammenfassung',
        '   - Nächster Termin',
    ].filter(Boolean);

    return { kind: 'text', content: lines.join('\n'), filename: 'meeting-agenda.txt' };
}
