import type { ComponentType } from 'react';
import type { ToolId } from '../../data/catalog';

export type WidgetComponentProps = {
    widgetId: string;
    openTool: () => void;
    /** When true, dashboard chrome owns the title — omit inner widget header. */
    embedded?: boolean;
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
};
