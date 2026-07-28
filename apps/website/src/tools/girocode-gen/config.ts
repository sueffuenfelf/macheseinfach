import { defineTool } from '../types';
import { GiroCodeTool } from './GiroCodeTool';

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
    storyIds: ['story-freelancer-girocode', 'story-freelancer-zahlung'],
} as const;

export default defineTool(
    {
        catalog,
        page: GiroCodeTool,
    },
    'girocode-gen',
);
