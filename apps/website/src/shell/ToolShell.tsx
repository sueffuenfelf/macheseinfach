import { AssistantHost, AssistantProvider } from '../assistant';
import { stories } from '../data/catalog';
import { FlowWorkspace, shouldUseFlowWorkspace } from '../flow/FlowWorkspace';
import { isFeatureEnabled } from '../lib/featureFlags';
import { isConversionHubStory } from '../routing/conversion-hub';
import { usePlatformNav } from '../routing/usePlatformNav';
import { RouteHead } from '../seo/RouteHead';
import { AppShell } from './AppShell';
import { AreaStep } from './AreaStep';
import { CommandPalette } from './CommandPalette';
import { ConversionVariantHub } from './ConversionVariantHub';
import { FavoritesPage } from './FavoritesPage';
import { SearchPage } from './SearchPage';
import { SettingsPage } from './SettingsPage';
import { StoriesOverviewPage } from './StoriesOverviewPage';
import { StoryPickStep, ToolPickForStory } from './StoryPickStep';
import { ToolWorkspace } from './ToolWorkspace';

function ShellMainContent() {
    const platform = usePlatformNav();
    const { page, activeAreaId, activeStoryId, activeTool } = platform;

    const flowWorkspaceActive = (() => {
        if (!activeStoryId) return false;
        if (isConversionHubStory(activeStoryId)) return false;
        return shouldUseFlowWorkspace(stories[activeStoryId]);
    })();

    if (page === 'favorites') return <FavoritesPage />;
    if (page === 'settings') return <SettingsPage />;
    if (page === 'search') return <SearchPage />;
    if (page === 'vorhaben') return <StoriesOverviewPage />;
    if (!activeAreaId) return <AreaStep />;

    if (flowWorkspaceActive && activeStoryId && (page === 'story' || page === 'tool')) {
        return <FlowWorkspace flowId={activeStoryId} />;
    }
    if (page === 'tool' && activeTool) {
        return <ToolWorkspace tool={activeTool} />;
    }
    if (page === 'story' && activeStoryId) {
        if (isConversionHubStory(activeStoryId)) {
            return <ConversionVariantHub />;
        }
        return <ToolPickForStory storyId={activeStoryId} />;
    }
    if (activeAreaId) {
        return <StoryPickStep areaId={activeAreaId} />;
    }
    return <AreaStep />;
}

function ShellContent() {
    const platform = usePlatformNav();
    const { page, activeStoryId, activeTool } = platform;

    const flowWorkspaceActive = (() => {
        if (!activeStoryId) return false;
        if (isConversionHubStory(activeStoryId)) return false;
        return shouldUseFlowWorkspace(stories[activeStoryId]);
    })();

    const contentFill =
        flowWorkspaceActive ||
        (page === 'tool' && Boolean(activeTool) && !isConversionHubStory(activeStoryId ?? ''));

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
