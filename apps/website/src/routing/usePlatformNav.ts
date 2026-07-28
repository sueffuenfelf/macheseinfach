import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PlatformFile } from '../context/PlatformContext';
import { usePlatform } from '../context/PlatformContext';
import {
    type AreaId,
    findToolsForFile,
    getTool,
    type StoryId,
    stories,
    type ToolId,
    toolsForStory,
} from '../data/catalog';
import { firstRequiredStep, shouldUseFlowWorkspace } from '../flow/flow-workspace-policy';
import { isConversionHubStory } from './conversion-hub';
import {
    areaPath,
    favoritesPath,
    homePath,
    searchPath,
    settingsPath,
    storyPath,
    toolPath,
    toolShortcutPath,
} from './paths';

export function usePlatformNav() {
    const navigate = useNavigate();
    const platform = usePlatform();

    const goHome = useCallback(() => {
        navigate(homePath());
    }, [navigate]);

    const goToFavorites = useCallback(() => {
        navigate(favoritesPath());
    }, [navigate]);

    const goToSettings = useCallback(() => {
        navigate(settingsPath());
    }, [navigate]);

    const goToSearch = useCallback(
        (query?: string) => {
            navigate(searchPath(query));
        },
        [navigate],
    );

    const selectArea = useCallback(
        (areaId: AreaId) => {
            navigate(areaPath(areaId));
        },
        [navigate],
    );

    const selectStory = useCallback(
        (storyId: StoryId) => {
            const areaId = platform.activeAreaId;
            if (!areaId) return;
            const story = stories[storyId];
            // Flag ON + multi-step → open FlowWorkspace at first required step
            if (story && shouldUseFlowWorkspace(story) && !isConversionHubStory(storyId)) {
                const first = firstRequiredStep(story);
                navigate(toolPath(areaId, storyId, first.toolId));
                return;
            }
            const storyTools = toolsForStory(storyId);
            if (storyTools.length === 1 && !isConversionHubStory(storyId)) {
                navigate(toolPath(areaId, storyId, storyTools[0].id));
                return;
            }
            navigate(storyPath(areaId, storyId, platform.activeTags));
        },
        [navigate, platform.activeAreaId, platform.activeTags],
    );

    /** Alias — Vorhaben öffnen (same as selectStory; preferred name for Flow UI). */
    const goToFlow = selectStory;

    const selectTool = useCallback(
        (toolId: ToolId) => {
            const tool = getTool(toolId);
            platform.pushRecent(toolId);
            const areaId =
                platform.activeAreaId && tool.areas.includes(platform.activeAreaId)
                    ? platform.activeAreaId
                    : (tool.areas[0] ?? null);
            const storyId =
                platform.activeStoryId && tool.storyIds.includes(platform.activeStoryId)
                    ? platform.activeStoryId
                    : (tool.storyIds[0] ?? null);
            if (areaId && storyId) {
                navigate(toolPath(areaId, storyId, toolId));
            } else {
                navigate(toolShortcutPath(toolId));
            }
        },
        [navigate, platform],
    );

    const goToSituation = useCallback(() => {
        const { activeAreaId, activeStoryId, activeTags } = platform;
        if (activeAreaId && activeStoryId) {
            navigate(storyPath(activeAreaId, activeStoryId, activeTags));
            return;
        }
        if (activeAreaId) {
            navigate(areaPath(activeAreaId));
        }
    }, [navigate, platform]);

    const goToArea = useCallback(() => {
        const { activeAreaId } = platform;
        if (activeAreaId) {
            navigate(areaPath(activeAreaId));
            return;
        }
        navigate(homePath());
    }, [navigate, platform]);

    const goBack = useCallback(() => {
        const historyIdx = (window.history.state as { idx?: number } | null)?.idx;
        if (typeof historyIdx === 'number' && historyIdx > 0) {
            navigate(-1);
            return;
        }
        const { activeAreaId, activeStoryId, activeTags } = platform;
        if (activeAreaId && activeStoryId) {
            navigate(storyPath(activeAreaId, activeStoryId, activeTags));
            return;
        }
        if (activeAreaId) {
            navigate(areaPath(activeAreaId));
            return;
        }
        navigate(homePath());
    }, [navigate, platform]);

    const clearTool = useCallback(() => {
        goToSituation();
    }, [goToSituation]);

    const ingestFiles = useCallback(
        (files: FileList | null): PlatformFile | null => {
            const info = platform.ingestFiles(files);
            if (!files?.length) return info;
            const matched = findToolsForFile(files[0].name);
            if (matched[0]) selectTool(matched[0].id);
            return info;
        },
        [platform, selectTool],
    );

    return {
        ...platform,
        goHome,
        goToFavorites,
        goToSettings,
        goToSearch,
        openSettings: goToSettings,
        closeSettings: goHome,
        selectArea,
        selectStory,
        goToFlow,
        selectTool,
        goToSituation,
        goToArea,
        goBack,
        clearTool,
        ingestFiles,
    };
}
