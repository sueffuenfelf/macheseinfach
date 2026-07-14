import { Input, Text } from '@macheseinfach/ui';
import { useEffect, useMemo, useState } from 'react';
import { searchScenarios, type Scenario } from '../../data/scenarios';

type CommandPaletteProps = {
    open: boolean;
    onClose: () => void;
    onSelectScenario: (scenario: Scenario) => void;
};

const quickCommands = [
    { label: 'Passwort generieren (16 Zeichen)', command: '/pw 16', hint: 'Power-User — kommt in v0.2' },
    { label: 'IBAN aus Zwischenablage', command: '/iban paste', hint: 'Clipboard-Erkennung — Platzhalter' },
] as const;

export function CommandPalette({ open, onClose, onSelectScenario }: CommandPaletteProps) {
    const [query, setQuery] = useState('');

    const results = useMemo(() => searchScenarios(query), [query]);

    useEffect(() => {
        if (!open) setQuery('');
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
            <button
                type="button"
                className="absolute inset-0 cursor-default border-0 bg-[var(--color-ink)]/40 backdrop-blur-sm"
                aria-label="Command Center schließen"
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Command Center"
                className="relative z-10 w-full max-w-xl overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-elevated)]"
            >
                <div className="border-b border-[var(--color-border)] p-4">
                    <Input
                        label="Command Center"
                        placeholder="Szenario suchen oder /befehl …"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                        hint="Strg+K · Esc schließen"
                    />
                </div>

                <div className="max-h-[50vh] overflow-y-auto p-2">
                    <Text variant="caption" className="px-2 py-1">
                        Szenarien
                    </Text>
                    <ul>
                        {results.map((scenario) => (
                            <li key={scenario.id}>
                                <button
                                    type="button"
                                    className="flex w-full cursor-pointer flex-col gap-0.5 rounded-[var(--radius-md)] px-3 py-2.5 text-left hover:bg-[var(--color-accent-soft)]"
                                    onClick={() => {
                                        onSelectScenario(scenario);
                                        onClose();
                                    }}
                                >
                                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                                        {scenario.title}
                                    </span>
                                    <span className="font-mono text-xs text-[var(--color-ink-muted)]">
                                        {scenario.command}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    <Text variant="caption" className="mt-4 px-2 py-1">
                        Schnellbefehle (Vorschau)
                    </Text>
                    <ul>
                        {quickCommands.map((cmd) => (
                            <li
                                key={cmd.command}
                                className="rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-[var(--color-ink-muted)]"
                            >
                                <span className="font-medium text-[var(--color-ink)]">{cmd.label}</span>
                                <span className="ml-2 font-mono text-xs">{cmd.command}</span>
                                <span className="mt-0.5 block text-xs">{cmd.hint}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
