import { Badge, Card, Text } from '@macheseinfach/ui';
import { scenarios, type Scenario } from '../../data/scenarios';

type ScenarioGridProps = {
    activeId: Scenario['id'] | null;
    onSelect: (scenario: Scenario) => void;
};

export function ScenarioGrid({ activeId, onSelect }: ScenarioGridProps) {
    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-12" aria-labelledby="scenarios-heading">
            <div className="mb-8 max-w-2xl">
                <Text id="scenarios-heading" variant="title">
                    Szenarien statt Feature-Liste
                </Text>
                <Text variant="body" className="mt-2">
                    Zehn Alltagsprobleme deutscher Nutzer — formuliert als Schmerz, nicht als Tool-Name. Wähle
                    ein Szenario; die Oberfläche passt Farbe und Fokus an (Chamäleon-Prinzip).
                </Text>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scenarios.map((scenario, index) => {
                    const active = scenario.id === activeId;
                    return (
                        <li key={scenario.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(scenario)}
                                className="h-full w-full cursor-pointer text-left"
                            >
                                <Card
                                    className={`h-full transition-shadow hover:shadow-[var(--shadow-elevated)] ${
                                        active ? 'ring-2 ring-[var(--color-accent-strong)]' : ''
                                    }`}
                                >
                                    <div className="mb-3 flex items-start justify-between gap-2">
                                        <Badge tone={active ? 'accent' : 'neutral'}>{String(index + 1).padStart(2, '0')}</Badge>
                                        <Text variant="caption" className="font-mono">
                                            {scenario.command}
                                        </Text>
                                    </div>
                                    <Text as="h3" variant="title" className="mb-2 text-base">
                                        {scenario.title}
                                    </Text>
                                    <Text variant="body" className="mb-3 text-sm">
                                        {scenario.pain}
                                    </Text>
                                    <Text variant="caption" className="text-[var(--color-accent-strong)]">
                                        {scenario.solution}
                                    </Text>
                                </Card>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
