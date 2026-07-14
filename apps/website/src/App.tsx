import {
    Badge,
    Button,
    Card,
    CreatorHeader,
    Input,
    ProductCard,
    Text,
} from '@macheseinfach/ui';

const sampleProducts = [
    {
        title: 'Notion Template Pack',
        creator: 'Studio M',
        priceLabel: '€19',
        description: 'Launch-ready creator templates with Gumroad-style polish.',
        tag: 'Digital',
    },
    {
        title: 'Lightroom Presets',
        creator: 'Studio M',
        priceLabel: '€12',
        description: 'Soft contrast presets for product photography.',
        tag: 'Bundle',
    },
];

export function App() {
    return (
        <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12">
            <CreatorHeader
                name="Macheseinfach"
                handle="macheseinfach"
                bio="Creator-commerce UI kit — Gumroad-inspired primitives and components for digital products."
                productCount={sampleProducts.length}
            />

            <section className="grid gap-4 sm:grid-cols-2">
                {sampleProducts.map((product) => (
                    <ProductCard key={product.title} {...product} />
                ))}
            </section>

            <Card>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Text variant="title">Primitives</Text>
                        <Badge tone="accent">UI kit</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="ghost">Ghost</Button>
                    </div>
                    <Input label="Email" placeholder="you@example.com" hint="Newsletter signup demo" />
                </div>
            </Card>
        </main>
    );
}
