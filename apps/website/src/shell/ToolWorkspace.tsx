import { areas, maturityLabel, type Tool } from '../data/catalog';
import { usePlatform } from '../context/PlatformContext';
import { Icon } from './Icon';
import { TrustBadge } from './components/Primitives';
import { ToolBody } from './tools';

type ToolWorkspaceProps = {
    tool: Tool;
};

export function ToolWorkspace({ tool }: ToolWorkspaceProps) {
    const { activeAreaId, goToSituation, toggleFavorite, isFavorite } = usePlatform();
    const area = areas[activeAreaId ?? tool.areas[0]];
    const favorite = isFavorite(tool.id);

    return (
        <div className="flex-1">
            <main className="mx-auto w-full max-w-[1040px] px-4 pt-8 md:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-3">
                        <button
                            type="button"
                            onClick={goToSituation}
                            className="ms-focus inline-flex items-center gap-2 font-display text-[14px] font-bold hover:underline"
                        >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                                <path d="M15 5l-7 7 7 7" />
                            </svg>
                            Zurück zu {area.label}
                        </button>
                        <div className="flex items-start gap-3">
                            <span
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border-2 border-black"
                                style={{ background: area.accent }}
                            >
                                <Icon svg={area.icon} size={22} />
                            </span>
                            <div className="min-w-0">
                                <h1 className="font-display text-[32px] leading-[1.05] font-bold tracking-[-0.02em]">
                                    {tool.title}
                                </h1>
                                <p className="mt-1 max-w-[60ch] text-[15px] text-[var(--color-ink-soft)]">{tool.sub}</p>
                            </div>
                        </div>
                        <TrustBadge label={tool.trust} />
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <span className="ms-badge bg-[var(--color-chip)]">{maturityLabel(tool.maturity)}</span>
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
