import { defineTool } from '../types';
import { GiroCodeTool } from './GiroCodeTool';
import { QuickGiroWidget } from './widgets/QuickGiroWidget';
import { QuickQrWidget } from './widgets/QuickQrWidget';

const catalog = {
    id: 'girocode-gen',
    slug: 'girocode-gen',
    shortTitle: 'GiroCode',
    title: 'GiroCode erzeugen',
    sub: 'Gib die Zahlungsdaten ein — der QR-Code entsteht direkt in deinem Browser.',
    pain: 'Kunden zahlen spät, wenn Überweisungsdaten mühsam sind.',
    solution: 'EPC-QR-Code generieren und auf Rechnung platzieren.',
    trust: 'Lokal erzeugt · nichts wird hochgeladen',
    tags: ['QR', 'Rechnung', 'Freelancer'],
    keywords: ['girocode', 'qr', 'rechnung', 'freelancer', 'epc', 'überweisung'],
    fileHints: [],
    command: '/girocode',
    entry: 'form',
    entryPlaceholder: 'Empfänger, IBAN, Betrag, Verwendungszweck',
    theme: { accent: '#ff90e8', accentStrong: '#000', accentSoft: '#ffe3f7' },
    maturity: 'stable',
    areas: ['buchhaltung'],
    storyIds: ['story-freelancer-girocode'],
} as const;

export default defineTool(
    {
        catalog,
        page: GiroCodeTool,
        widgets: [
            {
                id: 'widget-girocode-quick',
                title: 'GiroCode Mini',
                description: 'Kompakter GiroCode-Generator fuer schnelle Zahlungen.',
                tags: ['QR', 'Rechnung', 'Quick'],
                component: QuickGiroWidget,
                minW: 4,
                maxW: 7,
                minH: 4,
                maxH: 7,
                defaultW: 5,
                defaultH: 5,
            },
            {
                id: 'widget-qr-mini',
                title: 'QR Mini',
                description: 'Beliebigen Text als QR erstellen.',
                tags: ['QR', 'Quick'],
                component: QuickQrWidget,
                supportsSharedInput: true,
                supportsLinkedInput: true,
                outputPorts: [
                    { id: 'value', label: 'Text' },
                    { id: 'status', label: 'Status' },
                ],
                minW: 4,
                maxW: 8,
                minH: 2,
                maxH: 4,
                defaultW: 4,
                defaultH: 2,
            },
        ],
    },
    'girocode-gen',
);
