import { defineExtractTool } from '../_shared/shells';
import { KREATIV_THEME, TRUST_LOCAL } from '../_shared/color';
import { extractImageColors } from './compute';

export default defineExtractTool(
    {
        catalog: {
            id: 'image-color-pick', slug: 'image-color-pick', shortTitle: 'Farbe aus Bild',
            title: 'Farbe aus Bild picken',
            sub: 'Dominante Hex-Farben aus Upload — lokal per Canvas.',
            pain: 'Welche Farbe hat das Logo auf dem Screenshot?',
            solution: 'Bild hochladen — Hex-Werte kopieren.',
            trust: TRUST_LOCAL,
            tags: ['Farbe', 'Foto', 'Upload'],
            keywords: ['farbcode aus bild', 'color picker image', 'dominante farbe'],
            fileHints: ['png', 'jpg', 'jpeg', 'webp'],
            command: '/colorpick', entry: 'file', theme: KREATIV_THEME,
            maturity: 'stable', areas: ['kreativ'], storyIds: [],
        },
        extract: extractImageColors,
        mode: 'file',
        accept: 'image/*',
        submitLabel: 'Farben extrahieren',
    }, 'image-color-pick',
);
