import { Link } from 'react-router-dom';
import { areas, stories } from '../data/catalog';
import { variantPath } from '../routing/paths';
import { PageHead } from '../seo/PageHead';
import { getVariantsForTool } from '../tools/variant-registry';
import { BackButton, SectionLabel } from './components/Primitives';

const HUB_STORY_ID = 'story-bild-format-aendern' as const;

export function ConversionVariantHub() {
    const story = stories[HUB_STORY_ID];
    const area = areas.bilder;
    const variants = getVariantsForTool('image-convert');

    return (
        <>
            <PageHead
                fallbackTitle={story.outcome}
                description={story.situation}
                canonicalPath={`/bereich/${area.slug}/${story.slug}`}
            />
            <main className="mx-auto w-full max-w-[1040px] px-4 py-6 md:px-6 md:py-8">
                <BackButton />

                <SectionLabel className="mt-6">{area.label}</SectionLabel>
                <h1 className="mt-2 max-w-[48ch] font-display text-[28px] leading-tight font-bold tracking-[-0.02em] sm:text-[34px]">
                    {story.outcome}
                </h1>
                <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
                    {story.situation} Wähle die passende Konvertierung — alle Varianten laufen lokal
                    im Browser.
                </p>

                <section className="mt-7 max-w-[720px]">
                    <div className="overflow-hidden rounded-[14px] border-2 border-black bg-white shadow-brutal">
                        <ul className="ms-stagger" role="list">
                            {variants.map((variant, index) => (
                                <li key={variant.id} role="presentation">
                                    <Link
                                        to={variantPath('bilder', variant.slug, 'image-convert')}
                                        className={`ms-focus pick-list-row block w-full px-5 py-4 transition hover:bg-[var(--color-chip)] ${
                                            index < variants.length - 1
                                                ? 'border-b-2 border-black'
                                                : ''
                                        }`}
                                    >
                                        <span className="font-display text-[18px] font-bold tracking-[-0.01em]">
                                            {variant.seo.h1}
                                        </span>
                                        <span className="mt-1 block text-[14px] text-[var(--color-ink-soft)]">
                                            {variant.seo.description}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p className="mt-3 text-[12px] text-[var(--color-ink-soft)]">
                        {variants.length} Konvertierungen · HEIC, PNG, JPG, WebP
                    </p>
                </section>
            </main>
        </>
    );
}
