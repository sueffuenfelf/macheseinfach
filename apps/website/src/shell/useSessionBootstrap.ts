import { useCallback, useEffect, useRef, useState } from 'react';
import { SPLASH_DRAW, SPLASH_EXIT_MS } from './splashDraw';

const SESSION_KEY = 'msf.session.splash.v1';

export type SplashPhase = 'idle' | 'loading' | 'exiting';

type BootstrapStep = {
    id: string;
    weight: number;
    run: () => Promise<void>;
};

const BOOTSTRAP_STEPS: BootstrapStep[] = [
    {
        id: 'fonts',
        weight: 0.18,
        run: async () => {
            if (document.fonts?.ready) await document.fonts.ready;
        },
    },
    {
        id: 'catalog',
        weight: 0.22,
        run: async () => {
            await import('../tools/discover');
        },
    },
    {
        id: 'widgets',
        weight: 0.2,
        run: async () => {
            const { listToolWidgets } = await import('./widgets/registry');
            listToolWidgets();
        },
    },
    {
        id: 'workspace',
        weight: 0.15,
        run: async () => {
            await import('./workspaces/model');
        },
    },
    {
        id: 'processing',
        weight: 0.25,
        run: async () => {
            await Promise.all([import('pdf-lib'), import('heic2any')]);
        },
    },
];

export function useSessionBootstrap() {
    const skipRef = useRef(
        typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1',
    );
    const [phase, setPhase] = useState<SplashPhase>(skipRef.current ? 'idle' : 'loading');
    const [bootstrapComplete, setBootstrapComplete] = useState(skipRef.current);
    const [animationComplete, setAnimationComplete] = useState(skipRef.current);

    const markAnimationComplete = useCallback(() => {
        setAnimationComplete(true);
    }, []);

    useEffect(() => {
        if (skipRef.current) return;

        let cancelled = false;

        async function run() {
            for (const step of BOOTSTRAP_STEPS) {
                if (cancelled) return;
                await step.run();
            }
            if (!cancelled) setBootstrapComplete(true);
        }

        void run();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (skipRef.current) return;
        if (!bootstrapComplete || !animationComplete) return;

        setPhase('exiting');
        sessionStorage.setItem(SESSION_KEY, '1');

        const timer = window.setTimeout(() => {
            setPhase('idle');
        }, SPLASH_EXIT_MS);

        return () => window.clearTimeout(timer);
    }, [bootstrapComplete, animationComplete]);

    return {
        phase,
        showSplash: phase === 'loading' || phase === 'exiting',
        markAnimationComplete,
        animationMinMs: SPLASH_DRAW.totalMin,
    };
}
