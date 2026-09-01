import { useState } from 'react';
import type { ToolDefinition } from '../../../data/catalog/types';
import { consumePasteTextPrefill } from '../../../assistant/tool-prefill';
import { ResultCard } from '../_shared';
import type { PasteFinding, PasteSeverity, ResultTone } from './types';

export type PasteAnalyzeToolShellProps = {
    tool: ToolDefinition;
    analyze: (input: string) => PasteFinding[] | Promise<PasteFinding[]>;
    placeholder?: string;
    submitLabel?: string;
    allowUrl?: boolean;
    urlHint?: string;
    intro?: string;
    pasteInputKey?: string;
};

const SEVERITY_TONE: Record<PasteSeverity, ResultTone> = {
    ok: 'success',
    info: 'info',
    warn: 'warn',
    error: 'danger',
};

const SEVERITY_LABEL: Record<PasteSeverity, string> = {
    ok: 'OK',
    info: 'Hinweis',
    warn: 'Warnung',
    error: 'Fehler',
};

export function PasteAnalyzeToolShell({
    tool,
    analyze,
    placeholder = 'Text hier einfügen …',
    submitLabel = 'Analysieren',
    allowUrl = false,
    urlHint = 'URL laden sendet eine Anfrage nach außen — nur nutzen, wenn du der Quelle vertraust.',
    intro,
}: PasteAnalyzeToolShellProps) {
    const [mode, setMode] = useState<'text' | 'url'>('text');
    const [localInput, setLocalInput] = useState(() => consumePasteTextPrefill(tool.id) ?? '');
    const [findings, setFindings] = useState<PasteFinding[] | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const text = localInput.trim();
        if (!text) return;
        setLoading(true);
        try {
            setFindings(await analyze(text));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6">
            {intro ? (
                <p className="text-[14px] leading-snug text-[var(--color-ink-soft)]">{intro}</p>
            ) : null}

            {allowUrl ? (
                <div className="flex flex-wrap gap-2">
                    {(
                        [
                            { id: 'text' as const, label: 'Text' },
                            { id: 'url' as const, label: 'URL' },
                        ] as const
                    ).map((tab) => {
                        const selected = mode === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                aria-pressed={selected}
                                className={`rounded-lg border-2 border-black px-3 py-2 font-display text-[12px] font-bold uppercase tracking-[0.04em] shadow-[2px_2px_0_#000] ${
                                    selected ? 'bg-black text-white' : 'bg-white'
                                }`}
                                onClick={() => {
                                    setMode(tab.id);
                                    setFindings(null);
                                }}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-3">
                <div>
                    <label
                        htmlFor={`${tool.id}-paste`}
                        className="mb-1 block font-display text-[12px] font-bold uppercase tracking-[0.05em]"
                    >
                        {mode === 'url' ? 'URL' : 'Eingabe'}
                    </label>
                    {mode === 'url' ? (
                        <input
                            id={`${tool.id}-paste`}
                            className="ms-input"
                            value={localInput}
                            onChange={(e) => setLocalInput(e.target.value)}
                            placeholder="https://…"
                            data-testid="paste-primary-input"
                        />
                    ) : (
                        <textarea
                            id={`${tool.id}-paste`}
                            className="ms-input min-h-[160px] resize-y py-3 font-mono text-[13px] leading-relaxed"
                            value={localInput}
                            onChange={(e) => setLocalInput(e.target.value)}
                            placeholder={placeholder}
                            data-testid="paste-primary-input"
                        />
                    )}
                    {mode === 'url' ? (
                        <p className="mt-1 text-[12.5px] text-[var(--color-ink-soft)]">{urlHint}</p>
                    ) : null}
                </div>
                <button type="submit" className="ms-btn-primary h-[44px]" disabled={loading}>
                    {loading ? 'Analysiere …' : submitLabel}
                </button>
            </form>

            {findings ? (
                <div className="space-y-3">
                    {findings.length === 0 ? (
                        <ResultCard tone="info" heading="Keine Befunde">
                            <p className="text-[14px]">
                                Die Analyse hat nichts Auffälliges gefunden.
                            </p>
                        </ResultCard>
                    ) : (
                        findings.map((finding) => (
                            <ResultCard
                                key={finding.id}
                                tone={SEVERITY_TONE[finding.severity]}
                                heading={
                                    <span className="inline-flex items-center gap-2">
                                        <span className="rounded border-2 border-black bg-white px-1.5 py-0.5 font-display text-[11px] uppercase">
                                            {SEVERITY_LABEL[finding.severity]}
                                        </span>
                                        {finding.title}
                                    </span>
                                }
                            >
                                {finding.detail ? (
                                    <p className="text-[14px] leading-snug">{finding.detail}</p>
                                ) : null}
                            </ResultCard>
                        ))
                    )}
                </div>
            ) : null}
        </div>
    );
}
