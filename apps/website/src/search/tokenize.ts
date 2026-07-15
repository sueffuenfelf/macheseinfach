import { normalizeQuery } from './normalize';

/** Häufige deutsche Stoppwörter — nicht für BM25, aber für Slot-Erkennung. */
export const DE_STOPWORDS = new Set([
    'a',
    'ab',
    'aber',
    'alle',
    'allem',
    'allen',
    'aller',
    'alles',
    'als',
    'also',
    'am',
    'an',
    'and',
    'auch',
    'auf',
    'aus',
    'bei',
    'bin',
    'bis',
    'bist',
    'da',
    'damit',
    'dann',
    'das',
    'dass',
    'dein',
    'deine',
    'dem',
    'den',
    'der',
    'des',
    'die',
    'dies',
    'diese',
    'diesem',
    'diesen',
    'dieser',
    'dieses',
    'doch',
    'dort',
    'du',
    'durch',
    'ein',
    'eine',
    'einem',
    'einen',
    'einer',
    'eines',
    'er',
    'es',
    'euch',
    'euer',
    'fuer',
    'für',
    'hat',
    'hier',
    'ich',
    'ihr',
    'ihre',
    'im',
    'in',
    'ist',
    'ja',
    'jede',
    'jedem',
    'jeden',
    'jeder',
    'jedes',
    'kann',
    'kein',
    'keine',
    'mein',
    'meine',
    'mit',
    'muss',
    'nach',
    'nicht',
    'noch',
    'nur',
    'ob',
    'oder',
    'ohne',
    'sehr',
    'sein',
    'seine',
    'sich',
    'sie',
    'sind',
    'so',
    'soll',
    'um',
    'und',
    'uns',
    'unser',
    'vom',
    'von',
    'vor',
    'war',
    'was',
    'weil',
    'wenn',
    'wer',
    'wie',
    'will',
    'wir',
    'wird',
    'wo',
    'zu',
    'zum',
    'zur',
]);

export function tokenize(query: string, options: { dropStopwords?: boolean } = {}): string[] {
    const normalized = normalizeQuery(query);
    if (!normalized) return [];

    const raw = normalized.split(/\s+/).filter(Boolean);
    if (!options.dropStopwords) return raw;

    return raw.filter((token) => !DE_STOPWORDS.has(token) && token.length > 1);
}

export function contentTokens(text: string): string[] {
    return tokenize(text, { dropStopwords: false });
}

export function queryBigrams(tokens: readonly string[]): string[] {
    const bigrams: string[] = [];
    for (let i = 0; i < tokens.length - 1; i += 1) {
        bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
    }
    return bigrams;
}
