/** Feature flags — default on; override via `localStorage` key `msf.feature.<name>`. */
export const featureFlags = {
    assistantChat: true,
} as const;

export type FeatureFlagName = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlagName): boolean {
    try {
        const override = localStorage.getItem(`msf.feature.${flag}`);
        if (override === 'true') return true;
        if (override === 'false') return false;
    } catch {
        /* private mode */
    }
    if (flag === 'assistantChat') {
        const env = import.meta.env.VITE_FEATURE_ASSISTANT_CHAT;
        if (env === 'true') return true;
        if (env === 'false') return false;
    }
    return featureFlags[flag];
}
