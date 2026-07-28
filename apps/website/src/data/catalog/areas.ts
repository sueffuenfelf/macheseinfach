import type { AreaDefinition, AreaId, StoryId } from './types';

const EMPTY_STORIES: readonly StoryId[] = [];

const ICONS = {
    buchhaltung:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="15" x2="13" y2="15"/></svg>',
    behoerden:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><path d="M6 2h9l5 5v15H6z"/><polyline points="15 2 15 7 20 7"/><line x1="9" y1="13" x2="16" y2="13"/><line x1="9" y1="17" x2="16" y2="17"/></svg>',
    dokumente:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><rect x="4" y="3" width="12" height="16" rx="2"/><path d="M8 7h4M8 11h4"/><path d="M18 7v12a2 2 0 0 1-2 2H8"/></svg>',
    bilder: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 15l-5-5L7 19"/></svg>',
    security:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/></svg>',
    seo: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    text: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><path d="M4 7V5h16v2"/><line x1="12" y1="5" x2="12" y2="19"/><line x1="8" y1="19" x2="16" y2="19"/></svg>',
    zeit: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>',
    wohnen:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
    einheiten:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><path d="M4 8h6v6H4z"/><path d="M14 4h6v6h-6z"/><path d="M14 14h6v6h-6z"/><line x1="10" y1="11" x2="14" y2="7"/><line x1="10" y1="11" x2="14" y2="17"/></svg>',
    web: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></svg>',
    steuern:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><path d="M12 3v18"/><path d="M7 7h7a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h8"/></svg>',
    recht: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><path d="M12 3v18"/><path d="M5 8h14"/><path d="M7 8v4a5 5 0 0 0 10 0V8"/></svg>',
    kommunikation:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><path d="M4 5h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 4V7a2 2 0 0 1 2-2z"/></svg>',
    barrierefreiheit:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><circle cx="12" cy="5" r="2"/><path d="M12 8v4"/><path d="M8 12h8"/><path d="M9 22l3-10 3 10"/><circle cx="12" cy="16" r="6" opacity=".25"/></svg>',
    kreativ:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><circle cx="12" cy="16" r="3"/></svg>',
} as const;

