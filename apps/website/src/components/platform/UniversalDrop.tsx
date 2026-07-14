import { Badge, Card, Text } from '@macheseinfach/ui';
import { useCallback, useState } from 'react';
import { findScenariosForFile, type Scenario } from '../../data/scenarios';

type UniversalDropProps = {
    activeScenario: Scenario | null;
    onScenarioSelect: (scenario: Scenario) => void;
};

export function UniversalDrop({ activeScenario, onScenarioSelect }: UniversalDropProps) {
    const [dragOver, setDragOver] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<Scenario[]>([]);

    const handleFiles = useCallback(
        (files: FileList | null) => {
            if (!files?.length) return;
            const file = files[0];
            setFileName(file.name);
            const matched = findScenariosForFile(file.name);
            setSuggestions(matched);
            if (matched[0]) onScenarioSelect(matched[0]);
        },
        [onScenarioSelect],
    );

    return (
        <section className="mx-auto w-full max-w-3xl px-4" aria-labelledby="drop-heading">
            <Text id="drop-heading" variant="title" className="mb-2 text-center">
                Universal Drop
            </Text>
            <Text variant="body" className="mb-6 text-center">
                Datei hier ablegen — Format erkennen, passende Aktionen sofort anbieten. Alles lokal.
            </Text>

            <Card
                padded={false}
                className={`overflow-hidden border-2 border-dashed transition-colors ${
                    dragOver
                        ? 'border-[var(--color-accent-strong)] bg-[var(--color-accent-soft)]'
                        : 'border-[var(--color-border)]'
                }`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFiles(e.dataTransfer.files);
                }}
            >
                <label className="flex cursor-pointer flex-col items-center gap-3 px-6 py-14 text-center">
                    <span
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-2xl"
                        aria-hidden
                    >
                        ↓
                    </span>
                    <Text variant="title" className="text-lg">
                        PDF, HEIC oder Bild hierher ziehen
                    </Text>
                    <Text variant="body">oder klicken zum Auswählen</Text>
                    <input
                        type="file"
                        className="sr-only"
                        accept=".pdf,.heic,.heif,.png,.jpg,.jpeg,.tiff"
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                </label>
            </Card>

            {fileName ? (
                <div className="mt-4 space-y-3">
                    <Text variant="caption">
                        Erkannt: <strong className="text-[var(--color-ink)]">{fileName}</strong>
                        {activeScenario ? ` → ${activeScenario.title}` : ''}
                    </Text>
                    {suggestions.length > 0 ? (
                        <ul className="flex flex-wrap gap-2">
                            {suggestions.map((s) => (
                                <li key={s.id}>
                                    <button
                                        type="button"
                                        onClick={() => onScenarioSelect(s)}
                                        className="cursor-pointer rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm transition-colors hover:border-[var(--color-accent-strong)] hover:bg-[var(--color-accent-soft)]"
                                    >
                                        {s.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Badge tone="neutral">Kein passendes Szenario — Command Center öffnen (⌘K)</Badge>
                    )}
                </div>
            ) : null}
        </section>
    );
}
