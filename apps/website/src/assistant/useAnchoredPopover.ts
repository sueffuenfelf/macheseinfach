import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

type Placement = 'bottom' | 'top' | 'auto';

export function useAnchoredPopover(options?: { width?: number; placement?: Placement }) {
    const width = options?.width ?? 280;
    const placement = options?.placement ?? 'bottom';
    const [open, setOpen] = useState(false);
    const menuId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number } | null>(
        null,
    );

    useLayoutEffect(() => {
        if (!open || !triggerRef.current) {
            setMenuStyle(null);
            return;
        }

        function positionMenu() {
            const trigger = triggerRef.current;
            const menu = menuRef.current;
            if (!trigger) return;
            const rect = trigger.getBoundingClientRect();
            const menuWidth = Math.min(window.innerWidth - 16, width);
            const menuHeight = menu?.offsetHeight ?? 0;
            const gap = 4;

            let openUp = placement === 'top';
            if (placement === 'auto') {
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                openUp = spaceBelow < menuHeight + gap && spaceAbove > spaceBelow;
            }

            const top = openUp ? Math.max(8, rect.top - menuHeight - gap) : rect.bottom + gap;

            setMenuStyle({
                top,
                left: Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8)),
                width: menuWidth,
            });
        }

        positionMenu();
        const raf = window.requestAnimationFrame(positionMenu);
        window.addEventListener('resize', positionMenu);
        window.addEventListener('scroll', positionMenu, true);
        return () => {
            window.cancelAnimationFrame(raf);
            window.removeEventListener('resize', positionMenu);
            window.removeEventListener('scroll', positionMenu, true);
        };
    }, [open, placement, width]);

    useEffect(() => {
        if (!open) return;
        function onPointer(e: MouseEvent) {
            const target = e.target as Node;
            if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
            setOpen(false);
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        window.addEventListener('mousedown', onPointer);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('mousedown', onPointer);
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return { open, setOpen, menuId, rootRef, triggerRef, menuRef, menuStyle };
}
