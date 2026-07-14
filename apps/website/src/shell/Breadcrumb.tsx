import { areas, stories } from '../data/catalog';
import { usePlatform } from '../context/PlatformContext';

function Pill({
    label,
    active,
    disabled,
    onClick,
}: {
    label: string;
    active: boolean;
    disabled?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`ms-focus rounded-full border-2 px-3 py-1.5 font-display text-[13px] font-semibold transition ${
                active
                    ? 'border-black bg-[var(--color-area-behoerden)] text-black shadow-brutal-sm'
                    : 'border-[#ccc] bg-white text-[var(--color-ink-muted)]'
            } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:-translate-x-[1px] hover:-translate-y-[1px]'}`}
        >
            {label}
        </button>
    );
}

export function Breadcrumb() {
    const { activeAreaId, activeStoryId, activeTool, goHome, goToSituation } = usePlatform();

    const areaLabel = activeAreaId ? areas[activeAreaId].shortLabel : 'Bereich';
    const storyLabel = activeStoryId ? stories[activeStoryId].outcome : 'Situation';
    const toolLabel = activeTool ? activeTool.shortTitle : 'Tool';

    return (
        <nav className="mx-auto w-full max-w-[1040px] px-4 py-4 md:px-6" aria-label="Pfad">
            <div className="flex flex-wrap items-center gap-2 font-display text-[13px] font-semibold">
                <Pill label={areaLabel} active={!activeAreaId} onClick={goHome} />
                <span className="text-[var(--color-ink-muted)]">›</span>
                <Pill
                    label={storyLabel}
                    active={Boolean(activeAreaId) && !activeTool}
                    disabled={!activeAreaId}
                    onClick={activeAreaId ? goToSituation : undefined}
                />
                <span className="text-[var(--color-ink-muted)]">›</span>
                <Pill label={toolLabel} active={Boolean(activeTool)} disabled={!activeTool} />
            </div>
        </nav>
    );
}
