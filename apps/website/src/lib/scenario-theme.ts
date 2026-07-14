import type { Scenario, ScenarioTheme } from '../data/scenarios';

const defaultTheme: ScenarioTheme = {
    accent: '#3d5a80',
    accentStrong: '#293241',
    accentSoft: '#e8eef4',
};

export function applyScenarioTheme(scenario: Scenario | null): void {
    const theme = scenario?.theme ?? defaultTheme;
    const root = document.documentElement;
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-accent-strong', theme.accentStrong);
    root.style.setProperty('--color-accent-soft', theme.accentSoft);
    root.dataset.scenario = scenario?.id ?? 'home';
}
