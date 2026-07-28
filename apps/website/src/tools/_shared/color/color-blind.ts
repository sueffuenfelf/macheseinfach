import { clampByte } from './internal';
import type { Rgb } from './parse';

export type ColorBlindMode = 'protanopia' | 'deuteranopia' | 'tritanopia';

/** Simplified Brettel/Vienot-style matrices for preview (not medical grade). */
const MATRICES: Record<ColorBlindMode, number[][]> = {
    protanopia: [
        [0.56667, 0.43333, 0],
        [0.55833, 0.44167, 0],
        [0, 0.24167, 0.75833],
    ],
    deuteranopia: [
        [0.625, 0.375, 0],
        [0.7, 0.3, 0],
        [0, 0.3, 0.7],
    ],
    tritanopia: [
        [0.95, 0.05, 0],
        [0, 0.43333, 0.56667],
        [0, 0.475, 0.525],
    ],
};

export function simulateColorBlindness(rgb: Rgb, mode: ColorBlindMode): Rgb {
    const m = MATRICES[mode];
    const v = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    return {
        r: clampByte((m[0]![0]! * v[0]! + m[0]![1]! * v[1]! + m[0]![2]! * v[2]!) * 255),
        g: clampByte((m[1]![0]! * v[0]! + m[1]![1]! * v[1]! + m[1]![2]! * v[2]!) * 255),
        b: clampByte((m[2]![0]! * v[0]! + m[2]![1]! * v[1]! + m[2]![2]! * v[2]!) * 255),
    };
}
