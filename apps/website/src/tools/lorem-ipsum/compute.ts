import type { FieldValues, GenerateOutput } from '../_shared/shells';

const LOREM_LA = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
    'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
    'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.',
    'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis.',
];

const LOREM_DE = [
    'Dies ist ein Blindtext zum Testen von Layouts und Typografie.',
    'Er enthält keine echte Aussage und kann beliebig wiederholt werden.',
    'Mit genug Absätzen füllt sich eine Seite ohne inhaltlichen Fokus.',
    'Ideal für Entwürfe, bevor der finale Text vorliegt.',
    'Bitte ersetzen Sie diesen Platzhalter durch Ihren eigenen Inhalt.',
    'Kurze Sätze lesen sich leichter und wirken ruhiger im Raster.',
    'Zahlen wie 12 oder 34 stören den Fluss kaum und wirken glaubwürdig.',
    'Am Ende sollte alles wieder durch echten Content ersetzt werden.',
];

export function generateLoremIpsum(values: FieldValues): GenerateOutput {
    const lang = values.lang ?? 'de';
    const pool = lang === 'la' ? LOREM_LA : LOREM_DE;
    const count = Math.min(50, Math.max(1, Math.floor(Number(values.paragraphs ?? '3') || 3)));
    const paras: string[] = [];
    for (let i = 0; i < count; i++) {
        const a = pool[i % pool.length];
        const b = pool[(i + 3) % pool.length];
        paras.push(`${a} ${b}`);
    }
    return { kind: 'text', content: paras.join('\n\n'), filename: 'lorem.txt' };
}
