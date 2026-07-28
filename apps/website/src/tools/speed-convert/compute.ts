import type { CalcResult, FieldValues } from '../_shared/shells';
import { SPEED_TO_KMH } from '../_shared/units';
import { computeUnitConversion } from '../_shared/units/unit-calc';

const LABELS: Record<string, string> = {
    kmh: 'km/h',
    mph: 'mph',
};

export function computeSpeedConvert(values: FieldValues): CalcResult {
    return computeUnitConversion(values, SPEED_TO_KMH, LABELS);
}
