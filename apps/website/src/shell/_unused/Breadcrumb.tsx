// Intentionally unused — breadcrumb UI disabled for now; kept for future re-enable.
import { Link } from 'react-router-dom';
import { areas } from '../../data/catalog';
import { areaPath } from '../../routing/paths';
import { usePlatformNav } from '../../routing/usePlatformNav';

function Pill({
    label,
    active,
    disabled,
    to,
}: {
    label: string;
    active: boolean;
    disabled?: boolean;
    to?: string;
}) {
    const base =
        'relative z-10 ms-focus rounded-full border-2 px-3 py-1.5 font-display text-[13px] font-semibold transition-[background-color,border-color,color,box-shadow] duration-150';

    const activeClass =
        'border-black bg-[var(--color-area-behoerden)] text-black shadow-brutal-sm cursor-default';

    const inactiveClass =
        'border-[#ccc] bg-white text-[var(--color-ink-muted)] cursor-pointer hover:border-black/70 hover:bg-[var(--color-chip)] hover:text-[var(--color-ink)] hover:shadow-[1px_1px_0_rgba(0,0,0,0.35)]';

    const disabledClass = 'cursor-default opacity-55';

    const className = `${base} ${active ? activeClass : disabled ? disabledClass : inactiveClass}`;

    if (disabled || !to || active) {
        return (
            <span aria-current={active ? 'page' : undefined} className={className}>
                {label}
            </span>
        );
    }

    return (
        <Link to={to} className={className}>
            {label}
        </Link>
    );
}

export function Breadcrumb() {
    const { page, activeAreaId, activeTool } = usePlatformNav();

    const areaLabel = activeAreaId ? areas[activeAreaId].shortLabel : 'Bereich';
    const toolLabel = activeTool ? activeTool.shortTitle : 'Tool';

    const areaTo = activeAreaId ? areaPath(activeAreaId) : undefined;

    return (
        <nav className="mx-auto w-full max-w-[1040px] px-4 py-4 md:px-6" aria-label="Pfad">
            <div className="flex flex-wrap items-center gap-2 font-display text-[13px] font-semibold">
                <Pill label={areaLabel} active={page === 'area'} to={page === 'area' ? undefined : areaTo} />
                <span className="text-[var(--color-ink-muted)]" aria-hidden>
                    ›
                </span>
                <Pill label={toolLabel} active={page === 'tool'} disabled />
            </div>
        </nav>
    );
}
