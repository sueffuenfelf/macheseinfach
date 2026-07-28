import type { PasteFinding } from '../_shared/shells';

const LONG_SENTENCE = 20;
const COMPLEX_WORDS = [
    'demzufolge', 'insofern', 'jedoch', 'demgegenüber', 'bezüglich', 'hinsichtlich',
    'implementierung', 'optimierung', 'konfiguration', 'administration',
];

function splitSentences(text: string): string[] {
    const parts = text.split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter(Boolean);
    return parts.length ? parts : text.trim() ? [text.trim()] : [];
}

export function analyzePlainLanguage(input: string): PasteFinding[] {
    const text = input.trim();
    if (!text) return [{ id: 'empty', severity: 'error', title: 'Kein Text', detail: 'Bitte Text einfügen.' }];
    const sentences = splitSentences(text);
    const words = text.split(/\s+/).filter(Boolean);
    const longSentences = sentences.filter((s) => s.split(/\s+/).length > LONG_SENTENCE);
    const complex = words.filter((w) => COMPLEX_WORDS.includes(w.toLowerCase().replace(/[^a-zäöüß]/g, '')));
    const findings: PasteFinding[] = [
        { id: 'stats', severity: 'info', title: `${words.length} Wörter · ${sentences.length} Sätze` },
    ];
    if (longSentences.length) {
        findings.push({
            id: 'long', severity: 'warn', title: `${longSentences.length} lange Sätze (>${LONG_SENTENCE} Wörter)`,
            detail: 'Kürzere Sätze helfen bei leichter Sprache und Screenreadern.',
        });
    } else {
        findings.push({ id: 'sent-ok', severity: 'ok', title: 'Satzlängen im Rahmen' });
    }
    if (complex.length) {
        findings.push({
            id: 'complex', severity: 'warn', title: `${complex.length} komplexe Wörter`,
            detail: `z. B. ${[...new Set(complex)].slice(0, 5).join(', ')}`,
        });
    }
    findings.push({
        id: 'hint', severity: 'info', title: 'Leichte Sprache',
        detail: 'Kein Ersatz für zertifizierte Leichte Sprache — nur grobe Heuristik.',
    });
    return findings;
}
