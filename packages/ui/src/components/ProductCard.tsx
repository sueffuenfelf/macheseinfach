import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';

export type ProductCardProps = {
    title: string;
    creator: string;
    priceLabel: string;
    description: string;
    tag?: string;
    onAction?: () => void;
};

export function ProductCard({
    title,
    creator,
    priceLabel,
    description,
    tag,
    onAction,
}: ProductCardProps) {
    return (
        <Card className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <Text variant="caption">{creator}</Text>
                    <Text as="h3" variant="title">
                        {title}
                    </Text>
                </div>
                {tag ? <Badge tone="accent">{tag}</Badge> : null}
            </div>
            <Text variant="body">{description}</Text>
            <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                <Text as="span" variant="title" className="text-[var(--color-accent-strong)]">
                    {priceLabel}
                </Text>
                <Button variant="secondary" onClick={onAction}>
                    View product
                </Button>
            </div>
        </Card>
    );
}
