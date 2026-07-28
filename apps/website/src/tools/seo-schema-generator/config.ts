import { defineGenerateTool } from '../_shared/shells';
import type { FieldDef } from '../_shared/shells';
import { SEO_THEME } from '../_shared/seo/theme';
import { generateSchema } from './compute';

const LOCAL_FIELDS: FieldDef[] = [
    { id: 'name', type: 'text', label: 'Firmenname', placeholder: 'Muster Handwerk GmbH' },
    { id: 'street', type: 'text', label: 'Straße', placeholder: 'Musterstraße 1' },
    { id: 'zip', type: 'text', label: 'PLZ', placeholder: '10115' },
    { id: 'city', type: 'text', label: 'Ort', placeholder: 'Berlin' },
    { id: 'phone', type: 'text', label: 'Telefon', placeholder: '+49 30 123456' },
    { id: 'url', type: 'text', label: 'Website', placeholder: 'https://beispiel.de' },
];

const FAQ_FIELDS: FieldDef[] = [
    {
        id: 'questions',
        type: 'textarea',
        label: 'Fragen & Antworten',
        placeholder: 'Eine Zeile pro FAQ: Frage | Antwort',
        rows: 6,
        hint: 'Format: Frage | Antwort (Pipe getrennt)',
    },
];

export default defineGenerateTool(
    {
        catalog: {
            id: 'seo-schema-generator',
            slug: 'seo-schema-generator',
            shortTitle: 'Schema bauen',
            title: 'Schema.org JSON-LD Generator',
            sub: 'LocalBusiness oder FAQ — fertiges JSON-LD zum Einfügen in den Head.',
            pain: 'Structured Data manuell zu schreiben ist fehleranfällig.',
            solution: 'Formular ausfüllen, JSON-LD kopieren.',
            trust: 'Lokal generiert · nichts wird hochgeladen',
            tags: ['SEO', 'Schema'],
            keywords: ['schema.org', 'json-ld', 'localbusiness', 'faq', 'structured data'],
            fileHints: [],
            command: '/schema',
            entry: 'form',
            entryPlaceholder: 'Schema-Typ wählen',
            theme: SEO_THEME,
            maturity: 'stable',
            areas: ['seo'],
            storyIds: [],
        },
        fields: [
            {
                id: 'schemaType',
                type: 'segment',
                label: 'Schema-Typ',
                default: 'local-business',
                options: [
                    { value: 'local-business', label: 'LocalBusiness' },
                    { value: 'faq', label: 'FAQ' },
                ],
            },
            ...LOCAL_FIELDS,
            ...FAQ_FIELDS,
        ],
        generate: generateSchema,
        isReady: (v) => {
            if (v.schemaType === 'faq') return Boolean(v.questions?.trim());
            return Boolean(v.name?.trim());
        },
        outputTitle: 'JSON-LD',
        emptyHint: 'Schema-Typ wählen und Felder ausfüllen.',
    },
    'seo-schema-generator',
);
