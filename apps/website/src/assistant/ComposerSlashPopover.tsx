import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    filterComposerSlashCommands,
    parseComposerSlashInput,
    type ComposerSlashCommand,
} from './composer-commands';

type ComposerSlashPopoverProps = {
    draft: string;
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
    onSelect: (nextDraft: string) => void;
    onExecute: (command: ComposerSlashCommand) => void;
};

export function ComposerSlashPopover({
    draft,
    textareaRef,
    onSelect,
    onExecute,
}: ComposerSlashPopoverProps) {
    const open = draft.startsWith('/');
    const commands = useMemo(() => filterComposerSlashCommands(draft), [draft]);
    const parsed = useMemo(() => parseComposerSlashInput(draft), [draft]);
    const [activeIndex, setActiveIndex] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number } | null>(
        null,
    );

    useEffect(() => {
        if (!open) {
            setActiveIndex(0);
            return;
        }
        setActiveIndex((prev) => Math.min(prev, Math.max(commands.length - 1, 0)));
    }, [commands.length, open]);

    useEffect(() => {
        if (!open) {
            setMenuStyle(null);
            return;
        }
        const el = textareaRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setMenuStyle({
            top: Math.max(8, rect.top - 8),
            left: rect.left,
            width: Math.min(rect.width, 360),
        });
    }, [draft, open, textareaRef]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((prev) =>
                    commands.length === 0 ? 0 : (prev + 1) % commands.length,
                );
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((prev) =>
                    commands.length === 0 ? 0 : (prev - 1 + commands.length) % commands.length,
                );
                return;
            }
            if (e.key === 'Tab') {
                const selected = commands[activeIndex];
                if (!selected) return;
                e.preventDefault();
                if (selected.instant && !parsed?.args) {
                    onExecute(selected);
                    return;
                }
                const args = parsed?.args ?? '';
                onSelect(args.trim() ? `/${selected.name} ${args}` : `/${selected.name} `);
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                onSelect('');
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [activeIndex, commands, onExecute, onSelect, open, parsed?.args]);

    if (!open || !menuStyle || commands.length === 0) return null;

    return createPortal(
        <div
            ref={menuRef}
            role="listbox"
            aria-label="Assistenten-Befehle"
            className="max-h-[220px] overflow-y-auto rounded-[10px] border-2 border-black bg-white p-1 shadow-brutal-lg"
            style={{
                position: 'fixed',
                top: menuStyle.top,
                left: menuStyle.left,
                width: menuStyle.width,
                transform: 'translateY(-100%)',
                zIndex: 80,
            }}
        >
            {commands.map((cmd, index) => (
                <button
                    key={cmd.name}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    className={`ms-focus flex w-full flex-col rounded-[8px] px-2.5 py-2 text-left ${
                        index === activeIndex
                            ? 'bg-[var(--color-success)]'
                            : 'hover:bg-[var(--color-chip)]'
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                        if (cmd.instant && !parsed?.args) {
                            onExecute(cmd);
                            return;
                        }
                        const args = parsed?.args ?? '';
                        onSelect(args.trim() ? `/${cmd.name} ${args}` : `/${cmd.name} `);
                    }}
                >
                    <span className="font-display text-[13px] font-semibold">
                        {cmd.description}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--color-ink-muted)]">
                        {cmd.usage}
                    </span>
                </button>
            ))}
        </div>,
        document.body,
    );
}
