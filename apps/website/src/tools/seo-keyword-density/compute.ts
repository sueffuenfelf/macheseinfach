import type { CalcResult, FieldValues } from '../_shared/shells';

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
        .split(/\s+/)
        .filter(Boolean);
}

/** Keyword frequency and density in text. */
export function computeKeywordDensity(values: FieldValues): CalcResult {
    const text = values.text?.trim() ?? '';
    const keyword = values.keyword?.trim().toLowerCase() ?? '';

    if (!text) {
        return { rows: [], error: 'Text eingeben.' };
    }
    if (!keyword) {
        return { rows: [], error: 'Keyword eingeben.' };
    }

    const words = tokenize(text);
    const total = words.length;
    if (total === 0) {
        return { rows: [], error: 'Keine Wörter im Text gefunden.' };
    }

    const keywordParts = keyword.split(/\s+/).filter(Boolean);
    let count = 0;

    if (keywordParts.length === 1) {
        count = words.filter((w) => w === keyword).length;
    } else {
        const joined = words.join(' ');
        const re = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = joined.match(re);
        count = matches?.length ?? 0;
    }

    const density = total > 0 ? (count / total) * 100 : 0;
    const densityStr = `${density.toFixed(2).replace('.', ',')} %`;

    let tone: CalcResult['tone'] = 'success';
    let hint = 'Orientierungswert — keine feste Google-Grenze.';
    if (density > 3) {
        tone = 'warn';
        hint = 'Dichte über 3 % — Keyword-Stuffing vermeiden.';
    } else if (density < 0.5 && count > 0) {
        tone = 'info';
    } else if (count === 0) {
        tone = 'warn';
        hint = 'Keyword kommt im Text nicht vor.';
    }

    return {
        tone,
        heading: 'Keyword-Dichte',
        rows: [
            { label: 'Keyword', value: keyword },
            { label: 'Vorkommen', value: String(count) },
            { label: 'Wörter gesamt', value: String(total) },
            { label: 'Dichte', value: densityStr },
        ],
        hint,
    };
}
