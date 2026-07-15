import type { ComponentType } from 'react';
import type { ToolId } from '../../data/catalog/types';
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
    /** Value resolved from advanced widget links (settings-gated). */
    linkedInput?: string;
    linkedSourceLabel?: string;
    onEmitLinkValue?: (port: WidgetValuePort, value: string) => void;
};

export type WidgetValuePort = 'input' | 'value' | 'text' | 'status' | 'fileName' | 'fileText';

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
    /** Widget can consume linked values from other widgets. */
    supportsLinkedInput?: boolean;
    /** Optional exported value ports for advanced linking. */
    outputPorts?: readonly { id: WidgetValuePort; label: string }[];
};
