import { useObjectUrl } from './useObjectUrl';
import type { WorkbenchFile } from './ImageDropStage';

type ImageThumbRailProps = {
    files: WorkbenchFile[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onAddClick: () => void;
    working?: boolean;
};

export function ImageThumbRail({
    files,
    selectedId,
    onSelect,
    onAddClick,
    working = false,
}: ImageThumbRailProps) {
    return (
        <aside
            className="flex shrink-0 flex-row gap-2 overflow-x-auto border-b-2 border-black bg-white p-2 md:h-full md:w-[5.75rem] md:flex-col md:overflow-x-hidden md:overflow-y-auto md:border-r-2 md:border-b-0"
            aria-label="Ausgewählte Bilder"
        >
            <ul className="flex flex-row gap-2 md:flex-col mx-auto" role="list">
                {files.map((entry) => (
                    <li key={entry.id}>
                        <Thumb
                            file={entry.file}
                            selected={entry.id === selectedId}
                            onClick={() => onSelect(entry.id)}
                        />
                    </li>
                ))}
            </ul>
            <button
                type="button"
                className="ms-focus mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] border-2 border-dashed border-black font-display text-[22px] font-bold leading-none"
                aria-label="Bilder hinzufügen"
                disabled={working}
                onClick={onAddClick}
            >
                +
            </button>
        </aside>
    );
}

function Thumb({
    file,
    selected,
    onClick,
}: {
    file: File;
    selected: boolean;
    onClick: () => void;
}) {
    const url = useObjectUrl(file);
    return (
        <button
            type="button"
            onClick={onClick}
            className="ms-focus block h-14 w-14 overflow-hidden rounded-[8px] border-2 border-black bg-[var(--color-chip)]"
            aria-current={selected ? 'true' : undefined}
            aria-label={file.name}
            {...(selected ? { 'data-active': true } : {})}
            style={
                selected
                    ? { boxShadow: '3px 3px 0 #000', transform: 'translate(-1px, -1px)' }
                    : undefined
            }
        >
            {url ? (
                <img src={url} alt="" className="h-full w-full object-cover" />
            ) : (
                <span className="block p-1 text-left font-display text-[9px] leading-tight">
                    {file.name.slice(0, 8)}
                </span>
            )}
        </button>
    );
}
