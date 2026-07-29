import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { chromeAiSearchAvailable } from '../search/intents-chrome';
import { requestNotificationPermission } from './toast';
import { isFeatureEnabled } from '../lib/featureFlags';
import { AppPageHeader, PageContainer } from './PageContainer';
import {
    CURATED_MODELS,
    isCuratedModel,
    readAssistantSettings,
    writeAssistantSettings,
} from '../assistant/settings';

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
                <label
                    htmlFor={id}
                    className="font-display text-[16px] font-bold tracking-[-0.01em]"
                >
                    {label}
                </label>
                <p className="mt-1 text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
                    {description}
                </p>
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
    const { settings, setAutoCopyCommandResults, updateSettings } = useSettings();
    const [notifHint, setNotifHint] = useState<string | null>(null);
    const [assistantSettings, setAssistantSettings] = useState(() => readAssistantSettings());
    const [customMode, setCustomMode] = useState(() => !isCuratedModel(assistantSettings.model));
    const [customModel, setCustomModel] = useState(() =>
        isCuratedModel(assistantSettings.model) ? '' : assistantSettings.model,
    );
    const chromeAvailable = chromeAiSearchAvailable();
    const assistantFlagOn = isFeatureEnabled('assistantChat');

    function patchAssistant(patch: Partial<typeof assistantSettings>) {
        const next = writeAssistantSettings(patch);
        setAssistantSettings(next);
    }

    async function toggleBackgroundNotifications(enabled: boolean) {
        if (!enabled) {
            updateSettings({ backgroundNotifications: false });
            setNotifHint(null);
            return;
        }
        const permission = await requestNotificationPermission();
        if (permission === 'granted') {
            updateSettings({ backgroundNotifications: true });
            setNotifHint(null);
            return;
        }
        updateSettings({ backgroundNotifications: false });
        setNotifHint(
            permission === 'denied'
                ? 'Benachrichtigungen sind im Browser blockiert. Erlaube sie in den Systemeinstellungen.'
                : 'Benachrichtigungen wurden nicht freigegeben.',
        );
    }

    return (
        <PageContainer>
            <AppPageHeader
                title="Einstellungen"
                subtitle="Deine Präferenzen werden lokal im Browser gespeichert."
            />

            <section className="space-y-3" aria-label="Verhalten">
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

            <section className="mt-8 space-y-4" aria-label="Hintergrund">
                <h2 className="font-display text-[12px] font-bold tracking-[0.05em] uppercase text-[var(--color-ink-muted)]">
                    Hintergrund
                </h2>
                <BrutalistToggle
                    id="background-notifications"
                    label="System-Benachrichtigungen"
                    description="Wenn der Tab im Hintergrund läuft, erscheinen Fortschritt und Abschluss auch als macOS-/Windows-Benachrichtigung — mit Link zurück zum Tool."
                    checked={settings.backgroundNotifications}
                    onChange={toggleBackgroundNotifications}
                />
                {notifHint ? (
                    <p className="rounded-[10px] border-2 border-[var(--color-danger)] bg-[#fff5f5] px-3 py-2 text-[13px] text-[var(--color-ink-soft)]">
                        {notifHint}
                    </p>
                ) : null}
            </section>

            <section className="mt-8 space-y-4" aria-label="Suche">
                <h2 className="font-display text-[12px] font-bold tracking-[0.05em] uppercase text-[var(--color-ink-muted)]">
                    Suche
                </h2>
                <BrutalistToggle
                    id="chrome-search-ai"
                    label="Chrome KI für Suche"
                    description={
                        chromeAvailable
                            ? 'Nutzt die lokale Chrome Prompt API, wenn Stichwortsuche unsicher ist (z. B. mehrstufige Bild-Pipelines). Kein Cloud-LLM.'
                            : 'Chrome Prompt API ist in diesem Browser nicht verfügbar. Die Suche nutzt dann nur Stichwort- und Bedeutungssuche.'
                    }
                    checked={settings.chromeSearchAi}
                    onChange={(checked) => updateSettings({ chromeSearchAi: checked })}
                />
            </section>

            {assistantFlagOn ? (
                <section className="mt-8 space-y-4" aria-label="Assistent">
                    <h2 className="font-display text-[12px] font-bold tracking-[0.05em] uppercase text-[var(--color-ink-muted)]">
                        Assistent
                    </h2>
                    <BrutalistToggle
                        id="assistant-enabled"
                        label="Assistent aktivieren"
                        description="KI-Hilfe über OpenRouter — Chat-Text geht an OpenRouter; Dateien bleiben lokal, außer du fügst Text ein."
                        checked={assistantSettings.enabled}
                        onChange={(checked) => patchAssistant({ enabled: checked })}
                    />
                    <div className="rounded-[14px] border-2 border-black bg-white p-4 shadow-brutal-sm space-y-3">
                        <label
                            htmlFor="openrouter-api-key"
                            className="font-display text-[16px] font-bold tracking-[-0.01em]"
                        >
                            OpenRouter API-Key
                        </label>
                        <p className="text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
                            Nur lokal gespeichert — nie an unsere Server.
                        </p>
                        <input
                            id="openrouter-api-key"
                            type="password"
                            value={assistantSettings.openRouterApiKey}
                            onChange={(e) => patchAssistant({ openRouterApiKey: e.target.value })}
                            className="ms-input ms-focus w-full text-[14px]"
                            placeholder="sk-or-…"
                            autoComplete="off"
                        />
                    </div>
                    <div className="rounded-[14px] border-2 border-black bg-white p-4 shadow-brutal-sm space-y-3">
                        <label
                            htmlFor="assistant-model"
                            className="font-display text-[16px] font-bold tracking-[-0.01em]"
                        >
                            Modell
                        </label>
                        <select
                            id="assistant-model"
                            value={customMode ? 'custom' : assistantSettings.model}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === 'custom') {
                                    setCustomMode(true);
                                    setCustomModel(
                                        isCuratedModel(assistantSettings.model)
                                            ? ''
                                            : assistantSettings.model,
                                    );
                                    return;
                                }
                                setCustomMode(false);
                                setCustomModel('');
                                patchAssistant({ model: value });
                            }}
                            className="ms-input ms-focus w-full text-[14px]"
                        >
                            {CURATED_MODELS.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.label}
                                </option>
                            ))}
                            <option value="custom">Eigenes Modell …</option>
                        </select>
                        {customMode ? (
                            <input
                                id="assistant-model-custom"
                                type="text"
                                value={customModel}
                                onChange={(e) => {
                                    const next = e.target.value;
                                    setCustomModel(next);
                                    if (next.trim()) {
                                        patchAssistant({ model: next.trim() });
                                    }
                                }}
                                className="ms-input ms-focus w-full text-[14px]"
                                placeholder="openrouter/free"
                                aria-label="Eigenes Modell-ID"
                            />
                        ) : null}
                    </div>
                    <div className="rounded-[14px] border-2 border-black bg-white p-4 shadow-brutal-sm">
                        <p className="font-display text-[16px] font-bold tracking-[-0.01em]">
                            Darstellung
                        </p>
                        <p className="mt-1 text-[14px] text-[var(--color-ink-soft)]">
                            Sidebar oder schwebendes Fenster — gleicher Chat.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => patchAssistant({ layoutMode: 'sidebar' })}
                                className={`ms-focus rounded-[8px] border-2 border-black px-3 py-2 font-display text-[13px] font-semibold shadow-[2px_2px_0_#000] ${
                                    assistantSettings.layoutMode === 'sidebar'
                                        ? 'bg-[var(--color-accent)]'
                                        : 'bg-white'
                                }`}
                            >
                                Sidebar
                            </button>
                            <button
                                type="button"
                                onClick={() => patchAssistant({ layoutMode: 'floating' })}
                                className={`ms-focus rounded-[8px] border-2 border-black px-3 py-2 font-display text-[13px] font-semibold shadow-[2px_2px_0_#000] ${
                                    assistantSettings.layoutMode === 'floating'
                                        ? 'bg-[var(--color-accent)]'
                                        : 'bg-white'
                                }`}
                            >
                                Schwebend
                            </button>
                        </div>
                    </div>
                </section>
            ) : null}
        </PageContainer>
    );
}
