/** Factor tables: multiply value by factor to get base unit. */

export const FILE_SIZE_TO_BYTES = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
} as const;

export const LENGTH_TO_METERS = {
    cm: 0.01,
    m: 1,
    km: 1000,
    inch: 0.0254,
    ft: 0.3048,
} as const;

export const WEIGHT_TO_KG = {
    g: 0.001,
    kg: 1,
    lb: 0.45359237,
    oz: 0.028349523125,
} as const;

export const SPEED_TO_KMH = {
    kmh: 1,
    mph: 1.609344,
} as const;

export const AREA_TO_SQM = {
    m2: 1,
    ha: 10_000,
    ft2: 0.09290304,
} as const;

export const VOLUME_TO_LITERS = {
    ml: 0.001,
    l: 1,
    gal: 3.785411784,
} as const;

export type FileSizeUnit = keyof typeof FILE_SIZE_TO_BYTES;
export type LengthUnit = keyof typeof LENGTH_TO_METERS;
export type WeightUnit = keyof typeof WEIGHT_TO_KG;
export type SpeedUnit = keyof typeof SPEED_TO_KMH;
export type AreaUnit = keyof typeof AREA_TO_SQM;
export type VolumeUnit = keyof typeof VOLUME_TO_LITERS;
export type TempUnit = 'c' | 'f' | 'k';
