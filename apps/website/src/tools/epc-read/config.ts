import { createFileTaskWidget } from '../_shared/widgets/FileTaskWidget';
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
    theme: { accent: '#ff90e8', accentStrong: '#000', accentSoft: '#ffe3f7' },
    maturity: 'planned',
    areas: ['buchhaltung', 'dokumente'],
    storyIds: ['story-iban-aus-rechnung'],
} as const;

export default defineTool(
    {
        catalog,
        widgets: [
            createFileTaskWidget(catalog, {
                widgetId: 'widget-epc-read',
                title: 'EPC Reader',
                description: 'Rechnung oder QR-Datei laden und direkt für EPC-Lesen vorbereiten.',
                tags: ['EPC', 'QR', 'Datei'],
                acceptLabel: 'PDF, PNG, JPG',
                emptyHint: 'Lade eine Rechnung oder einen Scan mit EPC-Code.',
                footerHint: 'Für exakte Erkennung anschließend das Tool öffnen.',
                openLabel: 'EPC-Tool öffnen',
                defaultW: 5,
                defaultH: 4,
            }),
        ],
    },
    'epc-read',
);
