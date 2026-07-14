import { Button, Text } from '@macheseinfach/ui';

type PlatformHeaderProps = {
    onOpenCommand: () => void;
};

export function PlatformHeader({ onOpenCommand }: PlatformHeaderProps) {
    return (
        <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6">
            <div>
                <Text as="p" variant="caption" className="text-[var(--color-accent-strong)]">
                    Schweizer Taschenmesser fürs Netz
                </Text>
                <Text as="h1" variant="display" className="text-2xl sm:text-3xl">
                    macheseinfa.ch
                </Text>
            </div>
            <Button type="button" variant="secondary" onClick={onOpenCommand} aria-keyshortcuts="Control+K Meta+K">
                Command Center
                <kbd className="ml-2 rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-1.5 py-0.5 font-mono text-[0.65rem] font-normal">
                    ⌘K
                </kbd>
            </Button>
        </header>
    );
}
