import { BRAND_LOGO_SRC, BRAND_NAME, BRAND_TLD } from './brand';
import {
    LOGO_CHECK_INNER_WIDTH,
    LOGO_CHECK_PATH,
    LOGO_M_PATH,
    LOGO_PINK,
    LOGO_STROKE_WIDTH,
    LOGO_VIEWBOX,
} from './logoPaths';

type BrandLogoProps = {
    size?: number;
    showWordmark?: boolean;
    className?: string;
};

type SvgMarkProps = {
    size?: number;
    className?: string;
    animated?: boolean;
};

function BrandMarkSvg({ size = 64, className = '', animated = false }: SvgMarkProps) {
    const rootClass = animated ? `ms-logo-draw ${className}` : className;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={LOGO_VIEWBOX}
            width={size}
            height={size}
            fill="none"
            role="img"
            aria-hidden={animated ? true : undefined}
            aria-label={animated ? undefined : 'macheseinfach Logo'}
            className={rootClass}
            style={{ width: size, height: size }}
        >
            <path
                className="ms-logo-draw__m-fill"
                d={LOGO_M_PATH}
                fill={LOGO_PINK}
                stroke="none"
            />
            <path
                className="ms-logo-draw__m-stroke"
                d={LOGO_M_PATH}
                fill="none"
                stroke="#000"
                strokeWidth={LOGO_STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
            />
            <path
                className="ms-logo-draw__check-inner"
                d={LOGO_CHECK_PATH}
                fill="none"
                stroke="#fff"
                strokeWidth={LOGO_CHECK_INNER_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
            />
            <path
                className="ms-logo-draw__check-stroke"
                d={LOGO_CHECK_PATH}
                fill="none"
                stroke="#000"
                strokeWidth={LOGO_STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
            />
        </svg>
    );
}

export function BrandLogo({ size = 28, showWordmark = true, className = '' }: BrandLogoProps) {
    return (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
            <BrandMarkSvg size={size} />
            {showWordmark ? (
                <span className="font-display text-[19px] font-bold tracking-[-0.02em] text-[var(--color-ink)]">
                    <span>mach</span>
                    <span>es</span>
                    <span className="text-[var(--color-brand)]">einfa.ch</span>
                </span>
            ) : null}
        </span>
    );
}

export function BrandMark({ size = 64, className = '' }: { size?: number; className?: string }) {
    return <BrandMarkSvg size={size} className={className} />;
}

/** Animated stroke-draw variant for session splash. */
export function BrandMarkDraw({ size = 96, className = '' }: { size?: number; className?: string }) {
    return <BrandMarkSvg size={size} className={className} animated />;
}

/** Static img fallback (favicon contexts, external refs). */
export function BrandMarkImg({ size = 64, className = '' }: { size?: number; className?: string }) {
    return (
        <img
            src={BRAND_LOGO_SRC}
            alt="macheseinfach Logo"
            width={size}
            height={size}
            className={`object-contain ${className}`}
            style={{ width: size, height: size }}
        />
    );
}
