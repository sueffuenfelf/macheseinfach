import type { AreaDefinition, AreaId } from './types';

const ICONS = {
    dokumente:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><rect x="4" y="3" width="12" height="16" rx="2"/><path d="M8 7h4M8 11h4"/><path d="M18 7v12a2 2 0 0 1-2 2H8"/></svg>',
    bilder: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 15l-5-5L7 19"/></svg>',
    text: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><path d="M4 7V5h16v2"/><line x1="12" y1="5" x2="12" y2="19"/><line x1="8" y1="19" x2="16" y2="19"/></svg>',
    zeit: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>',
    einheiten:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><path d="M4 8h6v6H4z"/><path d="M14 4h6v6h-6z"/><path d="M14 14h6v6h-6z"/><line x1="10" y1="11" x2="14" y2="7"/><line x1="10" y1="11" x2="14" y2="17"/></svg>',
    web: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></svg>',
} as const;

export const areas = {
    bilder: {
        id: 'bilder',
        slug: 'bilder',
        label: 'Bilder',
        shortLabel: 'Bilder',
        description:
            'Fotos und Screenshots — Formate umwandeln, verkleinern, ausrichten, Metadaten entfernen.',
        accent: '#f4a261',
        icon: ICONS.bilder,
    },
    dokumente: {
        id: 'dokumente',
        slug: 'dokumente',
        label: 'Dokumente',
        shortLabel: 'Dokumente',
        description: 'PDFs und Scans — zusammenfügen, unterschreiben, Text auslesen.',
        accent: '#90a8ed',
        icon: ICONS.dokumente,
    },
    text: {
        id: 'text',
        slug: 'text',
        label: 'Text & Schreiben',
        shortLabel: 'Text',
        description:
            'Texte prüfen und umwandeln — Zeichenzähler, Groß/Klein, Diff, Lesbarkeit und mehr.',
        accent: '#7dd3c0',
        icon: ICONS.text,
    },
    zeit: {
        id: 'zeit',
        slug: 'zeit',
        label: 'Zeit & Fristen',
        shortLabel: 'Zeit',
        description: 'Fristen, Werktage und Kalender — Tage zählen, KW, Feiertage und Countdown.',
        accent: '#ffb347',
        icon: ICONS.zeit,
    },
    einheiten: {
        id: 'einheiten',
        slug: 'einheiten',
        label: 'Einheiten & Umrechnen',
        shortLabel: 'Einheiten',
        description: 'Maße, Währungen und Prozente — schnell umrechnen, lokal im Browser.',
        accent: '#a8dadc',
        icon: ICONS.einheiten,
    },
    web: {
        id: 'web',
        slug: 'web',
        label: 'Web & Entwickler',
        shortLabel: 'Web',
        description: 'Alltagswerkzeuge für Freelancer — Encode, Hash, JSON, CSS und mehr.',
        accent: '#457b9d',
        icon: ICONS.web,
    },
} as const satisfies Record<AreaDefinition['id'], AreaDefinition>;

export const areaOrder = [
    'bilder',
    'dokumente',
    'text',
    'zeit',
    'einheiten',
    'web',
] as const satisfies readonly AreaId[];
