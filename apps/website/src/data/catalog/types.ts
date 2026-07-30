/** Alle gültigen Bereichs-IDs — User-Story-Gruppen */
export const AREA_IDS = [
    'buchhaltung',
    'behoerden',
    'bilder',
    'dokumente',
    'security',
    'seo',
    'text',
    'zeit',
    'wohnen',
    'einheiten',
    'web',
    'steuern',
    'recht',
    'kommunikation',
    'barrierefreiheit',
    'kreativ',
] as const;

export type AreaId = (typeof AREA_IDS)[number];
export type ToolId = string;

/** User-Story-IDs — kategorisiert über areaId (P1: → FlowId / flow-*) */
export const STORY_IDS = [
    'story-elster-pdf-limit',
    'story-vermieter-gehalt-schwaarzen',
    'story-vermieter-nachweis',
    'story-formular-ausfuellen',
    'story-freelancer-girocode',
    'story-freelancer-zahlung',
    'story-iban-vor-ueberweisung',
    'story-iban-aus-rechnung',
    'story-heic-portal',
    'story-bild-format-aendern',
    'story-bild-verkleinern',
    'story-bild-ausrichten',
    'story-bild-metadaten',
    'story-portal-foto',
    'story-bewerbung-eine-pdf',
    'story-vertrag-unterschreiben',
    'story-scan-text-kopieren',
    'story-leak-email-passwort',
    'story-seo-meta-preview',
    'story-seo-sitemap',
    'story-skonto-rechnung',
    'story-passfoto-portal',
    'story-seiten-extrahieren',
    'story-passwort-staerke',
    'story-passwort-erzeugen',
    'story-phishing-link',
    'story-phishing-email',
    'story-seo-robots',
    'story-seo-og',
    'story-seo-title',
    'story-zeichen-zaehlen',
    'story-woerter-zaehlen',
    'story-text-diff',
    'story-gross-klein',
    'story-markdown-vorschau',
    'story-frist-tage',
    'story-werktage',
    'story-kalenderwoche',
    'story-feiertage',
    'story-countdown',
    'story-warm-kalt-miete',
    'story-nebenkosten',
    'story-kaution',
    'story-kuendigung-miete',
    'story-laenge-umrechnen',
    'story-gewicht-umrechnen',
    'story-prozent',
    'story-temperatur',
    'story-dateigroesse',
    'story-json-format',
    'story-base64',
    'story-url-encode',
    'story-html-escape',
    'story-uuid',
    'story-mwst-steuer',
    'story-afa',
    'story-homeoffice',
    'story-pendlerpauschale',
    'story-kleinunternehmer-steuer',
    'story-vertrag-kuendigen',
    'story-widerruf',
    'story-aufbewahrung',
    'story-verjaehrung',
    'story-probezeit',
    'story-vcard-qr',
    'story-whatsapp-link',
    'story-email-signatur',
    'story-termin-einladung',
    'story-abwesenheit',
    'story-kontrast',
    'story-alt-text-laenge',
    'story-ueberschriften',
    'story-fokus-sichtbar',
    'story-link-text',
    'story-hex-rgb',
    'story-farbpalette',
    'story-gradient-css',
    'story-farbe-aufhellen',
    'story-marken-kontrast',
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

/** Generische Slot-Kinds — area-agnostisch, nicht PDF-spezifisch */
export type FlowSlotKind =
    | 'file' // einzelne Datei; accept via mime/ext
    | 'files' // File[]
    | 'image' // File, typischerweise image/* (Convenience über file+accept)
    | 'text' // einzeilig
    | 'multiline' // Textarea / Paste-Body
    | 'currency' // number + DE-Rohstring optional
    | 'iban' // normalisierter String
    | 'url'
    | 'date' // ISO date string
    | 'json' // string (validiertes JSON) oder unknown
    | 'password' // string — session-only, nie persistieren
    | 'enum'; // string ∈ options

export const FLOW_SLOT_KINDS = [
    'file',
    'files',
    'image',
    'text',
    'multiline',
    'currency',
    'iban',
    'url',
    'date',
    'json',
    'password',
    'enum',
] as const satisfies readonly FlowSlotKind[];

export type FlowSlotAccept = {
    readonly mime?: readonly string[]; // e.g. ['application/pdf', 'image/*']
    readonly ext?: readonly string[]; // e.g. ['.pdf', '.png']
    readonly maxBytes?: number; // hard limit pro Slot
};

export type FlowSlotPersist = 'session-scalar' | 'memory' | 'never';

export type FlowSlotDef = {
    readonly id: string; // 'sourceDoc' | 'iban' | 'metaHtml' | …
    readonly kind: FlowSlotKind;
    readonly label: string;
    readonly required?: boolean;
    readonly accept?: FlowSlotAccept; // file/files/image
    readonly options?: readonly { value: string; label: string }[]; // enum
    /** password: immer sessionOnly; andere Slots default persistScalars */
    readonly persist?: FlowSlotPersist;
};

export type FlowContextSchema = {
    readonly slots: readonly FlowSlotDef[];
};

export type FlowStep = {
    readonly toolId: ToolId;
    readonly label: string;
    readonly why?: string;
    readonly optional?: boolean;
};

export type FlowRecommendation = {
    readonly toolId: ToolId;
    readonly reason: string;
};

/**
 * toolId → { toolInputKey → flowSlotId }
 * toolInputKey = Shell-Field-Id ODER bespoke Key ('pdf', 'source', 'paste', …)
 */
export type FlowStepBindings = Readonly<Record<ToolId, Readonly<Record<string, string>>>>;

/**
 * Vorhaben (UI) — Multi-Tool-Journey mit shared Context.
 * IDs/Datei bleiben in P0 `story-*` / `stories.ts` (Rename in P1).
 */
export type FlowDefinition = {
    readonly id: StoryId;
    readonly slug: string;
    readonly areaIds: readonly AreaId[]; // primary first
    readonly role: string;
    readonly want: string;
    readonly title: string;
    /** Ausgangslage — Problemtext, nicht der Produktname „Vorhaben“ */
    readonly situation: string;
    readonly outcome: string;
    readonly status: 'ready' | 'planned';
    readonly steps: readonly FlowStep[];
    readonly recommended?: readonly FlowRecommendation[];
    readonly context: FlowContextSchema;
    readonly stepBindings: FlowStepBindings;
};

/** Alias während Migration (P0) */
export type UserStory = FlowDefinition;

/** Default-Persist-Policy pro Slot-Kind */
export function defaultPersistForKind(kind: FlowSlotKind): FlowSlotPersist {
    switch (kind) {
        case 'password':
            return 'never';
        case 'file':
        case 'files':
        case 'image':
            return 'memory';
        default:
            return 'session-scalar';
    }
}

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
