import type { CalcResult, FieldValues } from '../_shared/shells';
import {
    DESCRIPTION_PIXEL_LIMIT,
    estimateDescriptionPixels,
    estimateTitlePixels,
    TITLE_PIXEL_LIMIT,
} from '../_shared/seo/pixel-width';

function status(chars: number, pixels: number, charLimit: number, pixelLimit: number): string {
    if (chars === 0) return '—';
    if (pixels > pixelLimit || chars > charLimit) return 'Zu lang';
    if (pixels > pixelLimit * 0.9 || chars > charLimit * 0.9) return 'Knapp';
    return 'OK';
}

/** Title & meta length with pixel estimates. */
export function computeTitleLength(values: FieldValues): CalcResult {
    const title = values.title?.trim() ?? '';
    const description = values.description?.trim() ?? '';

    if (!title && !description) {
        return { rows: [], error: 'Title oder Meta-Description eingeben.' };
    }

    const titleChars = title.length;
    const titlePx = estimateTitlePixels(title);
    const descChars = description.length;
    const descPx = estimateDescriptionPixels(description);

    const rows = [];
    if (title) {
        rows.push(
            { label: 'Title Zeichen', value: String(titleChars) },
            { label: 'Title Pixel (ca.)', value: `~${titlePx} / ${TITLE_PIXEL_LIMIT}` },
            { label: 'Title Status', value: status(titleChars, titlePx, 60, TITLE_PIXEL_LIMIT) },
        );
    }
    if (description) {
        rows.push(
            { label: 'Description Zeichen', value: String(descChars) },
            {
                label: 'Description Pixel (ca.)',
                value: `~${descPx} / ${DESCRIPTION_PIXEL_LIMIT}`,
            },
            {
                label: 'Description Status',
                value: status(descChars, descPx, 160, DESCRIPTION_PIXEL_LIMIT),
            },
        );
    }

    const tone =
        rows.some((r) => r.value === 'Zu lang')
            ? 'danger'
            : rows.some((r) => r.value === 'Knapp')
              ? 'warn'
              : 'success';

    return {
        tone,
        heading: 'Title & Meta-Länge',
        rows,
        hint: 'Pixel-Schätzung ist näherungsweise — Google variiert je nach Zeichen.',
    };
}
