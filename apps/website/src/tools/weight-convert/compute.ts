import type { CalcResult, FieldValues } from '../_shared/shells';
import { WEIGHT_TO_KG } from '../_shared/units';
import { computeUnitConversion } from '../_shared/units/unit-calc';

const LABELS: Record<string, string> = {
    g: 'g',
    kg: 'kg',
    lb: 'Pfund',
    oz: 'Unze',
};

export function computeWeightConvert(values: FieldValues): CalcResult {
    return computeUnitConversion(values, WEIGHT_TO_KG, LABELS);
}
