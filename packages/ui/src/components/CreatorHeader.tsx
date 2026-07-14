import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { Text } from '../primitives/Text';

export type CreatorHeaderProps = {
    name: string;
    handle: string;
    bio: string;
    productCount: number;
    onFollow?: () => void;
};

export function CreatorHeader({ name, handle, bio, productCount, onFollow }: CreatorHeaderProps) {
    return (
        <header className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Text as="h1" variant="display" className="text-2xl sm:text-3xl">
                        {name}
                    </Text>
                    <Badge tone="neutral">{productCount} products</Badge>
                </div>
                <Text variant="caption">@{handle}</Text>
                <Text variant="body" className="max-w-xl">
                    {bio}
                </Text>
            </div>
            <Button variant="primary" onClick={onFollow}>
                Follow
            </Button>
        </header>
    );
}
