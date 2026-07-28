import type { CalcResult, FieldValues } from '../_shared/shells';
import { VOLUME_TO_LITERS } from '../_shared/units';
import { computeUnitConversion } from '../_shared/units/unit-calc';

const LABELS: Record<string, string> = {
    ml: 'ml',
    l: 'l',
    gal: 'gal (US)',
};

export function computeVolumeConvert(values: FieldValues): CalcResult {
    return computeUnitConversion(values, VOLUME_TO_LITERS, LABELS);
}
