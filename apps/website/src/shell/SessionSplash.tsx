import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BrandMarkDraw } from './BrandLogo';
import { BRAND_NAME, BRAND_TLD } from './brand';
import { useSessionBootstrap } from './useSessionBootstrap';

type SessionSplashProps = {
    children: ReactNode;
};

function prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function SessionSplash({ children }: SessionSplashProps) {
    const skipped = useRef(
        typeof sessionStorage !== 'undefined' && sessionStorage.getItem('msf.session.splash.v1') === '1',
    );
    const { phase, showSplash, markAnimationComplete, animationMinMs } = useSessionBootstrap();
    const [playEnter, setPlayEnter] = useState(false);
    const exiting = phase === 'exiting';

    useEffect(() => {
        if (phase === 'exiting') setPlayEnter(true);
    }, [phase]);

    useEffect(() => {
        if (skipped.current) return;

        if (prefersReducedMotion()) {
            markAnimationComplete();
            return;
        }

        const timer = window.setTimeout(markAnimationComplete, animationMinMs);
        return () => window.clearTimeout(timer);
    }, [animationMinMs, markAnimationComplete]);

    return (
        <div className="relative min-h-screen overflow-x-hidden">
            <div
                className={`ms-app-shell ${playEnter && !skipped.current ? 'ms-app-shell--enter' : ''}`}
                aria-hidden={showSplash || undefined}
            >
                {children}
            </div>

            {showSplash ? (
                <div
                    className={`ms-session-splash ${exiting ? 'ms-session-splash--exit' : ''}`}
                    role="status"
                    aria-live="polite"
                    aria-busy={!exiting}
                    aria-label="macheseinfach wird geladen"
                >
                    <div className="ms-session-splash__inner">
                        <BrandMarkDraw size={96} className="ms-session-splash__logo" />
                        <p className="mt-6 font-display text-[22px] font-bold tracking-[-0.02em] text-[var(--color-ink)]">
                            <span>mach</span>
                            <span>es</span>
                            <span className="text-[var(--color-brand)]">einfa.ch</span>
                        </p>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
