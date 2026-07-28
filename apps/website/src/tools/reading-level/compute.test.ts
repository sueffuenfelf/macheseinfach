import { describe, expect, test } from 'bun:test';
import { analyzeReadingLevel, countSyllablesDe } from './compute';

describe('reading-level', () => {
    test('syllables heuristic', () => {
        expect(countSyllablesDe('Haus')).toBeGreaterThanOrEqual(1);
        expect(countSyllablesDe('Universität')).toBeGreaterThanOrEqual(4);
    });

    test('simple text scores higher', () => {
        const simple = analyzeReadingLevel('Der Hund läuft. Die Katze schläft. Es ist schön.');
        const hard = analyzeReadingLevel(
            'Die komplexitätserhöhende Verwaltungsvorschrift unterliegt einer eingehenden Prüfung durch die zuständige Behörde.',
        );
        const simpleScore = Number(simple[0]?.title.match(/≈ (-?\d+)/)?.[1]);
        const hardScore = Number(hard[0]?.title.match(/≈ (-?\d+)/)?.[1]);
        expect(simpleScore).toBeGreaterThan(hardScore);
    });
});
