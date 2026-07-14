import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

const STORAGE_KEY = 'macheseinfa.settings';

export type MacheseinfaSettings = {
    autoCopyCommandResults: boolean;
};

const DEFAULT_SETTINGS: MacheseinfaSettings = {
    autoCopyCommandResults: true,
};

type SettingsContextValue = {
    settings: MacheseinfaSettings;
    setAutoCopyCommandResults: (value: boolean) => void;
    updateSettings: (patch: Partial<MacheseinfaSettings>) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readSettings(): MacheseinfaSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_SETTINGS;
        const parsed = JSON.parse(raw) as Partial<MacheseinfaSettings>;
        return {
            autoCopyCommandResults:
                typeof parsed.autoCopyCommandResults === 'boolean'
                    ? parsed.autoCopyCommandResults
                    : DEFAULT_SETTINGS.autoCopyCommandResults,
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function writeSettings(settings: MacheseinfaSettings): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
        /* ignore quota / private mode */
    }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<MacheseinfaSettings>(() => readSettings());

    const updateSettings = useCallback((patch: Partial<MacheseinfaSettings>) => {
        setSettings((prev) => {
            const next = { ...prev, ...patch };
            writeSettings(next);
            return next;
        });
    }, []);

    const setAutoCopyCommandResults = useCallback(
        (value: boolean) => updateSettings({ autoCopyCommandResults: value }),
        [updateSettings],
    );

    const value = useMemo(
        () => ({ settings, setAutoCopyCommandResults, updateSettings }),
        [settings, setAutoCopyCommandResults, updateSettings],
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
}
