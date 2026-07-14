import type { AreaDefinition, AreaId } from './types';

const ICONS = {
    buchhaltung:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="15" x2="13" y2="15"/></svg>',
    behoerden:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><path d="M6 2h9l5 5v15H6z"/><polyline points="15 2 15 7 20 7"/><line x1="9" y1="13" x2="16" y2="13"/><line x1="9" y1="17" x2="16" y2="17"/></svg>',
    dokumente:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><rect x="4" y="3" width="12" height="16" rx="2"/><path d="M8 7h4M8 11h4"/><path d="M18 7v12a2 2 0 0 1-2 2H8"/></svg>',
    security:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/></svg>',
    seo: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
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
        storyIds: ['story-freelancer-girocode', 'story-iban-vor-ueberweisung', 'story-iban-aus-rechnung'],
    },
    behoerden: {
        id: 'behoerden',
        slug: 'behoerden',
        label: 'Behörden & Formulare',
        shortLabel: 'Behörden',
        description: 'Portal-Uploads und Nachweise — PDFs unter Größenlimits bringen, schwärzen.',
        accent: '#ffc900',
        icon: ICONS.behoerden,
        storyIds: ['story-elster-pdf-limit', 'story-vermieter-gehalt-schwaarzen'],
    },
    dokumente: {
        id: 'dokumente',
        slug: 'dokumente',
        label: 'Dokumente',
        shortLabel: 'Dokumente',
        description: 'PDFs, Fotos und Scans — umwandeln, zusammenfügen, unterschreiben, auslesen.',
        accent: '#90a8ed',
        icon: ICONS.dokumente,
        storyIds: [
            'story-heic-portal',
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
        description: 'Für kleine Websites — Snippet-Vorschau und Sitemap-Prüfung. Kommt bald.',
        accent: '#c3aef0',
        icon: ICONS.seo,
        storyIds: ['story-seo-meta-preview', 'story-seo-sitemap'],
    },
} as const satisfies Record<AreaDefinition['id'], AreaDefinition>;

export const areaOrder = [
    'buchhaltung',
    'behoerden',
    'dokumente',
    'security',
    'seo',
] as const satisfies readonly AreaId[];
