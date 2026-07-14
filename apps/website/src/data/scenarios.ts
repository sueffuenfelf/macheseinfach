export type ScenarioId =
    | 'pdf-compress'
    | 'heic-convert'
    | 'pdf-merge'
    | 'pdf-redact'
    | 'epc-read'
    | 'girocode-gen'
    | 'iban-validate'
    | 'pdf-sign'
    | 'ocr-local'
    | 'pwned-check';

export type ScenarioTheme = {
    accent: string;
    accentStrong: string;
    accentSoft: string;
};

export type Scenario = {
    id: ScenarioId;
    title: string;
    pain: string;
    solution: string;
    keywords: string[];
    fileHints: string[];
    theme: ScenarioTheme;
    command: string;
};

/** Szenario-first Katalog — v0.1 Bedürfnisse (DE) */
export const scenarios: Scenario[] = [
    {
        id: 'pdf-compress',
        title: 'PDF für Behörden verkleinern',
        pain: 'Upload-Limit (z. B. 2 MB bei Elster) — Datei zu groß.',
        solution: 'Clientseitig komprimieren mit Profil „Behörden / Elster“.',
        keywords: ['pdf', 'komprimieren', 'elster', 'amt'],
        fileHints: ['pdf'],
        command: '/pdf compress',
        theme: { accent: '#3d5a80', accentStrong: '#293241', accentSoft: '#e8eef4' },
    },
    {
        id: 'heic-convert',
        title: 'iPhone-Foto (HEIC) konvertieren',
        pain: 'Portale verlangen JPG/PNG — HEIC wird abgelehnt.',
        solution: 'HEIC → JPG/PNG im Browser, ohne Cloud.',
        keywords: ['heic', 'jpg', 'foto', 'iphone'],
        fileHints: ['heic', 'heif'],
        command: '/heic',
        theme: { accent: '#2d6a4f', accentStrong: '#1b4332', accentSoft: '#e8f5ef' },
    },
    {
        id: 'pdf-merge',
        title: 'Bewerbung in eine PDF packen',
        pain: 'Anschreiben, CV und Zeugnisse liegen als Einzeldateien vor.',
        solution: 'PDFs zusammenführen und Reihenfolge per Drag-and-Drop.',
        keywords: ['merge', 'zusammenfügen', 'bewerbung'],
        fileHints: ['pdf'],
        command: '/pdf merge',
        theme: { accent: '#5c4d7d', accentStrong: '#3d3354', accentSoft: '#f0ecf5' },
    },
    {
        id: 'pdf-redact',
        title: 'Gehaltsnachweis schwärzen',
        pain: 'Sensible Zeilen für Vermieter unkenntlich machen — ohne Acrobat.',
        solution: 'Echte Schwärzung: Text wird aus der PDF entfernt.',
        keywords: ['schwärzen', 'zensur', 'datenschutz'],
        fileHints: ['pdf'],
        command: '/pdf redact',
        theme: { accent: '#4a4a48', accentStrong: '#242423', accentSoft: '#ececea' },
    },
    {
        id: 'epc-read',
        title: 'IBAN von Rechnung übernehmen',
        pain: '22-stellige IBAN abtippen ist fehleranfällig.',
        solution: 'GiroCode/EPC aus PDF oder Scan extrahieren.',
        keywords: ['iban', 'qr', 'rechnung', 'girocode'],
        fileHints: ['pdf', 'png', 'jpg', 'jpeg'],
        command: '/epc read',
        theme: { accent: '#0f766e', accentStrong: '#115e59', accentSoft: '#e6f4f2' },
    },
    {
        id: 'girocode-gen',
        title: 'GiroCode für Rechnung erzeugen',
        pain: 'Kunden zahlen spät, wenn Überweisungsdaten mühsam sind.',
        solution: 'EPC-QR-Code generieren und auf Rechnung platzieren.',
        keywords: ['girocode', 'qr', 'rechnung', 'freelancer'],
        fileHints: [],
        command: '/girocode',
        theme: { accent: '#0f766e', accentStrong: '#115e59', accentSoft: '#e6f4f2' },
    },
    {
        id: 'iban-validate',
        title: 'IBAN lokal prüfen',
        pain: 'Unsicher vor großer Überweisung — Online-Rechner wirken unseriös.',
        solution: 'Prüfziffer + Bankname im Browser — Daten verlassen nie das Gerät.',
        keywords: ['iban', 'validieren', 'bic', 'bank'],
        fileHints: [],
        command: '/iban',
        theme: { accent: '#15803d', accentStrong: '#166534', accentSoft: '#dcfce7' },
    },
    {
        id: 'pdf-sign',
        title: 'PDF unterschreiben',
        pain: 'Drucken, unterschreiben, einscannen — Medienbruch 2026.',
        solution: 'Unterschrift zeichnen und im PDF platzieren.',
        keywords: ['signatur', 'unterschrift', 'vertrag'],
        fileHints: ['pdf'],
        command: '/pdf sign',
        theme: { accent: '#6d28d9', accentStrong: '#5b21b6', accentSoft: '#ede9fe' },
    },
    {
        id: 'ocr-local',
        title: 'Text aus Scan kopieren',
        pain: 'Behörden-PDF ist nur ein Bild — nichts markierbar.',
        solution: 'Lokale OCR (tesseract.js) — Text in Zwischenablage.',
        keywords: ['ocr', 'texterkennung', 'scan'],
        fileHints: ['pdf', 'png', 'jpg', 'jpeg', 'tiff'],
        command: '/ocr',
        theme: { accent: '#b45309', accentStrong: '#92400e', accentSoft: '#fef3c7' },
    },
    {
        id: 'pwned-check',
        title: 'Passwort / E-Mail auf Leaks prüfen',
        pain: 'Unsicher nach Datenlecks — ohne Passwort preiszugeben.',
        solution: 'k-Anonymity via Have I Been Pwned — nur Hash-Prefix.',
        keywords: ['pwned', 'passwort', 'leak', 'hibp'],
        fileHints: [],
        command: '/pwned',
        theme: { accent: '#b91c1c', accentStrong: '#991b1b', accentSoft: '#fee2e2' },
    },
];

export function findScenariosForFile(name: string): Scenario[] {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    return scenarios.filter((s) => s.fileHints.includes(ext));
}

export function searchScenarios(query: string): Scenario[] {
    const q = query.trim().toLowerCase();
    if (!q) return scenarios;
    return scenarios.filter(
        (s) =>
            s.title.toLowerCase().includes(q) ||
            s.pain.toLowerCase().includes(q) ||
            s.keywords.some((k) => k.includes(q)) ||
            s.command.includes(q),
    );
}
