import { areas, maturityLabel, type Tool } from '../data/catalog';
import { usePlatformNav } from '../routing/usePlatformNav';
import { Icon } from './Icon';
import { AppPageHeader, PageContainer } from './PageContainer';
import { ToolBody } from './tools';

type ToolWorkspaceProps = {
    tool: Tool;
};

export function ToolWorkspace({ tool }: ToolWorkspaceProps) {
    const { activeAreaId, toggleFavorite, isFavorite } = usePlatformNav();
    const area = areas[activeAreaId ?? tool.areas[0]];
    const favorite = isFavorite(tool.id);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <PageContainer wide fill className="shrink-0 pb-3">
                <AppPageHeader
                    showBack
                    sticky
                    title={tool.title}
                    subtitle={tool.sub}
                    actions={
                        <div className="flex items-center gap-2">
                            <span
                                className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border-2 border-black"
                                style={{ background: area.accent }}
                            >
                                <Icon svg={area.icon} size={18} />
                            </span>
                            <span className="ms-badge shrink-0 bg-[var(--color-chip)] text-[10px]">
                                {maturityLabel(tool.maturity)}
                            </span>
                            <button
                                type="button"
                                aria-label={favorite ? 'Favorit entfernen' : 'Als Favorit markieren'}
                                aria-pressed={favorite}
                                onClick={() => toggleFavorite(tool.id)}
                                className="ms-focus inline-flex h-8 w-8 items-center justify-center rounded-[8px] border-2 border-black bg-white shadow-[1px_1px_0_#000]"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill={favorite ? '#ffc900' : 'none'}
                                    stroke="black"
                                    strokeWidth="2"
                                    aria-hidden
                                >
                                    <path d="M12 3.8l2.68 5.43 5.99.87-4.33 4.22 1.02 5.96L12 17.43l-5.36 2.83 1.02-5.96-4.33-4.22 5.99-.87z" />
                                </svg>
                            </button>
                        </div>
                    }
                />
            </PageContainer>
            <div className="min-h-0 flex-1 overflow-y-auto">
                <ToolBody tool={tool} />
            </div>
        </div>
    );
}
