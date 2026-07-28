import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

const MIN_CHARS = 5;
const MAX_CHARS = 125;

export function computeAltTextLength(values: FieldValues): CalcResult {
    const text = (values.text ?? '').trim();
    if (!text) return { rows: [], error: 'Bitte Alt-Text eingeben.' };
    const len = text.length;
    const words = text.split(/\s+/).filter(Boolean).length;
    let tone: CalcResult['tone'] = 'success';
    let heading = 'Gute Länge';
    if (len < MIN_CHARS) { tone = 'warn'; heading = 'Sehr kurz'; }
    else if (len > MAX_CHARS) { tone = 'warn'; heading = 'Eher lang'; }
    return {
        tone,
        heading,
        rows: [
            { label: 'Zeichen', value: String(len) },
            { label: 'Wörter', value: String(words) },
            { label: 'Empfehlung', value: `${MIN_CHARS}–${MAX_CHARS} Zeichen für kurze Beschreibungen` },
        ],
        hint: 'Alt-Text soll das Bild beschreiben — nicht „Bild von …“. Dekorative Bilder: alt="" (leer).',
    };
}
