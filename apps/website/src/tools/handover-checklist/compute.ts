import type { FieldValues, GenerateOutput } from '../_shared/shells';

const MOVE_IN = [
    'Zählerstände (Strom, Gas, Wasser) fotografieren und notieren',
    'Schlüsselanzahl und Schlüsselarten prüfen / quittieren',
    'Wände, Böden, Türen, Fenster auf Mängel prüfen',
    'Sanitär: Armaturen, Abflüsse, Silikonfugen',
    'Küche: Geräte, Schränke, Dunstabzug',
    'Heizung: Funktion, Thermostate, Heizkörper entlüften',
    'Rauchmelder vorhanden und funktionsfähig?',
    'Keller/Stellplatz/Dachboden zugänglich?',
    'Fotos mit Datum von allen Räumen',
    'Übergabeprotokoll unterschreiben (beide Seiten)',
];

const MOVE_OUT = [
    'Wohnung besenrein / laut Vertrag gereinigt',
    'Löcher fachgerecht verschlossen / Wände laut Vertrag',
    'Alle Schlüssel zurückgeben (Anzahl prüfen)',
    'Zählerstände notieren und fotografieren',
    'Mängel aus Einzug mit Protokoll abgleichen',
    'Nebenkosten-Vorauszahlung / Kaution: Kontaktdaten für Abrechnung',
    'Nachsendeauftrag / Ummeldung im Blick',
    'Fotos vom Zustand bei Auszug',
    'Übergabeprotokoll vollständig ausfüllen',
    'Fristen für Kautionrückzahlung notieren (keine Rechtsberatung)',
];

/** Generate handover checklist text. */
export function generateHandoverChecklist(values: FieldValues): GenerateOutput {
    const kind = values.kind ?? 'in';
    const items = kind === 'out' ? MOVE_OUT : MOVE_IN;
    const title =
        kind === 'out' ? 'Wohnungsübergabe — Auszug' : 'Wohnungsübergabe — Einzug';
    const lines = [
        title,
        '—' ,
        ...items.map((item, i) => `[ ] ${i + 1}. ${item}`),
        '',
        'Hinweis: Keine Rechtsberatung — Checkliste zur Orientierung.',
    ];
    return {
        kind: 'text',
        content: lines.join('\n'),
        filename: kind === 'out' ? 'uebergabe-auszug.txt' : 'uebergabe-einzug.txt',
    };
}
