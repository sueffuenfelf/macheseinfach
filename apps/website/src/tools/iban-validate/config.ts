import { defineTool } from '../types';
import { IbanCheckTool } from './IbanCheckTool';
import { QuickIbanWidget } from './widgets/QuickIbanWidget';

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
            storyIds: ['story-iban-vor-ueberweisung'],
        },
        page: IbanCheckTool,
        widgets: [
            {
                id: 'widget-iban-quick',
                title: 'IBAN Check',
                description: 'Schneller IBAN-Check direkt im Dashboard.',
                tags: ['IBAN', 'Bank', 'Quick'],
                component: QuickIbanWidget,
                supportsSharedInput: true,
                supportsLinkedInput: true,
                outputPorts: [
                    { id: 'value', label: 'IBAN' },
                    { id: 'status', label: 'Status' },
                ],
                minW: 3,
                maxW: 6,
                minH: 3,
                maxH: 5,
                defaultW: 4,
                defaultH: 3,
            },
        ],
    },
    'iban-validate',
);
