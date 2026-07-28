import type { FieldValues, GenerateOutput } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

export function generateShadowCss(values: FieldValues): GenerateOutput {
    const x = parseFieldNumber(values.x ?? '4') ?? 4;
    const y = parseFieldNumber(values.y ?? '4') ?? 4;
    const blur = parseFieldNumber(values.blur ?? '0') ?? 0;
    const spread = parseFieldNumber(values.spread ?? '0') ?? 0;
    const color = (values.color ?? '#000000').trim();
    const style = values.style ?? 'brutal';
    const css = style === 'brutal'
        ? `box-shadow: ${x}px ${y}px 0 ${color};`
        : `box-shadow: ${x}px ${y}px ${blur}px ${spread}px ${color}40;`;
    return { kind: 'code', content: css, language: 'css', filename: 'shadow.css' };
}
