import { defineTool } from '../types';
import { KREATIV_THEME, TRUST_LOCAL } from '../_shared/color';
import { FaviconPackTool } from './FaviconPackTool';

export default defineTool(
    {
        catalog: {
            id: 'favicon-pack',
            slug: 'favicon-pack',
            shortTitle: 'Favicon-Paket',
            title: 'Favicon-Paket erzeugen',
            sub: 'PNG in 16–512 px — Standardgrößen zum Download.',
            pain: 'Brauche alle Favicon-Größen für die Website.',
            solution: 'Quadratisches Bild hochladen — Größen einzeln laden.',
            trust: TRUST_LOCAL,
            tags: ['Farbe', 'Foto', 'Upload'],
            keywords: ['favicon generator', 'favicon erstellen', 'apple touch icon'],
            fileHints: ['png', 'jpg', 'webp'],
            command: '/favicon',
            entry: 'file',
            theme: KREATIV_THEME,
            maturity: 'stable',
            areas: ['kreativ'],
            storyIds: [],
        },
        page: FaviconPackTool,
    },
    'favicon-pack',
);
