import { defineCalcTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, TRUST_LOCAL, WOHNEN_THEME } from '../_shared/wohnen/theme';
import { computeRentNoticePeriod } from './compute';

function todayIso(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export default defineCalcTool(
    {
        catalog: {
            id: 'rent-notice-period',
            slug: 'rent-notice-period',
            shortTitle: 'Mietkündigungsfrist',
            title: 'Mietkündigungsfrist rechnen',
            sub: 'Wann muss die Kündigung raus — grobe Orientierung nach BGB §573c.',
            pain: 'Unsicher, bis wann die Kündigung bei der Gegenseite sein muss.',
            solution: 'Rolle und Daten eingeben — frühestes Vertragsende erscheint lokal.',
            trust: TRUST_LOCAL,
            tags: ['Miete', 'Vertrag', 'Rechnen'],
            keywords: [
                'mietkündigungsfrist',
                'kündigungsfrist mietvertrag',
                'wann kündigen wohnung',
                'kündigung miete',
            ],
            fileHints: [],
            command: '/mietkuendigung',
            entry: 'form',
            entryPlaceholder: 'Mietbeginn …',
            theme: WOHNEN_THEME,
            maturity: 'stable',
            areas: ['wohnen'],
            storyIds: ['story-kuendigung-miete'],
        },
        fields: [
            {
                id: 'role',
                type: 'segment',
                label: 'Wer kündigt?',
                default: 'tenant',
                options: [
                    { value: 'tenant', label: 'Mieter:in' },
                    { value: 'landlord', label: 'Vermieter:in' },
                ],
            },
            {
                id: 'start',
                type: 'date',
                label: 'Mietbeginn',
            },
            {
                id: 'today',
                type: 'date',
                label: 'Kündigung am',
                default: todayIso(),
                hint: 'Tag, an dem die Kündigung voraussichtlich zugeht.',
            },
        ],
        compute: computeRentNoticePeriod,
        intro: `${TRUST_LOCAL} ${DISCLAIMER_NO_LEGAL} Vertragliche Sonderregeln und befristete Mietverhältnisse können abweichen.`,
    },
    'rent-notice-period',
);
