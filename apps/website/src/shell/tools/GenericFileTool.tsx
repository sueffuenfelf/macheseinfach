import { useMemo, useState } from 'react';
import type { Tool } from '../../data/catalog';
import { copyToClipboard } from '../../lib/format';
import { ProgressBar, ResultCard, StateHint, useToast } from './_shared';

type GenericFileToolProps = {
    tool: Tool;
};

const MOCK_NAMES = ['dokument-a.pdf', 'dokument-b.pdf', 'dokument-c.pdf', 'scan-beleg.png'];
const MOCK_IBAN = 'DE89 3704 0044 0532 0130 00';

function ctaForTool(id: Tool['id']): string {
    switch (id) {
        case 'pdf-merge':
            return 'Zu einer PDF zusammenfügen';
        case 'pdf-sign':
            return 'Unterschrift platzieren';
        case 'ocr-local':
            return 'Text erkennen';
        case 'epc-read':
            return 'IBAN übernehmen';
        default:
            return 'Verarbeiten';
    }
}

function doneMessageForTool(id: Tool['id']): string {
    switch (id) {
        case 'pdf-merge':
            return 'Deine Dateien wurden zu einer PDF zusammengeführt.';
        case 'pdf-sign':
            return 'Die Unterschrift wurde im Dokument platziert.';
        case 'ocr-local':
            return 'Text wurde erfolgreich extrahiert.';
        case 'epc-read':
            return 'IBAN aus Rechnung erfolgreich erkannt.';
        default:
            return 'Vorgang abgeschlossen.';
    }
}

function copyTextForTool(id: Tool['id']): string {
    switch (id) {
        case 'ocr-local':
            return 'Extrahierter OCR-Demo-Text: Kundennummer 1129, Betrag 249,90 EUR.';
        case 'epc-read':
            return MOCK_IBAN;
        default:
            return 'Demo-Ergebnis kopiert.';
    }
}

export function GenericFileTool({ tool }: GenericFileToolProps) {
    const [items, setItems] = useState<string[]>(['unterlagen-01.pdf', 'unterlagen-02.pdf']);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [working, setWorking] = useState(false);
    const [progress, setProgress] = useState(0);
    const [done, setDone] = useState(false);
    const { node, show } = useToast();

    const cta = useMemo(() => ctaForTool(tool.id), [tool.id]);

    function addMockFile() {
        const pick = MOCK_NAMES[items.length % MOCK_NAMES.length];
        setItems((prev) => [...prev, `${Date.now().toString().slice(-4)}-${pick}`]);
        setDone(false);
    }

    function onDropIndex(targetIndex: number) {
        if (dragIndex === null || dragIndex === targetIndex) return;
        setItems((prev) => {
            const next = [...prev];
            const [moved] = next.splice(dragIndex, 1);
            next.splice(targetIndex, 0, moved);
            return next;
        });
        setDragIndex(null);
    }

    function startAction() {
        if (working || items.length === 0) return;
        setWorking(true);
        setProgress(0);
        setDone(false);
        const started = Date.now();
        const timer = window.setInterval(() => {
            const ratio = Math.min(1, (Date.now() - started) / 1200);
            setProgress(ratio);
            if (ratio >= 1) {
                window.clearInterval(timer);
                setWorking(false);
                setDone(true);
            }
        }, 90);
    }

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6" aria-busy={working}>
            <section className="ms-card space-y-3 p-4">
                <div>
                    <p className="font-display text-[20px] font-bold tracking-[-0.02em]">{tool.title}</p>
                    <p className="text-[14px] text-[var(--color-ink-soft)]">{tool.sub}</p>
                </div>
                <div className="ms-stagger space-y-2">
                    {items.map((name, idx) => (
                        <div
                            key={name}
                            className="flex items-center gap-3 rounded-md border-2 border-black bg-white p-2 shadow-brutal-sm"
                            draggable
                            onDragStart={() => setDragIndex(idx)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => onDropIndex(idx)}
                        >
                            <div className="grid h-[38px] w-[30px] place-items-center rounded border-2 border-black bg-white">
                                <div className="h-[18px] w-[12px] rounded-sm border-2 border-black bg-[var(--color-chip)]" />
                            </div>
                            <p className="flex-1 text-[14px]">{name}</p>
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#000" strokeWidth="2.2">
                                <path d="M7 7h10M7 12h10M7 17h10" />
                            </svg>
                        </div>
                    ))}
                </div>
                <button type="button" className="ms-btn" onClick={addMockFile}>
                    Datei hinzufügen
                </button>
            </section>

            {working ? <ProgressBar value={progress} max={1} /> : null}

            <button type="button" className="ms-btn-primary w-full" disabled={working || items.length === 0} onClick={startAction}>
                {cta}
            </button>

            {done ? (
                <ResultCard tone="success" heading="Erfolgreich verarbeitet">
                    <p className="text-[14px]">{doneMessageForTool(tool.id)}</p>
                    {tool.id === 'epc-read' ? (
                        <div className="rounded-md border-2 border-black bg-white p-3">
                            <p className="font-display text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-soft)]">Gefundene IBAN</p>
                            <p className="mt-1 font-mono text-[16px]">{MOCK_IBAN}</p>
                        </div>
                    ) : null}
                    <button
                        type="button"
                        className="ms-btn-primary"
                        onClick={async () => {
                            const ok = await copyToClipboard(copyTextForTool(tool.id));
                            show(ok ? 'In Zwischenablage kopiert.' : 'Kopieren war leider nicht möglich.');
                        }}
                    >
                        Kopieren
                    </button>
                </ResultCard>
            ) : null}

            <StateHint>Reihenfolge per Drag-and-Drop anpassen.</StateHint>
            {node}
        </div>
    );
}
