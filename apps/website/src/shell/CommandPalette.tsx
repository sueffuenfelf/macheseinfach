import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { getTool, searchTools, type Tool, type ToolId } from '../data/catalog';
import { copyToClipboard } from '../lib/format';
import { useToast } from './toast';
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

type CommandPaletteProps = {
    open: boolean;
    toolIds?: readonly ToolId[];
    onClose: () => void;
    onSelectScenario: (tool: Tool) => void;
};

export function CommandPalette({ open, toolIds, onClose, onSelectScenario }: CommandPaletteProps) {
    const { settings } = useSettings();
    const { toast } = useToast();
    const [localQuery, setLocalQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [result, setResult] = useState<CommandResult | null>(null);
    const [running, setRunning] = useState(false);

    const commandMode = isCommandMode(localQuery);
    const workspaceTools = useMemo(
        () => (toolIds && toolIds.length > 0 ? toolIds.map((toolId) => getTool(toolId)) : null),
        [toolIds],
    );
    const toolResults = useMemo(() => {
        if (commandMode) return [];
        const found = searchTools(localQuery);
        if (!workspaceTools) return found;
        const allowed = new Set(workspaceTools.map((tool) => tool.id));
        return found.filter((tool) => allowed.has(tool.id));
    }, [localQuery, commandMode, workspaceTools]);
    const commandResults = useMemo(
        () => (commandMode ? filterSlashCommands(localQuery) : []),
        [localQuery, commandMode],
    );

    const parsed = useMemo(() => parseSlashInput(localQuery), [localQuery]);
    const exactCommand = parsed?.commandName ? commandResults.find((c) => c.name === parsed.commandName) : undefined;

    const listItems = commandMode ? commandResults : toolResults;

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
        if (result) return;
        if (listItems.length === 0) {
            setActiveIndex(0);
            return;
        }
        setActiveIndex((prev) => Math.min(prev, listItems.length - 1));
    }, [listItems, result]);

    const copyResult = useCallback(
        async (next: CommandResult) => {
            const toCopy = next.copyText ?? next.output;
            if (!toCopy) return;
            const ok = await copyToClipboard(toCopy);
            if (ok) {
                toast({
                    message: next.feedback ?? 'In Zwischenablage kopiert',
                    variant: next.status === 'error' ? 'error' : next.status === 'info' ? 'info' : 'success',
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

    const buildQueryForCommand = useCallback((cmd: SlashCommand) => {
        const parsedInput = parseSlashInput(localQuery);
        if (parsedInput?.args) return `/${cmd.name} ${parsedInput.args}`;
        return `/${cmd.name}`;
    }, [localQuery]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (result) {
                    setResult(null);
                    return;
                }
                onClose();
                return;
            }
            if (result) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    void runCommand(localQuery);
                }
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((prev) => (listItems.length === 0 ? 0 : (prev + 1) % listItems.length));
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((prev) =>
                    listItems.length === 0 ? 0 : (prev - 1 + listItems.length) % listItems.length,
                );
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
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
                const tool = toolResults[activeIndex];
                if (tool) {
                    onSelectScenario(tool);
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [
        activeIndex,
        buildQueryForCommand,
        commandMode,
        commandResults,
        exactCommand,
        listItems.length,
        localQuery,
        onClose,
        onSelectScenario,
        open,
        result,
        runCommand,
        toolResults,
    ]);

    if (!open) return null;

    const statusColors: Record<CommandResult['status'], string> = {
        success: 'bg-[var(--color-success)]',
        error: 'border-[var(--color-danger)] bg-[#fff5f5]',
        info: 'bg-[var(--color-chip)]',
    };

    const canCopy = Boolean(result && result.status !== 'error' && (result.copyText ?? result.output));

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
                aria-label={commandMode ? 'Schnellbefehle' : 'Tool-Suche'}
                className="ms-animate-pop relative w-full max-w-[32rem] overflow-hidden rounded-[16px] border-2 border-black bg-white shadow-brutal-lg"
            >
                <div className="border-b-2 border-black px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <Badge className="text-[10px]">
                            {commandMode ? 'Befehl' : 'Suche'}
                        </Badge>
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
                            id="command-search"
                            type="search"
                            autoFocus
                            placeholder="Tool oder /befehl …"
                            value={localQuery}
                            onChange={(e) => {
                                setLocalQuery(e.target.value);
                                setResult(null);
                            }}
                            className="ms-input ms-focus py-3 pr-3 pl-10"
                        />
                    </div>
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

                <div className="max-h-[50vh] overflow-y-auto px-2 pb-3">
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
                                        <span className="text-[11px] text-[var(--color-ink-muted)]">…</span>
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
                                            onClick={() => void runCommand(buildQueryForCommand(cmd))}
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
                                    Kein passender Befehl. Tippe <span className="font-mono">/</span> für die
                                    vollständige Liste.
                                </p>
                            ) : null}
                        </>
                    ) : (
                        <>
                            <SectionLabel className="px-2 py-2">Tools</SectionLabel>
                            <ul>
                                {toolResults.map((tool, index) => (
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
                                                    <span
                                                        key={t}
                                                        className="ms-badge border-black bg-[var(--color-chip)] text-[10px]"
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            {toolResults.length === 0 ? (
                                <p className="px-3 py-4 text-sm text-[var(--color-ink-muted)]">
                                    Kein Tool gefunden. Für Schnellbefehle mit <span className="font-mono">/</span>{' '}
                                    beginnen.
                                </p>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
