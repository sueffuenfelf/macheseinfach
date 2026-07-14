import { areas, maturityLabel, type Tool } from '../data/catalog';
import { usePlatformNav } from '../routing/usePlatformNav';
import { Icon } from './Icon';
import { BackButton } from './components/Primitives';
import { ToolBody } from './tools';

type ToolWorkspaceProps = {
    tool: Tool;
    onAddToWorkspace?: () => void;
    addToWorkspaceLabel?: string;
};

export function ToolWorkspace({ tool, onAddToWorkspace, addToWorkspaceLabel = 'Zu Arbeitsbereich hinzufügen' }: ToolWorkspaceProps) {
    const { activeAreaId, toggleFavorite, isFavorite } = usePlatformNav();
    const area = areas[activeAreaId ?? tool.areas[0]];
    const favorite = isFavorite(tool.id);

    return (
        <div className="flex-1">
            <main className="mx-auto w-full max-w-[1040px] px-4 pt-8 md:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-3">
                        <BackButton />
                        <div className="flex items-start gap-3">
                            <span
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border-2 border-black"
                                style={{ background: area.accent }}
                            >
                                <Icon svg={area.icon} size={22} />
                            </span>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span className="ms-badge shrink-0 bg-[var(--color-chip)]">{maturityLabel(tool.maturity)}</span>
                                    <h1 className="font-display text-[32px] leading-[1.05] font-bold tracking-[-0.02em]">
                                        {tool.title}
                                    </h1>
                                </div>
                                <p className="mt-1 max-w-[60ch] text-[15px] text-[var(--color-ink-soft)]">{tool.sub}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        {onAddToWorkspace ? (
                            <button
                                type="button"
                                onClick={onAddToWorkspace}
                                className="ms-btn px-3 py-2 text-[12px] font-semibold"
                            >
                                {addToWorkspaceLabel}
                            </button>
                        ) : null}
                        <button
                            type="button"
                            aria-label={favorite ? 'Favorit entfernen' : 'Als Favorit markieren'}
                            aria-pressed={favorite}
                            onClick={() => toggleFavorite(tool.id)}
                            className="ms-focus inline-flex h-10 w-10 items-center justify-center rounded-[10px] border-2 border-black bg-white shadow-brutal-sm transition hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000]"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5"
                                fill={favorite ? '#ffc900' : 'none'}
                                stroke="black"
                                strokeWidth="2"
                            >
                                <path d="M12 3.8l2.68 5.43 5.99.87-4.33 4.22 1.02 5.96L12 17.43l-5.36 2.83 1.02-5.96-4.33-4.22 5.99-.87z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </main>
            <ToolBody tool={tool} />
        </div>
    );
}
