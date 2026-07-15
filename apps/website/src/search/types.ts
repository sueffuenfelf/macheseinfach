import type { AreaId, StoryId, ToolId } from '../data/catalog/types';

export type SearchDocumentKind = 'tool' | 'variant' | 'story' | 'area' | 'template';

export type DocumentSlots = {
    formats: string[];
    actions: string[];
    context: string[];
    multiStep: boolean;
};

export type SearchDocument = {
    readonly id: string;
    readonly kind: SearchDocumentKind;
    readonly title: string;
    readonly subtitle: string;
    readonly body: string;
    readonly keywords: readonly string[];
    readonly slots: DocumentSlots;
    readonly href: string;
    readonly toolId?: ToolId;
    readonly areaId?: AreaId;
    readonly storyId?: StoryId;
    readonly variantSlug?: string;
};

export type ScoreBreakdown = {
    lexical: number;
    semantic: number;
    slotBoost: number;
    chrome?: number;
    merged: number;
};

export type ScoredResult = {
    document: SearchDocument;
    score: number;
    breakdown?: ScoreBreakdown;
    source: 'lexical' | 'semantic' | 'chrome' | 'hybrid';
};

export type QuerySlots = {
    formats: string[];
    actions: string[];
    context: string[];
    multiStep: boolean;
};

export type ResolveSearchOptions = {
    /** Chrome Prompt API für Stage 3 (default: true wenn verfügbar) */
    chromeAi?: boolean;
    /** Score-Aufschlüsselung in Ergebnissen */
    showBreakdown?: boolean;
    limit?: number;
};

export type ChromeIntentResult = {
    documentIds: string[];
    reasoning?: string;
};
