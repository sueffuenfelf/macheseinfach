import { useEffect, useState, type ReactNode } from 'react';
import { AppSideNav } from './AppSideNav';
import { useDismissLayer } from './useDismissLayer';

type AppShellProps = {
    children: ReactNode;
    /** Tool / flow workspaces fill viewport height without outer scroll */
    contentFill?: boolean;
};

export function AppShell({ children, contentFill = false }: AppShellProps) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useDismissLayer(mobileNavOpen, () => setMobileNavOpen(false));

    useEffect(() => {
        document.documentElement.dataset.shell = 'app';
        return () => {
            delete document.documentElement.dataset.shell;
        };
    }, []);

    useEffect(() => {
        if (!mobileNavOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [mobileNavOpen]);

    return (
        <div
            className="ms-app-shell flex h-dvh min-h-0 overflow-hidden bg-[var(--color-canvas)] text-[var(--color-ink)]"
            data-shell="app"
        >
            {/* Desktop sidenav */}
            <aside
                className="hidden w-[240px] shrink-0 border-r-2 border-black md:flex md:flex-col"
                data-testid="app-sidenav-desktop"
            >
                <AppSideNav />
            </aside>

            {/* Mobile drawer */}
            {mobileNavOpen ? (
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-black/40 md:hidden"
                    aria-label="Navigation schließen"
                    onClick={() => setMobileNavOpen(false)}
                />
            ) : null}
            <aside
                className={`fixed top-0 left-0 z-50 flex h-dvh w-[min(100%,280px)] flex-col border-r-2 border-black bg-white shadow-brutal-lg transition-transform duration-200 md:hidden ${
                    mobileNavOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
                }`}
                data-testid="app-sidenav-mobile"
                aria-hidden={!mobileNavOpen}
            >
                <AppSideNav onNavigate={() => setMobileNavOpen(false)} />
            </aside>

            {/* Main column */}
            <div className="ms-shell-main relative flex min-h-0 min-w-0 flex-1 flex-col">
                <button
                    type="button"
                    className="ms-focus fixed top-3 left-3 z-30 inline-flex h-8 w-8 items-center justify-center rounded-[6px] border-2 border-black bg-white shadow-[1px_1px_0_#000] md:hidden"
                    aria-label="Menü öffnen"
                    aria-expanded={mobileNavOpen}
                    onClick={() => setMobileNavOpen((v) => !v)}
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        aria-hidden
                    >
                        <path d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                </button>

                <main
                    className={`ms-app-main min-h-0 flex-1 ${
                        contentFill
                            ? 'flex flex-col overflow-hidden'
                            : 'overflow-y-auto overflow-x-hidden'
                    }`}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
