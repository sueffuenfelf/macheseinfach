import type { ReactNode } from 'react';

type WidgetCardProps = {
    title: string;
    children: ReactNode;
    embedded?: boolean;
};

export function WidgetCard({ title, children, embedded }: WidgetCardProps) {
    if (embedded) {
        return <div className="widget-tile">{children}</div>;
    }

    return (
        <section className="flex h-full min-h-0 flex-col rounded-[10px] border-2 border-black bg-white">
            <header className="border-b-2 border-black px-3 py-2">
                <h3 className="font-display text-[13px] font-bold">{title}</h3>
            </header>
            <div className="widget-tile min-h-0 flex-1">{children}</div>
        </section>
    );
}
