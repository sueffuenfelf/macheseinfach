import type { ComponentType } from 'react';
import type { ToolId } from '../../data/catalog';
import type { WidgetPasswordOptions } from '../workspaces/model';

export type WidgetComponentProps = {
    widgetId: string;
    openTool: () => void;
    /** When true, dashboard chrome owns the title — omit inner widget header. */
    embedded?: boolean;
    /** Workspace-wide shared text; widgets opt in via `useSharedInput`. */
    sharedInput?: string;
    useSharedInput?: boolean;
    /** Persisted password generator options (`widget-password-mini`). */
    passwordOptions?: WidgetPasswordOptions;
    onPasswordOptionsChange?: (options: WidgetPasswordOptions) => void;
};

export type ToolWidgetDef = {
    id: string;
    title: string;
    description: string;
    tags: string[];
    toolId: ToolId;
    component: ComponentType<WidgetComponentProps>;
    minW: number;
    maxW: number;
    minH: number;
    maxH: number;
    defaultW: number;
    defaultH: number;
    /** Widget can consume workspace `sharedInput` when opted in per layout item. */
    supportsSharedInput?: boolean;
};
