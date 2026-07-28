import { Link } from 'react-router-dom';
import { settingsPath } from '../routing/paths';
import { useAssistant } from './AssistantProvider';

type AssistantChromeProps = {
    compact?: boolean;
};

export function AssistantChrome({ compact = false }: AssistantChromeProps) {
    const { toggleMinimized, closePanel, isMinimized, settings, updateSettings } = useAssistant();
    const isSidebar = settings.layoutMode === 'sidebar';

    function toggleLayout() {
        updateSettings({
            layoutMode: isSidebar ? 'floating' : 'sidebar',
        });
    }

    return (
        <header
            className={`flex shrink-0 items-center justify-between gap-2 border-b-2 border-black bg-[var(--color-chip)] px-3 ${
                compact ? 'py-2' : 'py-3'
            }`}
        >
            <div className="min-w-0">
                <p className="font-display text-[14px] font-bold tracking-[-0.01em]">Assistent</p>
                {!compact ? (
                    <p className="text-[11px] text-[var(--color-ink-soft)]">
                        Chat geht an OpenRouter; Dateien bleiben lokal außer du fügst Text ein
                    </p>
                ) : null}
            </div>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={toggleLayout}
                    className="ms-focus inline-flex h-8 items-center gap-1 rounded-[6px] border-2 border-black bg-white px-2 font-display text-[10px] font-semibold uppercase tracking-[0.04em] shadow-[1px_1px_0_#000]"
                    aria-label={
                        isSidebar ? 'Schwebendes Fenster aktivieren' : 'Sidebar aktivieren'
                    }
                    title={isSidebar ? 'Schwebend' : 'Sidebar'}
                >
                    {isSidebar ? '▣' : '▤'}
                    <span className="hidden sm:inline">
                        {isSidebar ? 'Schwebend' : 'Sidebar'}
                    </span>
                </button>
                <button
                    type="button"
                    onClick={toggleMinimized}
                    className="ms-focus inline-flex h-8 w-8 items-center justify-center rounded-[6px] border-2 border-black bg-white shadow-[1px_1px_0_#000]"
                    aria-label={isMinimized ? 'Assistent erweitern' : 'Assistent minimieren'}
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                    >
                        <path d={isMinimized ? 'M7 14l5-5 5 5' : 'M7 10l5 5 5-5'} />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={closePanel}
                    className="ms-focus inline-flex h-8 w-8 items-center justify-center rounded-[6px] border-2 border-black bg-white shadow-[1px_1px_0_#000]"
                    aria-label="Assistent schließen"
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                    >
                        <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </button>
            </div>
        </header>
    );
}

export function AssistantEmptyKeyState() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
            <p className="font-display text-[15px] font-bold">OpenRouter API-Key fehlt</p>
            <p className="max-w-[280px] text-[13px] leading-relaxed text-[var(--color-ink-soft)]">
                Der Assistent nutzt OpenRouter für KI-Antworten. Dein Key wird nur lokal im Browser
                gespeichert.
            </p>
            <Link
                to={settingsPath()}
                className="ms-focus mt-1 inline-flex items-center rounded-[8px] border-2 border-black bg-white px-4 py-2 font-display text-[13px] font-semibold shadow-[2px_2px_0_#000] transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal-sm"
            >
                Zu den Einstellungen
            </Link>
        </div>
    );
}
