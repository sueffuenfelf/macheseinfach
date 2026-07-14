import { useSettings } from '../context/SettingsContext';
import { BackButton } from './components/Primitives';

type BrutalistToggleProps = {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
};

function BrutalistToggle({ id, label, description, checked, onChange }: BrutalistToggleProps) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-[14px] border-2 border-black bg-white p-4 shadow-brutal-sm">
            <div className="min-w-0">
                <label htmlFor={id} className="font-display text-[16px] font-bold tracking-[-0.01em]">
                    {label}
                </label>
                <p className="mt-1 text-[14px] leading-relaxed text-[var(--color-ink-soft)]">{description}</p>
            </div>
            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`ms-focus relative h-8 w-14 shrink-0 rounded-[999px] border-2 border-black transition ${
                    checked ? 'bg-black' : 'bg-[var(--color-chip)]'
                }`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-[999px] border-2 border-black bg-white shadow-brutal-sm transition-transform ${
                        checked ? 'translate-x-6' : 'translate-x-0'
                    }`}
                />
            </button>
        </div>
    );
}

export function SettingsPage() {
    const { settings, setAutoCopyCommandResults } = useSettings();

    return (
        <main className="mx-auto w-full max-w-[640px] px-4 py-8 md:px-6">
            <BackButton />

            <div className="mt-4">
                <h1 className="font-display text-[34px] leading-[1.05] font-bold tracking-[-0.02em]">Einstellungen</h1>
                <p className="mt-2 text-[15px] text-[var(--color-ink-soft)]">
                    Deine Präferenzen werden lokal im Browser gespeichert.
                </p>
            </div>

            <section className="mt-8 space-y-4" aria-label="Verhalten">
                <h2 className="font-display text-[12px] font-bold tracking-[0.05em] uppercase text-[var(--color-ink-muted)]">
                    Schnellbefehle
                </h2>
                <BrutalistToggle
                    id="auto-copy-command-results"
                    label="Ergebnisse automatisch kopieren"
                    description="Nach einem Slash-Befehl wird das Ergebnis direkt in die Zwischenablage gelegt. Ausgeschaltet: du kopierst manuell über „Kopieren“."
                    checked={settings.autoCopyCommandResults}
                    onChange={setAutoCopyCommandResults}
                />
            </section>
        </main>
    );
}
