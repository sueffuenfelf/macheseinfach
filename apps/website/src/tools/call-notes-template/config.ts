import { defineGenerateTool } from '../_shared/shells';
import { KOMMUNIKATION_THEME, TRUST_LOCAL } from '../_shared/kommunikation/theme';
import { generateCallNotesTemplate } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'call-notes-template',
            slug: 'call-notes-template',
            shortTitle: 'Anrufnotiz',
            title: 'Anrufnotiz-Vorlage',
            sub: 'Strukturierte Notiz nach Telefonat — zum Ausfüllen.',
            pain: 'Nach dem Call fehlt Struktur für die Dokumentation.',
            solution: 'Anrufer und Thema eingeben — Notizvorlage erzeugen.',
            trust: TRUST_LOCAL,
            tags: ['Kommunikation', 'Schreiben', 'Checkliste'],
            keywords: ['anrufnotiz vorlage', 'telefonnotiz muster', 'gesprächsnotiz'],
            fileHints: [],
            command: '/anrufnotiz',
            entry: 'form',
            entryPlaceholder: 'Anrufer, Thema …',
            theme: KOMMUNIKATION_THEME,
            maturity: 'stable',
            areas: ['kommunikation'],
            storyIds: [],
        },
        fields: [
            { id: 'caller', type: 'text', label: 'Anrufer', placeholder: 'Firma / Name' },
            { id: 'topic', type: 'text', label: 'Thema', placeholder: 'Angebot, Support, Rückruf …' },
        ],
        generate: generateCallNotesTemplate,
        isReady: () => true,
        outputTitle: 'Notizvorlage',
    },
    'call-notes-template',
);
