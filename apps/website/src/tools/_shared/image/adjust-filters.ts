export type BrightnessContrast = {
    /** −100 … +100 */
    brightness: number;
    /** −100 … +100 */
    contrast: number;
};

export function clampAdjustValue(value: number): number {
    return Math.min(100, Math.max(-100, value));
}

/** CSS filter values for canvas preview/export. */
export function brightnessContrastFilter(adjust: BrightnessContrast): string {
    const brightness = clampAdjustValue(adjust.brightness);
    const contrast = clampAdjustValue(adjust.contrast);
    return `brightness(${100 + brightness}%) contrast(${100 + contrast}%)`;
}

export function isNeutralAdjust(adjust: BrightnessContrast): boolean {
    return adjust.brightness === 0 && adjust.contrast === 0;
}
