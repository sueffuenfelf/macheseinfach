import { useMemo, useState } from 'react';
import type { WidgetComponentProps } from '../../../shell/widgets/types';
import { WidgetCard } from '../../_shared/widgets/WidgetCard';

function readFileText(file: File): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => resolve('');
        reader.readAsText(file);
    });
}

export function PrimitiveFileDropWidget({ embedded, onEmitLinkValue }: WidgetComponentProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [status, setStatus] = useState('');

    const names = useMemo(() => files.map((file) => file.name), [files]);

    async function applyFiles(nextFiles: File[]) {
        setFiles(nextFiles);
        const nextStatus = nextFiles.length > 0 ? `${nextFiles.length} Datei(en) abgelegt` : '';
        setStatus(nextStatus);
        onEmitLinkValue?.('fileName', nextFiles.map((file) => file.name).join('\n'));
        onEmitLinkValue?.('status', nextStatus);
        if (nextFiles.length > 0) {
            const text = await readFileText(nextFiles[0]!);
            onEmitLinkValue?.('fileText', text.slice(0, 2000));
        } else {
            onEmitLinkValue?.('fileText', '');
        }
    }

    return (
        <WidgetCard title="Dateiablage" embedded={embedded}>
            <div className="widget-primitive-file">
                <div className="widget-primitive-file__rows">
                    <label className="widget-primitive-file__row widget-primitive-file__row--drop">
                        <input
                            type="file"
                            multiple
                            className="ms-sr-only"
                            onChange={(event) => void applyFiles(Array.from(event.target.files ?? []))}
                        />
                        <span className="widget-primitive-file__title">Dateien hier fallen lassen</span>
                        <span className="widget-primitive-file__sub">Textdateien werden als Port bereitgestellt.</span>
                    </label>
                    <div className="widget-primitive-file__row widget-primitive-file__row--meta" aria-live="polite">
                        {files.length === 0 ? (
                            <p className="widget-primitive-file__meta">Noch keine Datei ausgewählt.</p>
                        ) : (
                            <p className="widget-primitive-file__meta">{names.join(', ')}</p>
                        )}
                    </div>
                    <div className="widget-primitive-file__row widget-primitive-file__row--status">
                        <p className="widget-primitive-file__status">{status || 'Bereit für Verknüpfungen.'}</p>
                    </div>
                </div>
            </div>
        </WidgetCard>
    );
}
