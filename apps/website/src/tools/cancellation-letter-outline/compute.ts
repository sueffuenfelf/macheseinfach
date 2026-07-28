import type { FieldValues, GenerateOutput } from '../_shared/shells';

const OUTLINES: Record<string, { title: string; sections: string[] }> = {
    employment: {
        title: 'Kündigung Arbeitsverhältnis — Gerüst',
        sections: [
            'Absender: Name, Anschrift, Kontakt',
            'Empfänger: Arbeitgeber/in, Firma, Anschrift',
            'Ort und Datum',
            'Betreff: Kündigung des Arbeitsverhältnisses',
            'Formulierung der Kündigung (ordentlich / außerordentlich — nur mit Rechtsberatung)',
            'Kündigungsfrist / letzter Arbeitstag (Vertrag und Tarif prüfen)',
            'Bitte um schriftliche Bestätigung und Arbeitszeugnis',
            'Unterschrift',
        ],
    },
    rent: {
        title: 'Kündigung Mietverhältnis — Gerüst',
        sections: [
            'Absender: Mieter:in, Anschrift der Wohnung',
            'Empfänger: Vermieter:in, Anschrift',
            'Ort und Datum',
            'Betreff: Kündigung der Wohnung',
            'Adresse der Wohnung',
            'Gewünschtes Kündigungsdatum / Frist (Mietvertrag prüfen)',
            'Rückgabe der Wohnung, Schlüssel, Übergabetermin',
            'Unterschrift aller Vertragsparteien (falls erforderlich)',
        ],
    },
    service: {
        title: 'Kündigung Dienstleistungsvertrag — Gerüst',
        sections: [
            'Absender und Empfänger mit Anschrift',
            'Ort und Datum',
            'Vertragsnummer / Vertragsgegenstand',
            'Betreff: Kündigung des Vertrags',
            'Kündigungsfrist laut Vertrag',
            'Wirksamkeitsdatum',
            'Offene Rechnungen / Datenlöschung ansprechen',
            'Unterschrift',
        ],
    },
    gym: {
        title: 'Kündigung Fitnessstudio — Gerüst',
        sections: [
            'Absender: Name, Mitgliedsnummer, Anschrift',
            'Empfänger: Studio / Verwaltung, Anschrift',
            'Ort und Datum',
            'Betreff: Kündigung der Mitgliedschaft',
            'Kündigungsfrist und gewünschtes Vertragsende',
            'Bitte um Bestätigung',
            'Hinweis: Sonderkündigungsrecht prüfen (Umzug, Krankheit — Rechtsberatung)',
            'Unterschrift',
        ],
    },
};

export function generateCancellationLetterOutline(values: FieldValues): GenerateOutput {
    const kind = values.contractType ?? 'service';
    const outline = OUTLINES[kind] ?? OUTLINES.service;
    const lines = [
        outline.title,
        '—',
        'Struktur (Platzhalter selbst ausfüllen):',
        '',
        ...outline.sections.map((section, i) => `${i + 1}. ${section}`),
        '',
        '---',
        '',
        '[Ort, Datum]',
        '',
        '[Betreff]',
        '',
        'Sehr geehrte Damen und Herren,',
        '',
        '[Kündigungstext — keine Rechtsberatung, Formulierung selbst wählen]',
        '',
        'Mit freundlichen Grüßen',
        '',
        '[Unterschrift]',
        '',
        'Hinweis: Keine Rechtsberatung — kein fertiger Kündigungsbrief.',
    ];
    return { kind: 'text', content: lines.join('\n'), filename: 'kuendigung-geruest.txt' };
}
