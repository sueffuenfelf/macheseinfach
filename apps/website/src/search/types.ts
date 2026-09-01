import type { AreaId, ToolId } from '../data/catalog/types';

export type SearchDocumentKind = 'tool' | 'variant' | 'area';

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

import type { ParsedSearchFilters } from './filters';

export type ResolveSearchOptions = {
    /** Chrome Prompt API für Stage 3 (default: true wenn verfügbar) */
    chromeAi?: boolean;
    /** Score-Aufschlüsselung in Ergebnissen */
    showBreakdown?: boolean;
    limit?: number;
    /** Pre-parsed @filters — wenn gesetzt, überschreibt parseSearchFilters(query) */
    filters?: ParsedSearchFilters;
};

export type ChromeIntentResult = {
    documentIds: string[];
    reasoning?: string;
};
