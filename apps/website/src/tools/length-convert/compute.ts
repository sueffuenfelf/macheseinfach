import type { CalcResult, FieldValues } from '../_shared/shells';
import { LENGTH_TO_METERS } from '../_shared/units';
import { computeUnitConversion } from '../_shared/units/unit-calc';

const LABELS: Record<string, string> = {
    cm: 'cm',
    m: 'm',
    km: 'km',
    inch: 'Zoll',
    ft: 'Fuß',
};

export function computeLengthConvert(values: FieldValues): CalcResult {
    return computeUnitConversion(values, LENGTH_TO_METERS, LABELS);
}
