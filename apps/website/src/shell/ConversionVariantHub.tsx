import { Link } from 'react-router-dom';
import { areas } from '../data/catalog';
import { variantPath } from '../routing/paths';
import { getVariantsForTool } from '../tools/variant-registry';
import { AppPageHeader, PageContainer } from './PageContainer';

export function ConversionVariantHub() {
    const area = areas.bilder;
    const variants = getVariantsForTool('image-convert');

    return (
        <PageContainer wide>
            <AppPageHeader
                showBack
                title="Bildformat ändern"
                subtitle="Wähle die passende Konvertierung — alle Varianten laufen lokal im Browser."
            />

            <section className="max-w-[720px]">
                <div className="overflow-hidden rounded-[12px] border-2 border-black bg-white shadow-brutal">
                    <ul className="ms-stagger" role="list">
                        {variants.map((variant, index) => (
                            <li key={variant.id} role="presentation">
                                <Link
                                    to={variantPath('bilder', variant.slug, 'image-convert')}
                                    className={`ms-focus pick-list-row block w-full px-4 py-3.5 transition hover:bg-[var(--color-chip)] ${
                                        index < variants.length - 1 ? 'border-b-2 border-black' : ''
                                    }`}
                                >
                                    <span className="font-display text-[16px] font-bold tracking-[-0.01em]">
                                        {variant.seo.h1}
                                    </span>
                                    <span className="mt-1 block text-[13px] text-[var(--color-ink-soft)]">
                                        {variant.seo.description}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="mt-2 text-[11px] text-[var(--color-ink-soft)]">
                    {variants.length} Konvertierungen · HEIC, PNG, JPG, WebP
                </p>
            </section>
        </PageContainer>
    );
}
