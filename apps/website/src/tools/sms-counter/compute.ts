import type { CalcResult, FieldValues } from '../_shared/shells';

/** GSM 03.38 basic set (excluding extension escapes). */
const GSM_BASIC = new Set(
    [
        '@',
        '£',
        '$',
        '¥',
        'è',
        'é',
        'ù',
        'ì',
        'ò',
        'Ç',
        '\n',
        'Ø',
        'ø',
        '\r',
        'Å',
        'å',
        'Δ',
        '_',
        'Φ',
        'Γ',
        'Λ',
        'Ω',
        'Π',
        'Ψ',
        'Σ',
        'Θ',
        'Ξ',
        'Æ',
        'æ',
        'ß',
        'É',
        ' ',
        '!',
        '"',
        '#',
        '¤',
        '%',
        '&',
        "'",
        '(',
        ')',
        '*',
        '+',
        ',',
        '-',
        '.',
        '/',
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        ':',
        ';',
        '<',
        '=',
        '>',
        '?',
        '¡',
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        'Ä',
        'Ö',
        'Ñ',
        'Ü',
        '§',
        '¿',
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'x',
        'y',
        'z',
        'ä',
        'ö',
        'ñ',
        'ü',
        'à',
    ].join(''),
);

/** GSM extension table — each costs 2 septets. */
const GSM_EXT = new Set(['^', '{', '}', '\\', '[', '~', ']', '|', '€']);

export function smsEncodingStats(text: string): {
    encoding: 'GSM-7' | 'UCS-2';
    units: number;
    segments: number;
    perSegment: number;
    remainingInSegment: number;
} {
    let gsmUnits = 0;
    let gsmOk = true;
    for (const ch of text) {
        if (GSM_EXT.has(ch)) {
            gsmUnits += 2;
        } else if (GSM_BASIC.has(ch)) {
            gsmUnits += 1;
        } else {
            gsmOk = false;
            break;
        }
    }

    if (gsmOk) {
        const single = 160;
        const multi = 153;
        const segments = gsmUnits === 0 ? 0 : gsmUnits <= single ? 1 : Math.ceil(gsmUnits / multi);
        const perSegment = segments <= 1 ? single : multi;
        const usedInLast = segments <= 1 ? gsmUnits : gsmUnits - (segments - 1) * multi;
        return {
            encoding: 'GSM-7',
            units: gsmUnits,
            segments,
            perSegment,
            remainingInSegment: perSegment - usedInLast,
        };
    }

    const units = [...text].length;
    const single = 70;
    const multi = 67;
    const segments = units === 0 ? 0 : units <= single ? 1 : Math.ceil(units / multi);
    const perSegment = segments <= 1 ? single : multi;
    const usedInLast = segments <= 1 ? units : units - (segments - 1) * multi;
    return {
        encoding: 'UCS-2',
        units,
        segments,
        perSegment,
        remainingInSegment: perSegment - usedInLast,
    };
}

export function computeSmsCount(values: FieldValues): CalcResult {
    const text = values.text ?? '';
    const stats = smsEncodingStats(text);
    return {
        tone: stats.segments > 1 ? 'warn' : 'info',
        heading: stats.encoding,
        rows: [
            { label: 'Kodierung', value: stats.encoding },
            {
                label: stats.encoding === 'GSM-7' ? 'Septets' : 'Zeichen (UCS-2)',
                value: String(stats.units),
            },
            { label: 'SMS-Segmente', value: String(stats.segments) },
            { label: 'Kapazität/Segment', value: String(stats.perSegment) },
            {
                label: 'Frei im aktuellen Segment',
                value: String(Math.max(0, stats.remainingInSegment)),
            },
        ],
        hint:
            stats.encoding === 'UCS-2'
                ? 'Sonderzeichen erkannt → UCS-2 (70 / 67 Zeichen).'
                : 'Nur GSM-7-Zeichen → 160 / 153 Septets.',
    };
}
