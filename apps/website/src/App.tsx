import { Text } from '@macheseinfach/ui';
import { useCallback, useEffect, useState } from 'react';
import { CommandPalette } from './components/platform/CommandPalette';
import { PlatformFooter } from './components/platform/PlatformFooter';
import { PlatformHeader } from './components/platform/PlatformHeader';
import { ScenarioGrid } from './components/platform/ScenarioGrid';
import { TrustBar } from './components/platform/TrustBar';
import { UniversalDrop } from './components/platform/UniversalDrop';
import type { Scenario } from './data/scenarios';
import { applyScenarioTheme } from './lib/scenario-theme';

export function App() {
    const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
    const [commandOpen, setCommandOpen] = useState(false);

    const selectScenario = useCallback((scenario: Scenario) => {
        setActiveScenario(scenario);
        applyScenarioTheme(scenario);
    }, []);

    useEffect(() => {
        applyScenarioTheme(null);
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setCommandOpen(true);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--color-canvas)]">
            <PlatformHeader onOpenCommand={() => setCommandOpen(true)} />
            <TrustBar />

            <section className="mx-auto max-w-3xl px-4 py-10 text-center">
                <Text variant="body" className="text-lg leading-relaxed">
                    Das datenschutzfreundliche Werkzeugkasten-Layout für den digitalen Alltag in Deutschland.
                    <strong className="font-semibold text-[var(--color-ink)]"> Keine Registrierung. Keine Kosten.</strong>{' '}
                    Kein Upload an fremde Server.
                </Text>
            </section>

            <UniversalDrop activeScenario={activeScenario} onScenarioSelect={selectScenario} />
            <ScenarioGrid activeId={activeScenario?.id ?? null} onSelect={selectScenario} />
            <PlatformFooter />

            <CommandPalette
                open={commandOpen}
                onClose={() => setCommandOpen(false)}
                onSelectScenario={selectScenario}
            />
        </div>
    );
}
