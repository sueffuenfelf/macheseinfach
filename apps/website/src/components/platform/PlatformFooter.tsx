import { Text } from '@macheseinfach/ui';

export function PlatformFooter() {
    return (
        <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-8 text-center">
            <Text variant="caption">
                macheseinfa.ch v0.1 — Static · Client-only · Keine Cookies · Kein Tracking
            </Text>
        </footer>
    );
}
