import { defineTool } from '../types';
import { IbanCheckTool } from './IbanCheckTool';

export default defineTool(
    {
        catalog: {
            id: 'iban-validate',
            slug: 'iban-validate',
            shortTitle: 'IBAN prüfen',
            title: 'IBAN prüfen',
            sub: 'Prüfsumme und Bankdaten werden offline anhand der Bankleitzahl-Tabelle geprüft.',
            pain: 'Unsicher vor großer Überweisung — Online-Rechner wirken unseriös.',
            solution: 'Prüfziffer + Bankname im Browser — Daten verlassen nie das Gerät.',
            trust: 'Offline geprüft · keine Anfrage nach außen',
            tags: ['IBAN', 'Bank', 'Prüfen'],
            keywords: ['iban', 'validieren', 'bic', 'bank', 'prüfen', 'check'],
            fileHints: [],
            command: '/iban',
            entry: 'form',
            entryPlaceholder: 'DE89 3704 0044 0532 0130 00',
            theme: { accent: '#ff90e8', accentStrong: '#000', accentSoft: '#ffe3f7' },
            maturity: 'stable',
            areas: ['buchhaltung'],
            storyIds: ['story-iban-vor-ueberweisung', 'story-freelancer-zahlung'],
        },
        page: IbanCheckTool,
    },
    'iban-validate',
);
