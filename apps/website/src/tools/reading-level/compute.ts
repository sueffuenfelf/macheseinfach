import type { PasteFinding } from '../_shared/shells';

/** Rough German syllable count (vowel-group heuristic). */
export function countSyllablesDe(word: string): number {
    const cleaned = word.toLocaleLowerCase('de-DE').replace(/[^a-zäöüß]/g, '');
    if (!cleaned) return 0;
    const groups = cleaned.match(/[aeiouyäöü]+/g);
    return Math.max(1, groups?.length ?? 1);
}

function splitWords(text: string): string[] {
    return text
        .trim()
        .split(/\s+/)
        .map((w) => w.replace(/^[^0-9A-Za-zÄÖÜäöüß]+|[^0-9A-Za-zÄÖÜäöüß]+$/g, ''))
        .filter(Boolean);
}

function splitSentences(text: string): string[] {
    const parts = text
        .split(/(?<=[.!?…])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
    return parts.length ? parts : text.trim() ? [text.trim()] : [];
}

/**
 * Flesch-Reading-Ease (Amstad / German approximation):
 * FRE = 180 − ASL − 58.5 × ASW
 */
export function analyzeReadingLevel(input: string): PasteFinding[] {
    const text = input.trim();
    if (!text) {
        return [
            { id: 'empty', severity: 'error', title: 'Kein Text', detail: 'Bitte Text einfügen.' },
        ];
    }

    const words = splitWords(text);
    const sentences = splitSentences(text);
    const wordCount = words.length;
    const sentenceCount = Math.max(1, sentences.length);
    const syllableCount = words.reduce((sum, w) => sum + countSyllablesDe(w), 0);

    const asl = wordCount / sentenceCount;
    const asw = wordCount === 0 ? 0 : syllableCount / wordCount;
    const fre = 180 - asl - 58.5 * asw;

    let level: string;
    let severity: PasteFinding['severity'];
    if (fre >= 80) {
        level = 'Sehr leicht';
        severity = 'ok';
    } else if (fre >= 60) {
        level = 'Leicht';
        severity = 'ok';
    } else if (fre >= 40) {
        level = 'Mittelschwer';
        severity = 'info';
    } else if (fre >= 20) {
        level = 'Schwer';
        severity = 'warn';
    } else {
        level = 'Sehr schwer';
        severity = 'warn';
    }

    return [
        {
            id: 'score',
            severity,
            title: `Flesch-DE ≈ ${fre.toFixed(0)} — ${level}`,
            detail: 'Näherung nach Amstad (deutsch). Kein offizielles Gutachten.',
        },
        {
            id: 'stats',
            severity: 'info',
            title: `${wordCount} Wörter · ${sentenceCount} Sätze · Ø ${asl.toFixed(1)} Wörter/Satz`,
            detail: `Ø ${asw.toFixed(2)} Silben/Wort (Heuristik).`,
        },
        {
            id: 'hint',
            severity: 'info',
            title: 'Tipp',
            detail: 'Kürzere Sätze und einfachere Wörter heben den Index. Behörden-/AGB-Texte liegen oft unter 40.',
        },
    ];
}
