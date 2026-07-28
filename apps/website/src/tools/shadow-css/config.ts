import { defineGenerateTool } from '../_shared/shells';
import { KREATIV_THEME, TRUST_LOCAL } from '../_shared/color';
import { generateShadowCss } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'shadow-css', slug: 'shadow-css', shortTitle: 'Box-Shadow',
            title: 'CSS Box-Shadow Generator',
            sub: 'Neo-brutalist oder weicher Schatten — Copy-Paste.',
            pain: 'box-shadow Syntax ist umständlich.',
            solution: 'Offset, Weichzeichner und Farbe — CSS fertig.',
            trust: TRUST_LOCAL,
            tags: ['CSS', 'Farbe'],
            keywords: ['box shadow generator', 'css schatten', 'neo brutalist shadow'],
            fileHints: [], command: '/shadow', entry: 'form', theme: KREATIV_THEME,
            maturity: 'stable', areas: ['kreativ'], storyIds: [],
        },
        fields: [
            { id: 'style', type: 'segment', label: 'Stil', default: 'brutal',
              options: [{ value: 'brutal', label: 'Brutal' }, { value: 'soft', label: 'Weich' }] },
            { id: 'x', type: 'number', label: 'X (px)', default: '4' },
            { id: 'y', type: 'number', label: 'Y (px)', default: '4' },
            { id: 'blur', type: 'number', label: 'Blur (px)', default: '8' },
            { id: 'spread', type: 'number', label: 'Spread (px)', default: '0' },
            { id: 'color', type: 'text', label: 'Farbe', default: '#000000' },
        ],
        generate: generateShadowCss,
        isReady: () => true,
        outputTitle: 'CSS',
    }, 'shadow-css',
);
