import { defineExtractTool } from '../_shared/shells';
import { extractPdfText } from '../_shared/pdf/extract-text';

const DOKUMENTE_THEME = {
    accent: '#90a8ed',
    accentStrong: '#000',
    accentSoft: '#e6ecfb',
} as const;

export default defineExtractTool(
    {
        catalog: {
            id: 'pdf-extract-text',
            slug: 'pdf-extract-text',
            shortTitle: 'PDF-Text kopieren',
            title: 'Text aus PDF kopieren',
            sub: 'Markierbaren Text aus nativen PDFs extrahieren — ohne Upload ins Internet.',
            pain: 'Text aus PDF kopieren geht nicht oder nur Seite für Seite.',
            solution: 'PDF laden, Text anzeigen und mit einem Klick kopieren.',
            trust: 'Datei bleibt auf deinem Gerät',
            tags: ['PDF', 'Text'],
            keywords: [
                'pdf text kopieren',
                'text aus pdf',
                'pdf text extrahieren',
                'copy text from pdf',
                'pdf zu text',
            ],
            fileHints: ['pdf'],
            command: '/pdf text',
            entry: 'file',
            theme: DOKUMENTE_THEME,
            maturity: 'beta',
            areas: ['dokumente'],
        },
        extract: async ({ file }) => {
            if (!file) throw new Error('Bitte eine PDF-Datei auswählen.');
            const result = await extractPdfText(file);
            if (!result.fullText.trim()) {
                return [];
            }
            const fields = [
                {
                    id: 'full',
                    label: 'Gesamter Text',
                    value: result.fullText,
                    mono: true,
                },
            ];
            if (result.pageCount > 1) {
                for (const page of result.pages) {
                    if (!page.text.trim()) continue;
                    fields.push({
                        id: `page-${page.pageIndex + 1}`,
                        label: `Seite ${page.pageIndex + 1}`,
                        value: page.text,
                        mono: true,
                    });
                }
            }
            return fields;
        },
        mode: 'file',
        accept: 'application/pdf,.pdf',
        submitLabel: 'Text extrahieren',
        emptyHint: 'Kein Text gefunden — vielleicht ist die PDF nur ein Scan. Dann hilft OCR.',
    },
    'pdf-extract-text',
);
