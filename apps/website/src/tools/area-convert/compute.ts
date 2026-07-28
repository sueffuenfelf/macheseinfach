import type { CalcResult, FieldValues } from '../_shared/shells';
import { AREA_TO_SQM } from '../_shared/units';
import { computeUnitConversion } from '../_shared/units/unit-calc';

const LABELS: Record<string, string> = {
    m2: 'm²',
    ha: 'ha',
    ft2: 'ft²',
};

export function computeAreaConvert(values: FieldValues): CalcResult {
    return computeUnitConversion(values, AREA_TO_SQM, LABELS);
}
