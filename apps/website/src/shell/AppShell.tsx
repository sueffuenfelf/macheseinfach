import { useEffect, type ReactNode } from 'react';
import { AppMobileAreaDock, AppMobileChrome } from './AppMobileChrome';
import { AppSideNav } from './AppSideNav';

type AppShellProps = {
    children: ReactNode;
    /** Tool / flow workspaces fill viewport height without outer scroll */
    contentFill?: boolean;
};

export function AppShell({ children, contentFill = false }: AppShellProps) {
    useEffect(() => {
        document.documentElement.dataset.shell = 'app';
        return () => {
            delete document.documentElement.dataset.shell;
        };
    }, []);

    return (
        <div
            className="ms-app-shell flex h-dvh min-h-0 overflow-hidden bg-[var(--color-canvas)] text-[var(--color-ink)]"
            data-shell="app"
        >
            <aside
                className="hidden w-[240px] shrink-0 border-r-2 border-black md:flex md:flex-col"
                data-testid="app-sidenav-desktop"
            >
                <AppSideNav />
            </aside>

            <div className="ms-shell-main relative flex min-h-0 min-w-0 flex-1 flex-col">
                <AppMobileChrome />

                <main
                    className={`ms-app-main min-h-0 flex-1 ${
                        contentFill
                            ? 'flex flex-col overflow-hidden'
                            : 'overflow-y-auto overflow-x-hidden'
                    }`}
                >
                    {children}
                </main>

                <AppMobileAreaDock />
            </div>
        </div>
    );
}
