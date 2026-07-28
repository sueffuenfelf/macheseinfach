import type { CalcResult, FieldValues } from '../_shared/shells';
import { FILE_SIZE_TO_BYTES } from '../_shared/units';
import { computeUnitConversion } from '../_shared/units/unit-calc';

const LABELS: Record<string, string> = {
    B: 'B',
    KB: 'KB',
    MB: 'MB',
    GB: 'GB',
    TB: 'TB',
};

export function computeFileSizeConvert(values: FieldValues): CalcResult {
    return computeUnitConversion(values, FILE_SIZE_TO_BYTES, LABELS);
}
