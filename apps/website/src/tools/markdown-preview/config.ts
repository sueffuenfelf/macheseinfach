import { defineGenerateTool } from '../_shared/shells';
import { generateMarkdownPreview } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'markdown-preview',
            slug: 'markdown-preview',
            shortTitle: 'Markdown-Vorschau',
            title: 'Markdown → HTML (sicher)',
            sub: 'Markdown in sicheres HTML umwandeln — ohne Raw-HTML, XSS-frei.',
            pain: 'README oder Notion-Notiz prüfen, bevor sie online geht.',
            solution: 'Markdown einfügen — HTML-Vorschau als Code zum Kopieren.',
            trust: 'Lokal gerendert · Raw-HTML wird escaped',
            tags: ['Text', 'Markdown', 'Schreiben'],
            keywords: [
                'markdown preview',
                'markdown zu html',
                'md vorschau',
                'markdown konverter',
            ],
            fileHints: [],
            command: '/md',
            entry: 'form',
            entryPlaceholder: 'Markdown …',
            theme: { accent: '#7dd3c0', accentStrong: '#000', accentSoft: '#e8f7f3' },
            maturity: 'stable',
            areas: ['text'],
            storyIds: ['story-markdown-vorschau'],
        },
        fields: [
            {
                id: 'text',
                type: 'textarea',
                label: 'Markdown',
                placeholder: '# Überschrift\n\n**fett** und Liste …',
                rows: 12,
            },
        ],
        generate: generateMarkdownPreview,
        isReady: (v) => (v.text ?? '').trim().length > 0,
        outputTitle: 'HTML (sicher)',
        emptyHint: 'Markdown einfügen — sicheres HTML erscheint hier.',
    },
    'markdown-preview',
);
