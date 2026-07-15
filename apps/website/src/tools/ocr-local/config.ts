import { createFileTaskWidget } from '../_shared/widgets/FileTaskWidget';
import { defineTool } from '../types';
import { PrimitiveFileDropWidget } from './widgets/PrimitiveFileDropWidget';
import { PrimitiveTextInputWidget } from './widgets/PrimitiveTextInputWidget';

const catalog = {
    id: 'ocr-local',
    slug: 'ocr-local',
    shortTitle: 'OCR',
    title: 'Text aus Scan kopieren',
    sub: 'Erkenn den Text aus einem gescannten Dokument und kopier ihn heraus.',
    pain: 'Behörden-PDF ist nur ein Bild — nichts markierbar.',
    solution: 'Lokale OCR — Text in Zwischenablage.',
    trust: 'Erkennung läuft lokal',
    tags: ['OCR', 'Scan', 'Text'],
    keywords: ['ocr', 'texterkennung', 'scan', 'text', 'kopieren'],
    fileHints: ['pdf', 'png', 'jpg', 'jpeg', 'tiff'],
    command: '/ocr',
    entry: 'file',
    theme: { accent: '#90a8ed', accentStrong: '#000', accentSoft: '#e6ecfb' },
    maturity: 'planned',
    areas: ['dokumente'],
    storyIds: ['story-scan-text-kopieren'],
} as const;

export default defineTool(
    {
        catalog,
        widgets: [
            createFileTaskWidget(catalog, {
                widgetId: 'widget-ocr-local',
                title: 'OCR Vorbereitung',
                description: 'Scan-Datei sammeln und OCR-Lauf starten.',
                tags: ['OCR', 'Scan', 'Datei'],
                acceptLabel: 'PDF, PNG, JPG, TIFF',
                emptyHint: 'Ziehe einen Scan oder ein Foto hier hinein.',
                footerHint: 'OCR-Erkennung folgt im Tool.',
                openLabel: 'OCR-Tool öffnen',
                defaultW: 5,
                defaultH: 4,
            }),
            {
                id: 'widget-primitive-text-input',
                title: 'Textfeld',
                description: 'Freies Eingabefeld als Quelle oder Ziel für Verknüpfungen.',
                tags: ['Organisation', 'Text', 'Primitive'],
                component: PrimitiveTextInputWidget,
                supportsLinkedInput: true,
                outputPorts: [
                    { id: 'text', label: 'Text' },
                    { id: 'value', label: 'Wert' },
                    { id: 'status', label: 'Status' },
                ],
                minW: 3,
                maxW: 9,
                minH: 3,
                maxH: 8,
                defaultW: 5,
                defaultH: 4,
            },
            {
                id: 'widget-primitive-file-drop',
                title: 'Dateiablage',
                description: 'Dateien sammeln und Name/Text an andere Widgets ausgeben.',
                tags: ['Organisation', 'Datei', 'Primitive'],
                component: PrimitiveFileDropWidget,
                outputPorts: [
                    { id: 'fileName', label: 'Dateiname' },
                    { id: 'fileText', label: 'Dateitext' },
                    { id: 'status', label: 'Status' },
                ],
                minW: 4,
                maxW: 10,
                minH: 3,
                maxH: 8,
                defaultW: 6,
                defaultH: 4,
            },
        ],
    },
    'ocr-local',
);
