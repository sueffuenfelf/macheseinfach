import { defineGenerateTool } from '../_shared/shells';
import { KOMMUNIKATION_THEME, TRUST_LOCAL } from '../_shared/kommunikation/theme';
import { generateIcsInvite } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'ics-invite',
            slug: 'ics-invite',
            shortTitle: 'Kalender-Einladung',
            title: 'ICS-Kalendereinladung erzeugen',
            sub: '.ics-Datei für Outlook, Google Calendar und Apple.',
            pain: 'Meeting einladen — ohne Kalender-App manuell tippen.',
            solution: 'Titel, Datum und Uhrzeit eingeben — .ics herunterladen.',
            trust: TRUST_LOCAL,
            tags: ['Kommunikation', 'Kalender'],
            keywords: ['ics datei erstellen', 'kalendereinladung generieren', 'outlook einladung ics'],
            fileHints: [],
            command: '/ics',
            entry: 'form',
            entryPlaceholder: 'Meeting-Titel …',
            theme: KOMMUNIKATION_THEME,
            maturity: 'stable',
            areas: ['kommunikation'],
            storyIds: [],
        },
        fields: [
            { id: 'title', type: 'text', label: 'Titel', placeholder: 'Projekt-Abstimmung' },
            { id: 'date', type: 'date', label: 'Datum' },
            { id: 'startTime', type: 'text', label: 'Beginn', default: '10:00', placeholder: '10:00' },
            { id: 'endTime', type: 'text', label: 'Ende', default: '11:00', placeholder: '11:00' },
            { id: 'location', type: 'text', label: 'Ort / Link', placeholder: 'Zoom oder Adresse' },
            {
                id: 'description',
                type: 'textarea',
                label: 'Beschreibung',
                placeholder: 'Agenda, Link, Hinweise …',
                rows: 3,
            },
        ],
        generate: generateIcsInvite,
        isReady: (v) => Boolean(v.title?.trim() && v.date?.trim()),
        outputTitle: 'ICS-Datei',
    },
    'ics-invite',
);
