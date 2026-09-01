import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type SideNavItemProps = {
    to?: string;
    onClick?: () => void;
    active?: boolean;
    icon: ReactNode;
    label: string;
    /** Trailing slot — kbd badge, count, etc. Fixed width column prevents label shift */
    trailing?: ReactNode;
};

const baseClass =
    'ms-focus ms-sidenav-btn flex w-full items-center gap-2 px-2.5 py-1.5 font-display text-[13px] font-semibold';

function SideNavItemContent({
    icon,
    label,
    trailing,
}: Pick<SideNavItemProps, 'icon' | 'label' | 'trailing'>) {
    return (
        <>
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">{icon}</span>
            <span className="min-w-0 flex-1 truncate text-left">{label}</span>
            <span className="flex shrink-0 items-center justify-end gap-1">{trailing ?? null}</span>
        </>
    );
}

export function SideNavItem({
    to,
    onClick,
    active = false,
    icon,
    label,
    trailing,
}: SideNavItemProps) {
    const className = baseClass;
    const activeProps = active ? { 'data-active': true as const } : {};

    if (to) {
        return (
            <Link to={to} onClick={onClick} className={className} {...activeProps}>
                <SideNavItemContent icon={icon} label={label} trailing={trailing} />
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} className={className} {...activeProps}>
            <SideNavItemContent icon={icon} label={label} trailing={trailing} />
        </button>
    );
}

/** Bereich child row — same spacing/icon column as top-level items */
export type SideNavAreaItemProps = {
    to: string;
    onClick?: () => void;
    active?: boolean;
    accent: string;
    icon: ReactNode;
    label: string;
};

export function SideNavAreaItem({
    to,
    onClick,
    active = false,
    accent,
    icon,
    label,
}: SideNavAreaItemProps) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`${baseClass} text-[12px]`}
            {...(active ? { 'data-active': true as const } : {})}
        >
            <span
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border border-black/30"
                style={{ background: accent }}
            >
                {icon}
            </span>
            <span className="min-w-0 flex-1 truncate text-left">{label}</span>
            <span className="w-0 shrink-0" aria-hidden />
        </Link>
    );
}

export type SideNavFavoriteItemProps = {
    label: string;
    icon: ReactNode;
    active?: boolean;
    onClick: () => void;
};

export function SideNavFavoriteItem({
    label,
    icon,
    active = false,
    onClick,
}: SideNavFavoriteItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`${baseClass} text-[12px]`}
            {...(active ? { 'data-active': true as const } : {})}
        >
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">{icon}</span>
            <span className="min-w-0 flex-1 truncate text-left">{label}</span>
            <span className="w-0 shrink-0" aria-hidden />
        </button>
    );
}
