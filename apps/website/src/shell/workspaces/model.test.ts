import { describe, expect, mock, test } from 'bun:test';
import type { ToolWidgetDef } from '../widgets/types';

const imageWidgets: ToolWidgetDef[] = [
    {
        id: 'widget-image-file-drop',
        title: 'Bild ablegen',
        description: 'Pipeline drop',
        tags: ['Bild'],
        toolId: 'image-convert',
        component: () => null,
        outputPorts: [{ id: 'imageArtifact', label: 'Bild-Artefakt' }],
        minW: 4,
        maxW: 8,
        minH: 3,
        maxH: 6,
        defaultW: 5,
        defaultH: 3,
    },
    {
        id: 'widget-image-compress',
        title: 'Bild komprimieren',
        description: 'Pipeline compress',
        tags: ['Bild'],
        toolId: 'image-compress',
        component: () => null,
        supportsLinkedInput: true,
        imageStepKind: 'compress',
        minW: 4,
        maxW: 8,
        minH: 3,
        maxH: 8,
        defaultW: 5,
        defaultH: 4,
    },
];

mock.module('../widgets/registry', () => ({
    getToolWidget: (widgetId: string) => imageWidgets.find((widget) => widget.id === widgetId),
    listToolWidgets: () => imageWidgets,
    getPreferredWidgetForTool: () => imageWidgets[0],
    listWidgetsForTool: () => imageWidgets,
    registerToolWidget: () => {},
}));

const {
    addWidgetToWorkspaceStaging,
    createWorkspace,
    placeStagedWidget,
    resolveWidgetImageStepOptions,
    setWidgetImageStepOptions,
    setWidgetUseLinkedArtifactInput,
} = await import('./model');

describe('placeStagedWidget', () => {
    test('places image pipeline widgets from staging onto the layout', () => {
        const created = createWorkspace({ version: 3, workspaces: [], layouts: {} });
        const workspaceId = created.workspace.id;

        let state = addWidgetToWorkspaceStaging(created.state, workspaceId, 'widget-image-compress');
        const staged = state.workspaces.find((entry) => entry.id === workspaceId);
        expect(staged?.stagedWidgetIds).toEqual(['widget-image-compress']);
        expect(staged?.widgetIds).toEqual([]);

        state = placeStagedWidget(state, workspaceId, 'widget-image-compress', {
            x: 0,
            y: 2,
            w: 5,
            h: 4,
        });

        const placed = state.workspaces.find((entry) => entry.id === workspaceId);
        expect(placed?.stagedWidgetIds).toEqual([]);
        expect(placed?.widgetIds).toEqual(['widget-image-compress']);

        const layoutItem = state.layouts[workspaceId]?.lg?.find(
            (item) => item.i === 'widget-image-compress',
        );
        expect(layoutItem).toMatchObject({ x: 0, y: 2, w: 5, h: 4 });
    });

    test('places widget-image-file-drop with correct bounds', () => {
        const created = createWorkspace({ version: 3, workspaces: [], layouts: {} });
        const workspaceId = created.workspace.id;

        let state = addWidgetToWorkspaceStaging(
            created.state,
            workspaceId,
            'widget-image-file-drop',
        );
        state = placeStagedWidget(state, workspaceId, 'widget-image-file-drop', {
            x: 6,
            y: 0,
            w: 5,
            h: 3,
        });

        const placed = state.workspaces.find((entry) => entry.id === workspaceId);
        expect(placed?.widgetIds).toEqual(['widget-image-file-drop']);

        const layoutItem = state.layouts[workspaceId]?.lg?.find(
            (item) => item.i === 'widget-image-file-drop',
        );
        expect(layoutItem?.minW).toBe(4);
        expect(layoutItem?.maxH).toBe(6);
    });

    test('persists image step options and linked artifact toggle per layout item', () => {
        const created = createWorkspace({ version: 3, workspaces: [], layouts: {} });
        const workspaceId = created.workspace.id;

        let state = addWidgetToWorkspaceStaging(created.state, workspaceId, 'widget-image-compress');
        state = placeStagedWidget(state, workspaceId, 'widget-image-compress', {
            x: 0,
            y: 0,
            w: 5,
            h: 4,
        });

        const before = state.layouts[workspaceId]?.lg?.find(
            (item) => item.i === 'widget-image-compress',
        );
        expect(resolveWidgetImageStepOptions('widget-image-compress', before?.imageStepOptions)).toEqual(
            {
                kind: 'compress',
                compressQuality: 82,
                compressFormat: 'jpg',
            },
        );
        expect(before?.useLinkedArtifactInput).toBe(true);

        state = setWidgetImageStepOptions(state, workspaceId, 'widget-image-compress', {
            kind: 'compress',
            compressQuality: 65,
            compressFormat: 'webp',
        });
        state = setWidgetUseLinkedArtifactInput(
            state,
            workspaceId,
            'widget-image-compress',
            false,
        );

        const after = state.layouts[workspaceId]?.lg?.find(
            (item) => item.i === 'widget-image-compress',
        );
        expect(after?.imageStepOptions).toEqual({
            kind: 'compress',
            compressQuality: 65,
            compressFormat: 'webp',
        });
        expect(after?.useLinkedArtifactInput).toBe(false);
    });
});
