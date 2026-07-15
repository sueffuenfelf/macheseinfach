/** Alle gültigen Bereichs-IDs — User-Story-Gruppen */
export const AREA_IDS = [
    'buchhaltung',
    'behoerden',
    'bilder',
    'dokumente',
    'security',
    'seo',
] as const;

export type AreaId = (typeof AREA_IDS)[number];
export type ToolId = string;

/** User-Story-IDs — kategorisiert über areaId */
export const STORY_IDS = [
    'story-elster-pdf-limit',
    'story-vermieter-gehalt-schwaarzen',
    'story-freelancer-girocode',
    'story-iban-vor-ueberweisung',
    'story-iban-aus-rechnung',
    'story-heic-portal',
    'story-bild-format-aendern',
    'story-bild-verkleinern',
    'story-bild-ausrichten',
    'story-bild-metadaten',
    'story-bild-pipeline',
    'story-bewerbung-eine-pdf',
    'story-vertrag-unterschreiben',
    'story-scan-text-kopieren',
    'story-leak-email-passwort',
    'story-seo-meta-preview',
    'story-seo-sitemap',
] as const;

export type StoryId = (typeof STORY_IDS)[number];

export type ScenarioEntry = 'file' | 'form' | 'file-or-form';

export type ToolMaturity = 'stable' | 'beta' | 'planned';

export type ToolTheme = {
    accent: string;
    accentStrong: string;
    accentSoft: string;
};

/** Bereich = Gruppe von User Stories (z. B. Buchhaltung, SEO) */
export type AreaDefinition = {
    readonly id: AreaId;
    /** URL-Segment unter /bereich/:slug */
    readonly slug: string;
    readonly label: string;
    readonly shortLabel: string;
    readonly description: string;
    /** Hex-Akzentfarbe (neo-brutalist palette) */
    readonly accent: string;
    /** Inline-SVG (24x24, stroke=#000) als String */
    readonly icon: string;
    readonly storyIds: readonly StoryId[];
};

/** User Story — UX-Einstieg; kann in mehreren Bereichen sichtbar sein */
export type UserStory = {
    readonly id: StoryId;
    /** URL-Segment unter /bereich/:areaSlug/:slug */
    readonly slug: string;
    /** Primärer Bereich + optionale Querverweise (z. B. gleiche Story in Buchhaltung & Dokumente) */
    readonly areaIds: readonly AreaId[];
    readonly role: string;
    readonly want: string;
    readonly title: string;
    readonly situation: string;
    readonly outcome: string;
    readonly toolIds: readonly ToolId[];
    readonly status: 'ready' | 'planned';
};

/** Tool — kann in mehreren Bereichen vorkommen (areas[]) */
export type ToolDefinition = {
    readonly id: ToolId;
    /** URL-Segment unter …/:toolSlug oder /tool/:slug */
    readonly slug: string;
    readonly shortTitle: string;
    readonly title: string;
    readonly sub: string;
    readonly pain: string;
    readonly solution: string;
    readonly trust: string;
    readonly tags: readonly string[];
    readonly keywords: readonly string[];
    readonly fileHints: readonly string[];
    readonly command: string;
    readonly entry: ScenarioEntry;
    readonly entryPlaceholder?: string;
    readonly theme: ToolTheme;
    readonly maturity: ToolMaturity;
    /** Bereiche, in denen dieses Tool erscheint — M:N */
    readonly areas: readonly AreaId[];
    /** Stories, die dieses Tool adressiert */
    readonly storyIds: readonly StoryId[];
};

export type CatalogValidationIssue = {
    code: string;
    message: string;
};

export type CatalogValidationResult = {
    ok: boolean;
    issues: CatalogValidationIssue[];
};
