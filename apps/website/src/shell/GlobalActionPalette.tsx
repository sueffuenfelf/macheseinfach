import { useEffect, useMemo, useState } from 'react';
import { Badge, SectionLabel } from './components/Primitives';

export type GlobalAction = {
    id: string;
    label: string;
    hint?: string;
    run: () => void;
};

type GlobalActionPaletteProps = {
    open: boolean;
    actions: readonly GlobalAction[];
    onClose: () => void;
};

export function GlobalActionPalette({ open, actions, onClose }: GlobalActionPaletteProps) {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return [...actions];
        return actions.filter(
            (action) =>
                action.label.toLowerCase().includes(normalized) ||
                action.hint?.toLowerCase().includes(normalized),
        );
    }, [actions, query]);

    useEffect(() => {
        if (!open) {
            setQuery('');
            setActiveIndex(0);
            return;
        }
        setActiveIndex((prev) => Math.min(prev, Math.max(filtered.length - 1, 0)));
    }, [filtered.length, open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
                return;
            }
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveIndex((prev) => (filtered.length === 0 ? 0 : (prev + 1) % filtered.length));
                return;
            }
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveIndex((prev) => (filtered.length === 0 ? 0 : (prev - 1 + filtered.length) % filtered.length));
                return;
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                const action = filtered[activeIndex];
                if (!action) return;
                action.run();
                onClose();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [activeIndex, filtered, onClose, open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]">
            <button
                type="button"
                className="absolute inset-0 bg-black/35 backdrop-blur-[4px]"
                aria-label="Palette schließen"
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Globale Aktionen"
                className="ms-animate-pop relative w-full max-w-[32rem] overflow-hidden rounded-[16px] border-2 border-black bg-white shadow-brutal-lg"
            >
                <div className="border-b-2 border-black px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <Badge className="text-[10px]">Global</Badge>
                        <span className="ms-kbd">Esc</span>
                    </div>
                    <div className="relative mt-2.5">
                        <svg
                            viewBox="0 0 24 24"
                            className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-[var(--color-ink-soft)]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="M20 20l-4-4" />
                        </svg>
                        <input
                            type="search"
                            autoFocus
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Aktionen suchen …"
                            className="ms-input ms-focus py-3 pr-3 pl-10"
                        />
                    </div>
                </div>
                <div className="max-h-[50vh] overflow-y-auto px-2 pb-3">
                    <SectionLabel className="px-2 py-2">Aktionen</SectionLabel>
                    <ul>
                        {filtered.map((action, index) => (
                            <li key={action.id}>
                                <button
                                    type="button"
                                    className={`ms-focus w-full rounded-[10px] px-3 py-2.5 text-left transition ${
                                        index === activeIndex ? 'bg-[var(--color-success)]' : 'hover:bg-[var(--color-chip)]'
                                    }`}
                                    onClick={() => {
                                        action.run();
                                        onClose();
                                    }}
                                >
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="font-display text-[14px] font-semibold text-[var(--color-ink)]">
                                            {action.label}
                                        </span>
                                        {action.hint ? (
                                            <span className="font-mono text-[11px] text-[var(--color-ink-muted)]">
                                                {action.hint}
                                            </span>
                                        ) : null}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    {filtered.length === 0 ? (
                        <p className="px-3 py-4 text-sm text-[var(--color-ink-muted)]">Keine Aktion gefunden.</p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
