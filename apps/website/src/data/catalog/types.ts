/** Alle gültigen Bereichs-IDs */
export const AREA_IDS = [
    'bilder',
    'dokumente',
    'text',
    'zeit',
    'einheiten',
    'web',
] as const;

export type AreaId = (typeof AREA_IDS)[number];
export type ToolId = string;

export type ScenarioEntry = 'file' | 'form' | 'file-or-form';

export type ToolMaturity = 'stable' | 'beta' | 'planned';

export type ToolTheme = {
    accent: string;
    accentStrong: string;
    accentSoft: string;
};

/** Bereich = Gruppe von Tools (z. B. Bilder, Text) */
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
};

/** Tool — kann in mehreren Bereichen vorkommen (areas[]) */
export type ToolDefinition = {
    readonly id: ToolId;
    /** URL-Segment unter /tool/:slug */
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
};

export type CatalogValidationIssue = {
    code: string;
    message: string;
};

export type CatalogValidationResult = {
    ok: boolean;
    issues: CatalogValidationIssue[];
};