export const areas = {
    buchhaltung: {
        id: 'buchhaltung',
        slug: 'buchhaltung',
        label: 'Buchhaltung',
        shortLabel: 'Buchhaltung',
        description: 'Zahlungen und Rechnungen im Alltag — GiroCode, IBAN prüfen, IBAN auslesen.',
        accent: '#ff90e8',
        icon: ICONS.buchhaltung,
        storyIds: [
            'story-freelancer-girocode',
            'story-iban-vor-ueberweisung',
            'story-iban-aus-rechnung',
        ],
    },
    behoerden: {
        id: 'behoerden',
        slug: 'behoerden',
        label: 'Behörden & Formulare',
        shortLabel: 'Behörden',
        description:
            'Portal-Uploads, Formulare und Nachweise — PDFs ausfüllen, verkleinern, schwärzen.',
        accent: '#ffc900',
        icon: ICONS.behoerden,
        storyIds: [
            'story-elster-pdf-limit',
            'story-vermieter-gehalt-schwaarzen',
            'story-formular-ausfuellen',
        ],
    },
    bilder: {
        id: 'bilder',
        slug: 'bilder',
        label: 'Bilder',
        shortLabel: 'Bilder',
        description:
            'Fotos und Screenshots — Formate umwandeln, verkleinern, ausrichten, Metadaten entfernen.',
        accent: '#f4a261',
        icon: ICONS.bilder,
        storyIds: [
            'story-heic-portal',
            'story-bild-format-aendern',
            'story-bild-verkleinern',
            'story-bild-ausrichten',
            'story-bild-metadaten',
        ],
    },
    dokumente: {
        id: 'dokumente',
        slug: 'dokumente',
        label: 'Dokumente',
        shortLabel: 'Dokumente',
        description: 'PDFs und Scans — zusammenfügen, unterschreiben, Text auslesen.',
        accent: '#90a8ed',
        icon: ICONS.dokumente,
        storyIds: [
            'story-bewerbung-eine-pdf',
            'story-vertrag-unterschreiben',
            'story-scan-text-kopieren',
            'story-iban-aus-rechnung',
        ],
    },
    security: {
        id: 'security',
        slug: 'security',
        label: 'Security',
        shortLabel: 'Security',
        description: 'Prüfungen ohne preisgegebene Passwörter — bin ich von einem Leak betroffen?',
        accent: '#23c9a0',
        icon: ICONS.security,
        storyIds: ['story-leak-email-passwort'],
    },
    seo: {
        id: 'seo',
        slug: 'seo',
        label: 'SEO',
        shortLabel: 'SEO',
        description: 'Für kleine Websites — Snippet-Vorschau, Sitemap, Schema und mehr.',
        accent: '#c3aef0',
        icon: ICONS.seo,
        storyIds: ['story-seo-meta-preview', 'story-seo-sitemap'],
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
        storyIds: EMPTY_STORIES,
    },
    zeit: {
        id: 'zeit',
        slug: 'zeit',
        label: 'Zeit & Fristen',
        shortLabel: 'Zeit',
        description: 'Fristen, Werktage und Kalender — Tage zählen, KW, Feiertage und Countdown.',
        accent: '#ffb347',
        icon: ICONS.zeit,
        storyIds: EMPTY_STORIES,
    },
    wohnen: {
        id: 'wohnen',
        slug: 'wohnen',
        label: 'Wohnen & Miete',
        shortLabel: 'Wohnen',
        description: 'Miete, Nebenkosten und Wohnalltag — Rechner und Checklisten für Mieter:innen.',
        accent: '#e8a0bf',
        icon: ICONS.wohnen,
        storyIds: EMPTY_STORIES,
    },
    einheiten: {
        id: 'einheiten',
        slug: 'einheiten',
        label: 'Einheiten & Umrechnen',
        shortLabel: 'Einheiten',
        description: 'Maße, Währungen und Prozente — schnell umrechnen, lokal im Browser.',
        accent: '#a8dadc',
        icon: ICONS.einheiten,
        storyIds: EMPTY_STORIES,
    },
    web: {
        id: 'web',
        slug: 'web',
        label: 'Web & Entwickler',
        shortLabel: 'Web',
        description: 'Alltagswerkzeuge für Freelancer — Encode, Hash, JSON, CSS und mehr.',
        accent: '#457b9d',
        icon: ICONS.web,
        storyIds: EMPTY_STORIES,
    },
    steuern: {
        id: 'steuern',
        slug: 'steuern',
        label: 'Steuern',
        shortLabel: 'Steuern',
        description:
            'Grobe Steuer-Rechner zur Orientierung — MwSt, AfA, Pauschalen und Fristen. Keine Steuerberatung.',
        accent: '#e76f51',
        icon: ICONS.steuern,
        storyIds: EMPTY_STORIES,
    },
    recht: {
        id: 'recht',
        slug: 'recht',
        label: 'Recht & Vertrag',
        shortLabel: 'Recht',
        description:
            'Fristen und Checklisten für Verträge und Alltag — Orientierung, keine Rechtsberatung.',
        accent: '#264653',
        icon: ICONS.recht,
        storyIds: EMPTY_STORIES,
    },
    kommunikation: {
        id: 'kommunikation',
        slug: 'kommunikation',
        label: 'Kommunikation',
        shortLabel: 'Kommunikation',
        description: 'Kontakte, Signaturen und Links — vCard, WhatsApp, ICS und mehr.',
        accent: '#2a9d8f',
        icon: ICONS.kommunikation,
        storyIds: EMPTY_STORIES,
    },
    barrierefreiheit: {
        id: 'barrierefreiheit',
        slug: 'barrierefreiheit',
        label: 'Barrierefreiheit',
        shortLabel: 'A11y',
        description: 'WCAG-Alltag für kleine Sites — Kontrast, Alt-Texte und Checklisten.',
        accent: '#e9c46a',
        icon: ICONS.barrierefreiheit,
        storyIds: EMPTY_STORIES,
    },
    kreativ: {
        id: 'kreativ',
        slug: 'kreativ',
        label: 'Kreativ & Farbe',
        shortLabel: 'Kreativ',
        description: 'Farben, Paletten und Design-Helfer — lokal im Browser.',
        accent: '#9b5de5',
        icon: ICONS.kreativ,
        storyIds: EMPTY_STORIES,
    },
} as const satisfies Record<AreaDefinition['id'], AreaDefinition>;

export const areaOrder = [
    'buchhaltung',
    'behoerden',
    'bilder',
    'dokumente',
    'text',
    'zeit',
    'wohnen',
    'einheiten',
    'security',
    'seo',
    'web',
    'steuern',
    'recht',
    'kommunikation',
    'barrierefreiheit',
    'kreativ',
] as const satisfies readonly AreaId[];
