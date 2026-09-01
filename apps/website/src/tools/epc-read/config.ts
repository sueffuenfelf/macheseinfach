import { defineTool } from '../types';

const catalog = {
    id: 'epc-read',
    slug: 'epc-read',
    shortTitle: 'IBAN auslesen',
    title: 'IBAN auslesen',
    sub: 'Zieh eine Rechnung her — wir finden die IBAN und du übernimmst sie mit einem Klick.',
    pain: '22-stellige IBAN abtippen ist fehleranfällig.',
    solution: 'GiroCode/EPC aus PDF oder Scan extrahieren.',
    trust: 'Datei bleibt auf deinem Gerät',
    tags: ['IBAN', 'Rechnung', 'QR'],
    keywords: ['iban', 'qr', 'rechnung', 'girocode', 'auslesen', 'epc'],
    fileHints: ['pdf', 'png', 'jpg', 'jpeg'],
    command: '/epc read',
    entry: 'file-or-form',
    entryPlaceholder: 'IBAN einfügen oder aus Zwischenablage',
    theme: { accent: '#90a8ed', accentStrong: '#000', accentSoft: '#e6ecfb' },
    maturity: 'planned',
    areas: ['dokumente'],
} as const;

export default defineTool(
    {
        catalog,
    },
    'epc-read',
);
