import { useEffect, useMemo, useState } from 'react';
import { searchTools, type Tool } from '../data/catalog';
import { Badge, SectionLabel } from './components/Primitives';

type CommandPaletteProps = {
    open: boolean;
    onClose: () => void;
    onSelectScenario: (tool: Tool) => void;
};

const quickCommands = [
    { label: 'Passwort generieren (16 Zeichen)', command: '/pw 16', hint: 'Power-User — kommt in v0.2' },
    { label: 'IBAN aus Zwischenablage', command: '/iban paste', hint: 'Clipboard-Erkennung — Platzhalter' },
] as const;

export function CommandPalette({ open, onClose, onSelectScenario }: CommandPaletteProps) {
    const [localQuery, setLocalQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const results = useMemo(() => searchTools(localQuery), [localQuery]);

    useEffect(() => {
        if (!open) {
            setLocalQuery('');
            setActiveIndex(0);
        }
    }, [open]);

    useEffect(() => {
        if (results.length === 0) {
            setActiveIndex(0);
            return;
        }
        setActiveIndex((prev) => Math.min(prev, results.length - 1));
    }, [results]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((prev) => (results.length === 0 ? 0 : (prev + 1) % results.length));
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((prev) =>
                    results.length === 0 ? 0 : (prev - 1 + results.length) % results.length,
                );
                return;
            }
            if (e.key === 'Enter' && results[activeIndex]) {
                e.preventDefault();
                onSelectScenario(results[activeIndex]);
                onClose();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [activeIndex, onClose, onSelectScenario, open, results]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]">
            <button
                type="button"
                className="absolute inset-0 bg-black/35 backdrop-blur-[4px]"
                aria-label="Suche schließen"
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Tool-Suche"
                className="ms-animate-pop relative w-full max-w-[32rem] overflow-hidden rounded-[16px] border-2 border-black bg-white shadow-brutal-lg"
            >
                <div className="border-b-2 border-black px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <Badge className="text-[10px]">Suche</Badge>
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
                            id="command-search"
                            type="search"
                            autoFocus
                            placeholder="Tool oder Befehl …"
                            value={localQuery}
                            onChange={(e) => setLocalQuery(e.target.value)}
                            className="ms-input ms-focus py-3 pr-3 pl-10"
                        />
                    </div>
                </div>

                <div className="max-h-[50vh] overflow-y-auto px-2 pb-3">
                    <SectionLabel className="px-2 py-2">Tools</SectionLabel>
                    <ul>
                        {results.map((tool, index) => (
                            <li key={tool.id}>
                                <button
                                    type="button"
                                    className={`ms-focus w-full rounded-[10px] px-3 py-2.5 text-left transition ${
                                        index === activeIndex
                                            ? 'bg-[var(--color-success)]'
                                            : 'hover:bg-[var(--color-chip)]'
                                    }`}
                                    onClick={() => {
                                        onSelectScenario(tool);
                                        onClose();
                                    }}
                                >
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="font-display text-[14px] font-semibold text-[var(--color-ink)]">
                                            {tool.shortTitle}
                                        </span>
                                        <span className="font-mono text-[11px] text-[var(--color-ink-muted)]">
                                            {tool.command}
                                        </span>
                                    </span>
                                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                                        {tool.tags.slice(0, 3).map((t) => (
                                            <span key={t} className="ms-badge border-black bg-[var(--color-chip)] text-[10px]">
                                                {t}
                                            </span>
                                        ))}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    <SectionLabel className="mt-3 px-2 py-2">Schnellbefehle (Vorschau)</SectionLabel>
                    <ul className="space-y-1 px-1">
                        {quickCommands.map((cmd) => (
                            <li
                                key={cmd.command}
                                className="rounded-[10px] border-2 border-black bg-white px-3 py-2.5 text-sm text-[var(--color-ink-muted)]"
                            >
                                <span className="font-display text-[13px] font-semibold text-[var(--color-ink)]">{cmd.label}</span>
                                <span className="ml-2 font-mono text-[11px]">{cmd.command}</span>
                                <span className="mt-0.5 block text-[11px]">{cmd.hint}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
