import type { ToolId } from '../../data/catalog/types';
import { getToolWidget } from '../widgets/registry';
import {
    addWidgetToWorkspace,
    createWorkspace,
    createWorkspaceWidgetLinkId,
    type Workspace,
    type WorkspaceState,
    type WorkspaceWidgetLink,
} from './model';
import { BILD_PORTAL_WIDGET_IDS } from '../../tools/_shared/image/pipeline';

export type WorkspaceTemplateId = 'bild-portal';

export type ImagePipelineStep = {
    widgetId: string;
};

const BILD_PORTAL_STEPS: readonly ImagePipelineStep[] = BILD_PORTAL_WIDGET_IDS.map((widgetId) => ({
    widgetId,
}));

export function createImagePipelineWorkspace(
    state: WorkspaceState,
    steps: readonly ImagePipelineStep[],
    options: { name?: string; templateId?: WorkspaceTemplateId } = {},
): { state: WorkspaceState; workspace: Workspace } {
    const widgetIds = steps
        .map((step) => step.widgetId)
        .filter((widgetId) => Boolean(getToolWidget(widgetId)));

    const name =
        options.name ??
        (options.templateId === 'bild-portal' ? 'Bild-Portal' : 'Bild-Pipeline');

    const created = createWorkspace(state, { name });
    let nextState = created.state;
    const workspaceId = created.workspace.id;

    for (const widgetId of widgetIds) {
        nextState = addWidgetToWorkspace(nextState, workspaceId, widgetId);
    }

    const widgetLinks: WorkspaceWidgetLink[] = [];
    for (let index = 1; index < widgetIds.length; index += 1) {
        const sourceWidgetId = widgetIds[index - 1]!;
        const targetWidgetId = widgetIds[index]!;
        widgetLinks.push({
            id: createWorkspaceWidgetLinkId(),
            sourceWidgetId,
            sourcePort: 'imageArtifact',
            targetWidgetId,
            targetPort: 'input',
        });
    }

    const toolIds = [
        ...new Set(
            widgetIds
                .map((widgetId) => getToolWidget(widgetId)?.toolId)
                .filter((toolId): toolId is ToolId => Boolean(toolId)),
        ),
    ];

    const nextWorkspaces = nextState.workspaces.map((workspace) =>
        workspace.id === workspaceId
            ? {
                  ...workspace,
                  toolIds,
                  widgetLinks,
                  updatedAt: new Date().toISOString(),
              }
            : workspace,
    );

    const finalState: WorkspaceState = {
        ...nextState,
        workspaces: nextWorkspaces,
    };

    const workspace =
        finalState.workspaces.find((entry) => entry.id === workspaceId) ?? created.workspace;

    return { state: finalState, workspace };
}

export function createWorkspaceFromTemplate(
    state: WorkspaceState,
    templateId: WorkspaceTemplateId,
): { state: WorkspaceState; workspace: Workspace } {
    switch (templateId) {
        case 'bild-portal':
            return createImagePipelineWorkspace(state, BILD_PORTAL_STEPS, {
                templateId: 'bild-portal',
                name: 'Bild-Portal',
            });
        default:
            return createWorkspace(state);
    }
}

export function isWorkspaceTemplateId(value: string): value is WorkspaceTemplateId {
    return value === 'bild-portal';
}
