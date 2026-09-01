import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PlatformFile } from '../context/PlatformContext';
import { usePlatform } from '../context/PlatformContext';
import { type AreaId, findToolsForFile, getTool, type ToolId } from '../data/catalog';
import { areaPath, conversionHubPath, homePath, searchPath, settingsPath, toolShortcutPath } from './paths';

export function usePlatformNav() {
    const navigate = useNavigate();
    const platform = usePlatform();

    const goHome = useCallback(() => {
        navigate(homePath());
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

    const selectTool = useCallback(
        (toolId: ToolId) => {
            const tool = getTool(toolId);
            if (!tool) {
                navigate(toolShortcutPath(toolId));
                return;
            }
            platform.pushRecent(toolId);
            navigate(toolShortcutPath(toolId));
        },
        [navigate, platform],
    );

    const goToSituation = useCallback(() => {
        const { activeAreaId } = platform;
        if (activeAreaId) {
            navigate(areaPath(activeAreaId));
            return;
        }
        navigate(homePath());
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
        const { activeAreaId } = platform;
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
        goToSettings,
        goToSearch,
        openSettings: goToSettings,
        closeSettings: goHome,
        selectArea,
        selectTool,
        goToSituation,
        goToArea,
        goBack,
        clearTool,
        ingestFiles,
        goToConversionHub: () => navigate(conversionHubPath()),
    };
}
