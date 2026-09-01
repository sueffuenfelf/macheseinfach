import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { type ToolId } from '../data/catalog';
import { filterHint, resolveSearch, type ScoredResult } from '../search';
import { homePath, settingsPath } from '../routing/paths';
import { copyToClipboard } from '../lib/format';
import { useToast } from './toast';
import { useDismissLayer } from './useDismissLayer';
import {
    executeSlashInput,
    filterSlashCommands,
    isCommandMode,
    parseSlashInput,
    slashCommands,
    type CommandResult,
    type SlashCommand,
} from './commands';
import { Badge, SectionLabel } from './components/Primitives';
import { SearchResultRow } from './SearchResultRow';
import { resolvePaletteSearchSelection } from './command-palette-selection';

type NavShortcut = {
    id: string;
    label: string;
    hint: string;
    run: () => void;
};

type PaletteRow = { kind: 'search'; entry: ScoredResult } | { kind: 'nav'; item: NavShortcut };

type CommandPaletteProps = {
    open: boolean;
    onClose: () => void;
    onSelectScenario: (toolId: ToolId) => void;
    onSelectResult?: (result: ScoredResult) => void;
};

export function CommandPalette({
    open,
    onClose,
    onSelectScenario,
    onSelectResult,
}: CommandPaletteProps) {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { toast } = useToast();
    const [localQuery, setLocalQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [result, setResult] = useState<CommandResult | null>(null);
    const [running, setRunning] = useState(false);
    const [searchResults, setSearchResults] = useState<ScoredResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultRef = useRef(result);
    resultRef.current = result;

    useDismissLayer(open, () => {
        if (resultRef.current) {
            setResult(null);
            return;
        }
        onClose();
    });

    const commandMode = isCommandMode(localQuery);

    const navShortcuts = useMemo<NavShortcut[]>(
        () => [
            { id: 'home', label: 'Startseite', hint: 'Home', run: () => navigate(homePath()) },
            {
                id: 'settings',
                label: 'Einstellungen',
                hint: 'Settings',
                run: () => navigate(settingsPath()),
            },
        ],
        [navigate],
    );

    const filteredNav = useMemo(() => {
        if (commandMode) return [];
        const q = localQuery.trim().toLowerCase();
        if (!q) return navShortcuts;
        return navShortcuts.filter(
            (item) => item.label.toLowerCase().includes(q) || item.hint.toLowerCase().includes(q),
        );
    }, [commandMode, localQuery, navShortcuts]);

    useEffect(() => {
        if (!open || commandMode) {
            setSearchResults([]);
            return;
        }

        let cancelled = false;
        const timer = setTimeout(() => {
            setSearchLoading(true);
            void resolveSearch(localQuery, {
                chromeAi: settings.chromeSearchAi,
                limit: 12,
            }).then((next) => {
                if (cancelled) return;
                setSearchResults(next);
                setSearchLoading(false);
            });
        }, 150);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [localQuery, commandMode, open, settings.chromeSearchAi]);
    const commandResults = useMemo(
        () => (commandMode ? filterSlashCommands(localQuery) : []),
        [localQuery, commandMode],
    );

    const parsed = useMemo(() => parseSlashInput(localQuery), [localQuery]);
    const exactCommand = parsed?.commandName
        ? commandResults.find((c) => c.name === parsed.commandName)
        : undefined;

    const listItems = commandMode ? commandResults : searchResults;

    const paletteRows = useMemo<PaletteRow[]>(() => {
        if (commandMode) return [];
        return [
            ...searchResults.map((entry) => ({ kind: 'search' as const, entry })),
            ...filteredNav.map((item) => ({ kind: 'nav' as const, item })),
        ];
    }, [commandMode, filteredNav, searchResults]);

    const resetState = useCallback(() => {
        setLocalQuery('');
        setActiveIndex(0);
        setResult(null);
        setRunning(false);
    }, []);

    useEffect(() => {
        if (!open) resetState();
    }, [open, resetState]);

    useEffect(() => {
        if (!open) return;
        const frame = requestAnimationFrame(() => inputRef.current?.focus());
        return () => cancelAnimationFrame(frame);
    }, [open]);

    useEffect(() => {
        if (result) return;
        const count = commandMode ? listItems.length : paletteRows.length;
        if (count === 0) {
            setActiveIndex(0);
            return;
        }
        setActiveIndex((prev) => Math.min(prev, count - 1));
    }, [commandMode, listItems, paletteRows, result]);

    const copyResult = useCallback(
        async (next: CommandResult) => {
            const toCopy = next.copyText ?? next.output;
            if (!toCopy) return;
            const ok = await copyToClipboard(toCopy);
            if (ok) {
                toast({
                    message: next.feedback ?? 'In Zwischenablage kopiert',
                    variant:
                        next.status === 'error'
                            ? 'error'
                            : next.status === 'info'
                              ? 'info'
                              : 'success',
                });
            } else {
                toast({ message: 'Kopieren war leider nicht möglich.', variant: 'error' });
            }
        },
        [toast],
    );

    const runCommand = useCallback(
        async (query: string) => {
            setRunning(true);
            try {
                const next = await executeSlashInput(query);
                setResult(next);

                if (next.status === 'error') {
                    toast({ message: next.output, variant: 'error' });
                    return;
                }

                const toCopy = next.copyText ?? next.output;
                if (!toCopy) return;

                if (settings.autoCopyCommandResults) {
                    await copyResult(next);
                }
            } finally {
                setRunning(false);
            }
        },
        [copyResult, settings.autoCopyCommandResults, toast],
    );

    const buildQueryForCommand = useCallback(
        (cmd: SlashCommand) => {
            const parsedInput = parseSlashInput(localQuery);
            if (parsedInput?.args) return `/${cmd.name} ${parsedInput.args}`;
            return `/${cmd.name}`;
        },
        [localQuery],
    );

    const activateSearchResult = useCallback(
        (entry: ScoredResult) => {
            if (onSelectResult) {
                onSelectResult(entry);
                return;
            }
            const selection = resolvePaletteSearchSelection(entry);
            if (selection.kind === 'tool') {
                onSelectScenario(selection.toolId);
            } else {
                navigate(selection.href);
            }
        },
        [navigate, onSelectResult, onSelectScenario],
    );

    const activateSelection = useCallback(() => {
        if (commandMode) {
            if (exactCommand) {
                void runCommand(buildQueryForCommand(exactCommand));
                return;
            }
            const selected = commandResults[activeIndex];
            if (selected) {
                void runCommand(buildQueryForCommand(selected));
                return;
            }
            void runCommand(localQuery);
            return;
        }
        const row = paletteRows[activeIndex];
        if (!row) return;
        if (row.kind === 'nav') {
            row.item.run();
            onClose();
            return;
        }
        const entry = row.entry;
        activateSearchResult(entry);
        onClose();
    }, [
        activeIndex,
        activateSearchResult,
        buildQueryForCommand,
        commandMode,
        commandResults,
        exactCommand,
        localQuery,
        onClose,
        paletteRows,
        runCommand,
    ]);

    const handleInputKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (result) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    void runCommand(localQuery);
                }
                return;
            }

            const count = commandMode ? listItems.length : paletteRows.length;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((prev) => (count === 0 ? 0 : (prev + 1) % count));
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((prev) => (count === 0 ? 0 : (prev - 1 + count) % count));
                return;
            }
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activateSelection();
            }
        },
        [
            activateSelection,
            commandMode,
            listItems.length,
            localQuery,
            paletteRows.length,
            result,
            runCommand,
        ],
    );

    if (!open) return null;

    const statusColors: Record<CommandResult['status'], string> = {
        success: 'bg-[var(--color-success)]',
        error: 'border-[var(--color-danger)] bg-[#fff5f5]',
        info: 'bg-[var(--color-chip)]',
    };

    const canCopy = Boolean(
        result && result.status !== 'error' && (result.copyText ?? result.output),
    );

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-3 py-3 sm:items-start sm:px-4 sm:pt-[10vh] sm:pb-0">
            <button
                type="button"
                className="absolute inset-0 bg-black/35 backdrop-blur-[4px]"
                aria-label="Suche schließen"
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label={commandMode ? 'Schnellbefehle' : 'Tool-Suche'}
                className="ms-animate-pop relative w-full max-w-[32rem] overflow-hidden rounded-[16px] border-2 border-black bg-white shadow-brutal-lg"
            >
                <div className="border-b-2 border-black px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <Badge className="text-[10px]">{commandMode ? 'Befehl' : 'Suche'}</Badge>
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
                            {commandMode ? (
                                <path d="M7 8l4 4 4-4M7 16h10" />
                            ) : (
                                <>
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="M20 20l-4-4" />
                                </>
                            )}
                        </svg>
                        <input
                            ref={inputRef}
                            id="command-search"
                            type="search"
                            autoFocus
                            placeholder="Suchen … @tools heic · /befehl"
                            value={localQuery}
                            onChange={(e) => {
                                setLocalQuery(e.target.value);
                                setResult(null);
                            }}
                            onKeyDown={handleInputKeyDown}
                            className="ms-input ms-focus py-3 pr-3 pl-10"
                        />
                    </div>
                    {!commandMode && !result ? (
                        <p className="mt-2 font-mono text-[11px] text-[var(--color-ink-muted)]">
                            Filter: {filterHint()}
                        </p>
                    ) : null}
                    {commandMode && !result && (
                        <p className="mt-2 font-mono text-[11px] text-[var(--color-ink-muted)]">
                            {parsed?.commandName
                                ? exactCommand
                                    ? `${exactCommand.usage} — Enter zum Ausführen`
                                    : 'Unbekannter Befehl — / für Hilfe'
                                : `${slashCommands.length} Schnellbefehle · Enter für Hilfe`}
                        </p>
                    )}
                </div>

                <div className="max-h-[66svh] overflow-y-auto px-2 pb-3 sm:max-h-[50vh]">
                    {result ? (
                        <div className="px-2 py-3">
                            <SectionLabel className="py-2">Ergebnis</SectionLabel>
                            <div
                                className={`rounded-[10px] border-2 border-black px-3 py-3 ${statusColors[result.status]}`}
                            >
                                <pre className="whitespace-pre-wrap break-all font-mono text-[12px] leading-relaxed text-[var(--color-ink)]">
                                    {result.output}
                                </pre>
                                {result.imageDataUrl ? (
                                    <img
                                        src={result.imageDataUrl}
                                        alt="QR-Vorschau"
                                        className="mt-3 max-w-[200px] rounded-[8px] border-2 border-black bg-white p-2"
                                    />
                                ) : null}
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    {canCopy && !settings.autoCopyCommandResults ? (
                                        <button
                                            type="button"
                                            className="ms-btn ms-focus px-2.5 py-1 text-[11px]"
                                            onClick={() => void copyResult(result)}
                                        >
                                            Kopieren
                                        </button>
                                    ) : null}
                                    {running ? (
                                        <span className="text-[11px] text-[var(--color-ink-muted)]">
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            className="ms-btn ms-focus px-2.5 py-1 text-[11px]"
                                            onClick={() => void runCommand(localQuery)}
                                        >
                                            Nochmal
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="ms-focus rounded-[8px] px-2 py-1 text-[11px] text-[var(--color-ink-muted)] underline"
                                        onClick={() => setResult(null)}
                                    >
                                        Zurück
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : commandMode ? (
                        <>
                            <SectionLabel className="px-2 py-2">
                                {parsed?.commandName ? 'Passende Befehle' : 'Schnellbefehle'}
                            </SectionLabel>
                            <ul>
                                {commandResults.map((cmd, index) => (
                                    <li key={cmd.name}>
                                        <button
                                            type="button"
                                            className={`ms-focus w-full rounded-[10px] px-3 py-2.5 text-left transition ${
                                                index === activeIndex
                                                    ? 'bg-[var(--color-success)]'
                                                    : 'hover:bg-[var(--color-chip)]'
                                            }`}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            onClick={() =>
                                                void runCommand(buildQueryForCommand(cmd))
                                            }
                                        >
                                            <span className="flex items-center justify-between gap-2">
                                                <span className="font-display text-[14px] font-semibold text-[var(--color-ink)]">
                                                    {cmd.description}
                                                </span>
                                                <span className="font-mono text-[11px] text-[var(--color-ink-muted)]">
                                                    {cmd.usage}
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            {commandResults.length === 0 ? (
                                <p className="px-3 py-4 text-sm text-[var(--color-ink-muted)]">
                                    Kein passender Befehl. Tippe{' '}
                                    <span className="font-mono">/</span> für die vollständige Liste.
                                </p>
                            ) : null}
                        </>
                    ) : (
                        <>
                            <SectionLabel className="px-2 py-2">
                                Treffer{searchLoading ? ' …' : ''}
                            </SectionLabel>
                            <ul>
                                {searchResults.map((entry, index) => (
                                    <li key={entry.document.id}>
                                        <SearchResultRow
                                            result={entry}
                                            compact
                                            active={index === activeIndex}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            onClick={() => {
                                                activateSearchResult(entry);
                                                onClose();
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                            {searchResults.length === 0 && !searchLoading ? (
                                <p className="px-3 py-4 text-sm text-[var(--color-ink-muted)]">
                                    Kein Treffer. Filter: {filterHint()} · Schnellbefehle mit{' '}
                                    <span className="font-mono">/</span>.
                                </p>
                            ) : null}
                            {filteredNav.length > 0 ? (
                                <>
                                    <SectionLabel className="px-2 py-2">Navigation</SectionLabel>
                                    <ul>
                                        {filteredNav.map((item, navIndex) => {
                                            const rowIndex = searchResults.length + navIndex;
                                            return (
                                                <li key={item.id}>
                                                    <button
                                                        type="button"
                                                        className={`ms-focus w-full rounded-[10px] px-3 py-2.5 text-left transition ${
                                                            rowIndex === activeIndex
                                                                ? 'bg-[var(--color-success)]'
                                                                : 'hover:bg-[var(--color-chip)]'
                                                        }`}
                                                        onMouseEnter={() =>
                                                            setActiveIndex(rowIndex)
                                                        }
                                                        onClick={() => {
                                                            item.run();
                                                            onClose();
                                                        }}
                                                    >
                                                        <span className="flex items-center justify-between gap-2">
                                                            <span className="font-display text-[14px] font-semibold text-[var(--color-ink)]">
                                                                {item.label}
                                                            </span>
                                                            <span className="font-mono text-[11px] text-[var(--color-ink-muted)]">
                                                                {item.hint}
                                                            </span>
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
