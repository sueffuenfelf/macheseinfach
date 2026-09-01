import { defineCheckTool } from '../_shared/shells';
import { EINHEITEN_THEME, EINHEITEN_TRUST } from '../_shared/units';
import { checkPaperSize } from './compute';

export default defineCheckTool(
    {
        catalog: {
            id: 'paper-size',
            slug: 'paper-size',
            shortTitle: 'Papierformate',
            title: 'Papierformate A-Serie',
            sub: 'A4, A5 und mehr — Maße in mm und Pixel bei deiner DPI.',
            pain: 'Wie groß ist A4 in Pixel für den Druck?',
            solution: 'Format wählen — Standardmaße und Pixel sofort sehen.',
            trust: EINHEITEN_TRUST,
            tags: ['Umwandeln', 'Prüfen'],
            keywords: ['a4 maße', 'a4 pixel', 'papierformat größe', 'a5 mm'],
            fileHints: [],
            command: '/papierformat',
            entry: 'form',
            entryPlaceholder: 'Format wählen …',
            theme: EINHEITEN_THEME,
            maturity: 'stable',
            areas: ['einheiten'],
        },
        fields: [
            {
                id: 'format',
                type: 'segment',
                label: 'Format',
                default: 'A4',
                options: [
                    { value: 'A3', label: 'A3' },
                    { value: 'A4', label: 'A4' },
                    { value: 'A5', label: 'A5' },
                    { value: 'A6', label: 'A6' },
                ],
            },
            {
                id: 'dpi',
                type: 'number',
                label: 'DPI',
                default: '300',
                placeholder: '300',
            },
            {
                id: 'width',
                type: 'number',
                label: 'Breite (mm)',
                placeholder: 'optional',
                hint: 'Leer lassen für Standardmaße — oder zum Abgleich eingeben.',
            },
            {
                id: 'height',
                type: 'number',
                label: 'Höhe (mm)',
                placeholder: 'optional',
            },
        ],
        check: checkPaperSize,
        autoCheck: true,
        trustNote: EINHEITEN_TRUST,
    },
    'paper-size',
);
