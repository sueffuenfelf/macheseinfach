/** Rough Google SERP pixel width estimate (Latin, ~20px title font). */
export function estimateTitlePixels(text: string): number {
    let total = 0;
    for (const ch of text) {
        if (ch === ' ') total += 3;
        else if (ch === '|' || ch === '!' || ch === '.' || ch === ',') total += 4;
        else if (ch >= 'A' && ch <= 'Z') total += 10;
        else if (ch >= 'a' && ch <= 'z') total += 7;
        else if (ch >= '0' && ch <= '9') total += 8;
        else total += 9;
    }
    return total;
}

/** Meta description pixel estimate (~14px font). */
export function estimateDescriptionPixels(text: string): number {
    let total = 0;
    for (const ch of text) {
        if (ch === ' ') total += 3;
        else if (ch >= 'A' && ch <= 'Z') total += 8;
        else if (ch >= 'a' && ch <= 'z') total += 6;
        else if (ch >= '0' && ch <= '9') total += 7;
        else total += 7;
    }
    return total;
}

export const TITLE_PIXEL_LIMIT = 580;
export const DESCRIPTION_PIXEL_LIMIT = 920;
