import { Badge } from '@macheseinfach/ui';

const trustItems = [
    '100 % im Browser',
    'Keine Registrierung',
    'Kein Upload an Server',
    'DSGVO-by-Design',
] as const;

export function TrustBar() {
    return (
        <section
            className="flex flex-wrap items-center justify-center gap-2 border-y border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
            aria-label="Vertrauensmerkmale"
        >
            {trustItems.map((item) => (
                <Badge key={item} tone="success">
                    {item}
                </Badge>
            ))}
        </section>
    );
}
