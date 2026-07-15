import { useMemo, useState } from 'react';
import type { WidgetComponentProps } from '../../../shell/widgets/types';
import type { ToolCatalogInput, ToolWidgetInput } from '../../types';
import { WidgetCard } from './WidgetCard';

type FileTaskWidgetOptions = {
    widgetId: string;
    title?: string;
    description?: string;
    tags?: string[];
    acceptLabel?: string;
    emptyHint?: string;
    footerHint?: string;
    openLabel?: string;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
    defaultW?: number;
    defaultH?: number;
};

type FileTaskWidgetProps = WidgetComponentProps & {
    title: string;
    emptyHint: string;
    footerHint: string;
    openLabel: string;
    acceptLabel: string;
};

function formatBytes(bytes: number): string {
    if (bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** exp;
    return `${value.toFixed(value >= 10 || exp === 0 ? 0 : 1)} ${units[exp]}`;
}

function FileTaskWidget({
    embedded,
    openTool,
    onEmitLinkValue,
    title,
    emptyHint,
    footerHint,
    openLabel,
    acceptLabel,
}: FileTaskWidgetProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [status, setStatus] = useState('');

    const summary = useMemo(() => {
        if (files.length === 0) return { names: '', totalBytes: 0 };
        return {
            names: files.map((file) => file.name).join(', '),
            totalBytes: files.reduce((sum, file) => sum + file.size, 0),
        };
    }, [files]);

    function applyFiles(nextFiles: File[]) {
        setFiles(nextFiles);
        const nextStatus = nextFiles.length > 0 ? `${nextFiles.length} Datei(en) bereit` : '';
        setStatus(nextStatus);
        onEmitLinkValue?.('fileName', nextFiles.map((file) => file.name).join('\n'));
        onEmitLinkValue?.('status', nextStatus);
    }

    return (
        <WidgetCard title={title} embedded={embedded}>
            <div className="widget-file-task">
                <div className="widget-file-task__rows">
                    <label className="widget-file-task__row widget-file-task__row--drop">
                        <input
                            type="file"
                            className="ms-sr-only"
                            multiple
                            onChange={(event) => applyFiles(Array.from(event.target.files ?? []))}
                        />
                        <span className="widget-file-task__drop-title">Dateien ablegen oder klicken</span>
                        <span className="widget-file-task__drop-sub">{acceptLabel}</span>
                    </label>
                    <div className="widget-file-task__row widget-file-task__row--meta" aria-live="polite">
                        {files.length === 0 ? (
                            <p className="widget-file-task__hint">{emptyHint}</p>
                        ) : (
                            <div className="widget-file-task__meta">
                                <p className="widget-file-task__meta-main">{files.length} Datei(en)</p>
                                <p className="widget-file-task__meta-sub">{formatBytes(summary.totalBytes)}</p>
                                <p className="widget-file-task__meta-list">{summary.names}</p>
                            </div>
                        )}
                    </div>
                    <div className="widget-file-task__row widget-file-task__row--actions">
                        <button type="button" className="ms-btn widget-file-task__open" onClick={openTool}>
                            {openLabel}
                        </button>
                        <p className="widget-file-task__footer">{files.length > 0 ? status : footerHint}</p>
                    </div>
                </div>
            </div>
        </WidgetCard>
    );
}

export function createFileTaskWidget(catalog: ToolCatalogInput, options: FileTaskWidgetOptions): ToolWidgetInput {
    const title = options.title ?? catalog.shortTitle;
    return {
        id: options.widgetId,
        title,
        description: options.description ?? catalog.sub,
        tags: options.tags ?? [...catalog.tags],
        component: (props) => (
            <FileTaskWidget
                {...props}
                title={title}
                emptyHint={options.emptyHint ?? 'Noch keine Datei gewählt.'}
                footerHint={options.footerHint ?? 'Datei bleibt lokal auf deinem Gerät.'}
                openLabel={options.openLabel ?? 'Tool öffnen'}
                acceptLabel={options.acceptLabel ?? 'Lokale Verarbeitung'}
            />
        ),
        outputPorts: [
            { id: 'fileName', label: 'Dateiname' },
            { id: 'status', label: 'Status' },
        ],
        minW: options.minW ?? 4,
        maxW: options.maxW ?? 8,
        minH: options.minH ?? 3,
        maxH: options.maxH ?? 8,
        defaultW: options.defaultW ?? 5,
        defaultH: options.defaultH ?? 4,
    };
}
