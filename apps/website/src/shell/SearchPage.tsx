import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { getTool } from '../data/catalog';
import { EXAMPLE_SEARCH_CHIPS } from '../search/fixtures/queries';
import {
    chromeAiSearchAvailable,
    getSemanticScoreState,
    resolveSearch,
    type ScoredResult,
} from '../search';
import { searchPath } from '../routing/paths';
import { PageHead } from '../seo/PageHead';
import { BackButton, Badge, BrutalInput, SectionLabel } from './components/Primitives';

function kindLabel(kind: ScoredResult['document']['kind']): string {
    switch (kind) {
        case 'tool':
            return 'Tool';
        case 'variant':
            return 'Variante';
        case 'story':
            return 'Situation';
        case 'area':
            return 'Bereich';
        case 'template':
            return 'Vorlage';
    }
}

function sourceLabel(source: ScoredResult['source']): string {
    switch (source) {
        case 'lexical':
            return 'Stichwort';
        case 'semantic':
            return 'Bedeutung';
        case 'chrome':
            return 'Chrome KI';
        case 'hybrid':
            return 'Hybrid';
    }
}

export function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const urlQuery = searchParams.get('q') ?? '';
    const [localQuery, setLocalQuery] = useState(urlQuery);
    const [results, setResults] = useState<ScoredResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [semanticState, setSemanticState] = useState(getSemanticScoreState());
    const [showBreakdown, setShowBreakdown] = useState(false);

    const chromeAvailable = useMemo(() => chromeAiSearchAvailable(), []);

    useEffect(() => {
        setLocalQuery(urlQuery);
    }, [urlQuery]);

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            setLoading(true);
            void resolveSearch(localQuery, {
                chromeAi: settings.chromeSearchAi,
                showBreakdown,
                limit: 16,
            }).then((next) => {
                if (cancelled) return;
                setResults(next);
                setSemanticState(getSemanticScoreState());
                setLoading(false);
            });
        }, localQuery === urlQuery ? 0 : 250);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [localQuery, urlQuery, settings.chromeSearchAi, showBreakdown]);

    const submitQuery = useCallback(
        (value: string) => {
            const trimmed = value.trim();
            if (trimmed) {
                setSearchParams({ q: trimmed }, { replace: true });
            } else {
                setSearchParams({}, { replace: true });
            }
        },
        [setSearchParams],
    );

    const openResult = useCallback(
        (result: ScoredResult) => {
            navigate(result.document.href);
        },
        [navigate],
    );

    const statusHint = useMemo(() => {
        if (loading) return 'Suche läuft …';
        if (semanticState === 'loading') return 'Bedeutungssuche wird geladen …';
        if (semanticState === 'unavailable') return 'Nur Stichwortsuche (Embeddings nicht geladen)';
        if (settings.chromeSearchAi && chromeAvailable) return 'Hybrid-Suche · Chrome KI bereit';
        return 'Hybrid-Suche aktiv';
    }, [chromeAvailable, loading, semanticState, settings.chromeSearchAi]);

    return (
        <main className="mx-auto w-full max-w-[840px] px-4 py-6 md:px-6 md:py-8">
            <PageHead
                fallbackTitle="Suche"
                description="Finde Tools, Situationen und Varianten auf macheseinfach — lokal im Browser."
                canonicalPath={searchPath(localQuery || undefined)}
            />
            <BackButton />

            <div className="mt-4">
                <h1 className="font-display text-[30px] leading-[1.05] font-bold tracking-[-0.02em] sm:text-[34px]">
                    Suche
                </h1>
                <p className="mt-2 text-[15px] text-[var(--color-ink-soft)]">
                    Stichwörter, Formate und ganze Sätze — wir finden passende Tools und Situationen.
                </p>
            </div>

            <form
                className="mt-6"
                onSubmit={(e) => {
                    e.preventDefault();
                    submitQuery(localQuery);
                }}
            >
                <label htmlFor="global-search" className="sr-only">
                    Suche
                </label>
                <div className="relative">
                    <svg
                        viewBox="0 0 24 24"
                        className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-[var(--color-ink-soft)]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        aria-hidden
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path d="M20 20l-4-4" />
                    </svg>
                    <BrutalInput
                        id="global-search"
                        type="search"
                        autoFocus
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                        placeholder="z. B. HEIC zu PNG, PDF verkleinern, IBAN prüfen …"
                        className="py-3 pr-3 pl-10"
                    />
                </div>
                <p className="mt-2 text-[12px] text-[var(--color-ink-muted)]">{statusHint}</p>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
                {EXAMPLE_SEARCH_CHIPS.map((chip) => (
                    <button
                        key={chip}
                        type="button"
                        onClick={() => {
                            setLocalQuery(chip);
                            submitQuery(chip);
                        }}
                        className="ms-focus rounded-full border-2 border-black bg-[var(--color-chip)] px-3 py-1 font-display text-[12px] font-semibold shadow-brutal-sm transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal"
                    >
                        {chip}
                    </button>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
                <button
                    type="button"
                    role="switch"
                    aria-checked={showBreakdown}
                    onClick={() => setShowBreakdown((v) => !v)}
                    className="ms-focus text-[12px] text-[var(--color-ink-soft)] underline"
                >
                    Score-Aufschlüsselung {showBreakdown ? 'aus' : 'an'}
                </button>
            </div>

            <section className="mt-6" aria-live="polite">
                <SectionLabel>
                    {localQuery.trim() ? `Ergebnisse (${results.length})` : 'Beliebte Tools'}
                </SectionLabel>

                {loading ? (
                    <p className="mt-3 text-[14px] text-[var(--color-ink-muted)]">…</p>
                ) : results.length === 0 ? (
                    <p className="mt-3 text-[14px] text-[var(--color-ink-muted)]">
                        Keine Treffer. Probiere ein anderes Stichwort oder eine Beispiel-Chip oben.
                    </p>
                ) : (
                    <ul className="mt-2 space-y-2">
                        {results.map((result) => (
                            <li key={result.document.id}>
                                <button
                                    type="button"
                                    onClick={() => openResult(result)}
                                    className="ms-focus ms-card ms-card-hover w-full p-4 text-left"
                                >
                                    <span className="flex flex-wrap items-center gap-2">
                                        <span className="font-display text-[16px] font-bold">
                                            {result.document.title}
                                        </span>
                                        <Badge className="text-[10px]">
                                            {kindLabel(result.document.kind)}
                                        </Badge>
                                        <Badge className="border-black bg-[var(--color-chip)] text-[10px]">
                                            {sourceLabel(result.source)}
                                        </Badge>
                                    </span>
                                    <span className="mt-1 block text-[13px] text-[var(--color-ink-soft)]">
                                        {result.document.subtitle}
                                    </span>
                                    {result.document.toolId ? (
                                        <span className="mt-2 block font-mono text-[11px] text-[var(--color-ink-muted)]">
                                            {getTool(result.document.toolId).command}
                                        </span>
                                    ) : null}
                                    {showBreakdown && result.breakdown ? (
                                        <span className="mt-2 block font-mono text-[10px] text-[var(--color-ink-muted)]">
                                            L:{result.breakdown.lexical.toFixed(2)} S:
                                            {result.breakdown.semantic.toFixed(2)} B:
                                            {result.breakdown.slotBoost.toFixed(2)}
                                            {result.breakdown.chrome != null
                                                ? ` C:${result.breakdown.chrome.toFixed(2)}`
                                                : ''}{' '}
                                            → {result.breakdown.merged.toFixed(2)}
                                        </span>
                                    ) : null}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
