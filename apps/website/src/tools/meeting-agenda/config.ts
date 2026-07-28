import { defineGenerateTool } from '../_shared/shells';
import { KOMMUNIKATION_THEME, TRUST_LOCAL } from '../_shared/kommunikation/theme';
import { generateMeetingAgenda } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'meeting-agenda',
            slug: 'meeting-agenda',
            shortTitle: 'Agenda-Gerüst',
            title: 'Meeting-Agenda in 30 Sekunden',
            sub: 'Strukturierte Agenda — zum Kopieren und Anpassen.',
            pain: 'Kurz vor dem Call — noch keine Agenda.',
            solution: 'Titel und Dauer eingeben — Agenda-Gerüst erzeugen.',
            trust: TRUST_LOCAL,
            tags: ['Kommunikation', 'Schreiben', 'Checkliste'],
            keywords: ['meeting agenda vorlage', 'besprechungsprotokoll struktur', 'agenda template'],
            fileHints: [],
            command: '/agenda',
            entry: 'form',
            entryPlaceholder: 'Meeting-Titel …',
            theme: KOMMUNIKATION_THEME,
            maturity: 'stable',
            areas: ['kommunikation'],
            storyIds: [],
        },
        fields: [
            { id: 'title', type: 'text', label: 'Meeting-Titel', placeholder: 'Wöchentliches Standup' },
            { id: 'duration', type: 'number', label: 'Dauer', default: '30', suffix: 'Min' },
            {
                id: 'attendees',
                type: 'text',
                label: 'Teilnehmer',
                placeholder: 'Team A, Kunde B (optional)',
            },
        ],
        generate: generateMeetingAgenda,
        isReady: () => true,
        outputTitle: 'Agenda',
    },
    'meeting-agenda',
);
