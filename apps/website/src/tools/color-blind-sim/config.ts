import { defineTool } from '../types';
import { A11Y_THEME, TRUST_LOCAL } from '../_shared/color';
import { ColorBlindSimTool } from './ColorBlindSimTool';

export default defineTool(
    {
        catalog: {
            id: 'color-blind-sim',
            slug: 'color-blind-sim',
            shortTitle: 'Farbblind',
            title: 'Farbblind-Simulation',
            sub: 'Palette für Deuteranopie, Protanopie und Tritanopie prüfen.',
            pain: 'Rot/Grün-Unterscheidung — sehen andere das auch so?',
            solution: 'Drei Farben eingeben — Original vs. Simulation vergleichen.',
            trust: TRUST_LOCAL,
            tags: ['A11y', 'Farbe', 'Prüfen'],
            keywords: ['farbblindheit simulation', 'deuteranopie simulator', 'color blind'],
            fileHints: [],
            command: '/farbblind',
            entry: 'form',
            theme: A11Y_THEME,
            maturity: 'stable',
            areas: ['barrierefreiheit'],
            storyIds: [],
        },
        page: ColorBlindSimTool,
    },
    'color-blind-sim',
);
