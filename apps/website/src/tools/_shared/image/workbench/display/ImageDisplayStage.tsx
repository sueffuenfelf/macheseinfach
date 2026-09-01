import { ImageDisplayCompareSlider } from './ImageDisplayCompareSlider';
import { ImageDisplayFit } from './ImageDisplayFit';
import type { ImageDisplayKind } from './types';

type ImageDisplayStageProps = {
    kind: ImageDisplayKind;
    before: Blob | null;
    after: Blob | null;
    afterLoading?: boolean;
    alt: string;
    beforeLabel?: string;
    afterLabel?: string;
};

/**
 * Picks a stage renderer. Tools pass a kind; more kinds (grid, loupe, …) slot in here.
 */
export function ImageDisplayStage({
    kind,
    before,
    after,
    afterLoading = false,
    alt,
    beforeLabel,
    afterLabel,
}: ImageDisplayStageProps) {
    if (kind === 'compare-slider' && before) {
        return (
            <ImageDisplayCompareSlider
                before={before}
                after={after}
                afterLoading={afterLoading}
                alt={alt}
                beforeLabel={beforeLabel}
                afterLabel={afterLabel}
            />
        );
    }
    if (before) return <ImageDisplayFit blob={before} alt={alt} />;
    return null;
}
