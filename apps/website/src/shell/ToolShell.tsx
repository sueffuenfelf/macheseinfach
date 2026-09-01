import { AssistantHost, AssistantProvider } from '../assistant';
import { isFeatureEnabled } from '../lib/featureFlags';
import { usePlatformNav } from '../routing/usePlatformNav';
import { RouteHead } from '../seo/RouteHead';
import { AppShell } from './AppShell';
import { AreaStep } from './AreaStep';
import { CommandPalette } from './CommandPalette';
import { ConversionVariantHub } from './ConversionVariantHub';
import { SearchPage } from './SearchPage';
import { SettingsPage } from './SettingsPage';
import { AreaToolsStep } from './AreaToolsStep';
import { ToolWorkspace } from './ToolWorkspace';

function ShellMainContent() {
    const platform = usePlatformNav();
    const { page, activeAreaId, activeTool } = platform;

    if (page === 'settings') return <SettingsPage />;
    if (page === 'search') return <SearchPage />;
    if (page === 'conversion') return <ConversionVariantHub />;
    if (!activeAreaId) return <AreaStep />;

    if (page === 'tool' && activeTool) {
        return <ToolWorkspace tool={activeTool} />;
    }
    if (activeAreaId) {
        return <AreaToolsStep areaId={activeAreaId} />;
    }
    return <AreaStep />;
}

function ShellContent() {
    const platform = usePlatformNav();
    const { page, activeTool } = platform;
    const contentFill = page === 'tool' && Boolean(activeTool);

    return (
        <AppShell contentFill={contentFill}>
            <ShellMainContent />
        </AppShell>
    );
}

function ShellWithAssistant() {
    return (
        <>
            <ShellContent />
            <AssistantHost />
        </>
    );
}

export function ToolShell() {
    const platform = usePlatformNav();
    const assistantOn = isFeatureEnabled('assistantChat');

    return (
        <>
            <RouteHead />
            {assistantOn ? (
                <AssistantProvider>
                    <ShellWithAssistant />
                </AssistantProvider>
            ) : (
                <ShellContent />
            )}
            <CommandPalette
                open={platform.paletteOpen}
                onClose={platform.closePalette}
                onSelectScenario={platform.selectTool}
            />
        </>
    );
}
