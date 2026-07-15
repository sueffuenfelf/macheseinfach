import type { ComponentType } from 'react';
import type { ToolDefinition } from '../data/catalog/types';
import { getToolPage } from '../discover';
import { PlannedTool } from './PlannedTool';

export function ToolBody({ tool }: { tool: ToolDefinition }) {
    if (tool.maturity === 'planned') return <PlannedTool tool={tool} />;
    const Page = getToolPage(tool.id);
    if (!Page) return <PlannedTool tool={tool} />;
    return <Page tool={tool} />;
}
