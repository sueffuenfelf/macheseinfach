import { defineCalcTool } from '../_shared/shells';
import { EINHEITEN_THEME, EINHEITEN_TRUST } from '../_shared/units';
import { computeFileSizeConvert } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'file-size-convert',
            slug: 'file-size-convert',
            shortTitle: 'Dateigröße',
            title: 'Dateigröße umrechnen',
            sub: 'Bytes, KB, MB, GB und TB — für Upload-Limits und Speicher.',
            pain: 'Portal erlaubt 5 MB — wie viel ist das in KB?',
            solution: 'Wert und Einheiten wählen — Ergebnis sofort, lokal.',
            trust: EINHEITEN_TRUST,
            tags: ['Umwandeln'],
            keywords: ['mb in gb', 'dateigröße umrechnen', 'bytes zu mb', 'kb mb gb'],
            fileHints: [],
            command: '/dateigroesse',
            entry: 'form',
            entryPlaceholder: 'z. B. 1024',
            theme: EINHEITEN_THEME,
            maturity: 'stable',
            areas: ['einheiten'],
            storyIds: ['story-dateigroesse'],
        },
        fields: [
            {
                id: 'value',
                type: 'number',
                label: 'Wert',
                placeholder: 'z. B. 1024',
            },
            {
                id: 'from',
                type: 'segment',
                label: 'Von',
                default: 'MB',
                options: [
                    { value: 'B', label: 'B' },
                    { value: 'KB', label: 'KB' },
                    { value: 'MB', label: 'MB' },
                    { value: 'GB', label: 'GB' },
                    { value: 'TB', label: 'TB' },
                ],
            },
            {
                id: 'to',
                type: 'segment',
                label: 'Nach',
                default: 'GB',
                options: [
                    { value: 'B', label: 'B' },
                    { value: 'KB', label: 'KB' },
                    { value: 'MB', label: 'MB' },
                    { value: 'GB', label: 'GB' },
                    { value: 'TB', label: 'TB' },
                ],
            },
        ],
        compute: computeFileSizeConvert,
        intro: 'Binäre Umrechnung (1 KB = 1.024 B) — wie bei Dateisystemen und Upload-Limits.',
    },
    'file-size-convert',
);
