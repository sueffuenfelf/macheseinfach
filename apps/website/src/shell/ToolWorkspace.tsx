import { areas, type Tool } from '../data/catalog';
import { usePlatformNav } from '../routing/usePlatformNav';
import { BackButtonCompact } from './components/Primitives';
import { Icon } from './Icon';
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
            <header className="ms-tool-chrome flex h-11 shrink-0 items-center gap-2 border-b-2 border-black bg-white px-2 md:px-3">
                <BackButtonCompact className="h-8 w-8 shadow-[1px_1px_0_#000]" />
                <span
                    className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border-2 border-black sm:inline-flex"
                    style={{ background: area.accent }}
                    aria-hidden
                >
                    <Icon svg={area.icon} size={14} />
                </span>
                <h1 className="min-w-0 flex-1 truncate font-display text-[15px] font-bold tracking-[-0.02em] md:text-[16px]">
                    {tool.shortTitle}
                </h1>
                <button
                    type="button"
                    aria-label={favorite ? 'Favorit entfernen' : 'Als Favorit markieren'}
                    aria-pressed={favorite}
                    onClick={() => toggleFavorite(tool.id)}
                    className="ms-focus inline-flex h-8 w-8 items-center justify-center rounded-[8px] border-2 border-black bg-white"
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
            </header>
            <div className="relative min-h-0 flex-1">
                <div className="absolute inset-0 overflow-y-auto">
                    <ToolBody tool={tool} />
                </div>
            </div>
        </div>
    );
}
