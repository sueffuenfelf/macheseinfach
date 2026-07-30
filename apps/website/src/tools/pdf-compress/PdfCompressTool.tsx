import { useEffect, useMemo, useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { FlowBoundChip } from '../../flow/FlowBoundChip';
import { useFlowSession } from '../../flow/FlowWorkspace';
import { decodeFile } from '../../flow/slot-codec';
import { useFlowInput } from '../../flow/useFlowInput';
import { useFileDrop } from '../../hooks/useFileDrop';
import { formatBytes } from '../../lib/format';
import { useToast } from '../../shell/toast';
import { InfoGrid, ProgressBar, ResultCard, StateHint } from '../_shared/_shared';
import {
    compressPdfToTarget,
    DEFAULT_COMPRESS_SETTINGS,
    ELSTER_TARGET_BYTES,
    findCompressSettingsForTarget,
    previewCompressSize,
    type CompressResult,
    type CompressStatus,
} from '../_shared/pdf/compress';
import { downloadPdfBytes, swapBaseFilename } from '../_shared/pdf/io';

type PdfCompressToolProps = {
    tool: Tool;
};

type SizePreset = 'elster' | '1mb' | '5mb' | 'custom';

const PRESET_BYTES: Record<Exclude<SizePreset, 'custom'>, number> = {
    elster: ELSTER_TARGET_BYTES,
    '1mb': 1024 * 1024,
    '5mb': 5 * 1024 * 1024,
};

function qualityToSlider(quality: number): number {
    return Math.round(quality * 100);
}

function sliderToQuality(value: number): number {
    return Math.max(0.35, Math.min(1, value / 100));
}

function scaleToSlider(scale: number): number {
    return Math.round(scale * 100);
}

function sliderToScale(value: number): number {
    return Math.max(0.45, Math.min(1, value / 100));
}

function statusLabel(status: CompressStatus, targetBytes: number): string {
    switch (status) {
        case 'under_limit':
            return `Unter Ziel (${formatBytes(targetBytes)})`;
        case 'over_limit':
            return `Noch über Ziel (${formatBytes(targetBytes)})`;
        case 'limit_unreachable':
            return `Ziel nicht erreichbar — kleinstmögliche Größe`;
    }
}

export function PdfCompressTool({ tool }: PdfCompressToolProps) {
    const fileInput = useFlowInput(tool.id, 'file', decodeFile);
    const flowSession = useFlowSession();
    const [file, setFile] = useState<File | null>(null);
    const [preset, setPreset] = useState<SizePreset>('elster');
    const [customTargetMb, setCustomTargetMb] = useState('2');
    const [quality, setQuality] = useState(qualityToSlider(DEFAULT_COMPRESS_SETTINGS.quality));
    const [downscale, setDownscale] = useState(scaleToSlider(DEFAULT_COMPRESS_SETTINGS.scale));
    const [previewSize, setPreviewSize] = useState<number | null>(null);
    const [previewing, setPreviewing] = useState(false);
    const [fitting, setFitting] = useState(false);
    const [working, setWorking] = useState(false);
    const [result, setResult] = useState<CompressResult | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const previewTimer = useRef<number | null>(null);
    const fitTimer = useRef<number | null>(null);
    const fitGeneration = useRef(0);
    const settingsFromFit = useRef(false);
    const { toast } = useToast();

    const targetBytes = useMemo(() => {
        if (preset === 'custom') {
            const mb = Number.parseFloat(customTargetMb.replace(',', '.'));
            if (!Number.isFinite(mb) || mb <= 0) return ELSTER_TARGET_BYTES;
            return Math.round(mb * 1024 * 1024);
        }
        return PRESET_BYTES[preset];
    }, [customTargetMb, preset]);

    const settings = useMemo(
        () => ({
            quality: sliderToQuality(quality),
            scale: sliderToScale(downscale),
        }),
        [downscale, quality],
    );

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        const next = Array.from(files).find(
            (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
        );
        if (!next) {
            toast({ message: 'Bitte eine PDF-Datei wählen.', variant: 'error' });
            return;
        }
        acceptFile(next);
    });

    function acceptFile(next: File) {
        setFile(next);
        setResult(null);
        setPreviewSize(null);
        if (fileInput.source === 'local') fileInput.setValue(next);
    }

    useEffect(() => {
        if (fileInput.source !== 'flow') return;
        setFile(fileInput.value);
        setResult(null);
        setPreviewSize(null);
    }, [fileInput.source === 'flow' ? fileInput.value : null, fileInput.source]);

    useEffect(() => {
        if (!file) return;
        if (fitTimer.current) window.clearTimeout(fitTimer.current);

        fitTimer.current = window.setTimeout(() => {
            const generation = ++fitGeneration.current;
            setFitting(true);
            setResult(null);
            void findCompressSettingsForTarget(file, targetBytes, DEFAULT_COMPRESS_SETTINGS)
                .then((fit) => {
                    if (generation !== fitGeneration.current) return;
                    settingsFromFit.current = true;
                    setQuality(qualityToSlider(fit.settings.quality));
                    setDownscale(scaleToSlider(fit.settings.scale));
                    setPreviewSize(fit.compressedSize);
                })
                .catch(() => {
                    if (generation !== fitGeneration.current) return;
                    setPreviewSize(null);
                })
                .finally(() => {
                    if (generation === fitGeneration.current) setFitting(false);
                });
        }, preset === 'custom' ? 450 : 0);

        return () => {
            if (fitTimer.current) window.clearTimeout(fitTimer.current);
        };
    }, [file, preset, targetBytes]);

    useEffect(() => {
        if (!file) return;
        if (settingsFromFit.current) {
            settingsFromFit.current = false;
            return;
        }
        if (previewTimer.current) window.clearTimeout(previewTimer.current);

        previewTimer.current = window.setTimeout(() => {
            setPreviewing(true);
            void previewCompressSize(file, settings)
                .then((size) => setPreviewSize(size))
                .catch(() => setPreviewSize(null))
                .finally(() => setPreviewing(false));
        }, 350);

        return () => {
            if (previewTimer.current) window.clearTimeout(previewTimer.current);
        };
    }, [file, settings]);

    const previewStatus: CompressStatus | null = useMemo(() => {
        if (previewSize === null) return null;
        if (previewSize <= targetBytes) return 'under_limit';
        if (quality <= 35 && downscale <= 45) return 'limit_unreachable';
        return 'over_limit';
    }, [downscale, previewSize, quality, targetBytes]);

    async function compressForDownload() {
        if (!file || working) return;
        setWorking(true);
        try {
            const compressed = await compressPdfToTarget(file, {
                ...settings,
                targetBytes,
                autoFit: true,
            });
            setResult(compressed);
            setPreviewSize(compressed.compressedSize);
            flowSession?.reportToolSuccess(tool.id);
            toast({
                message:
                    compressed.status === 'under_limit'
                        ? 'PDF komprimiert — unter dem Ziel'
                        : 'PDF komprimiert — prüfe die Größe',
                variant: compressed.status === 'under_limit' ? 'success' : 'info',
            });
        } catch {
            toast({ message: 'PDF konnte nicht komprimiert werden.', variant: 'error' });
        } finally {
            setWorking(false);
        }
    }

    function download() {
        if (!file || !result) return;
        downloadPdfBytes(result.bytes, swapBaseFilename(file.name, '-komprimiert'));
        toast({ message: 'Download gestartet', variant: 'success' });
    }

    return (
        <div
            className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6"
            aria-busy={working || previewing || fitting}
        >
            {fileInput.source === 'flow' ? (
                <FlowBoundChip label={fileInput.value.name} onEdit={fileInput.editInFlow} />
            ) : null}
            {!file && fileInput.source !== 'flow' ? (
                <section
                    className="ms-dropzone cursor-pointer rounded-xl p-8 text-center"
                    data-drag={dragOver}
                    data-flow-source="local"
                    data-testid="pdf-compress-dropzone"
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            inputRef.current?.click();
                        }
                    }}
                >
                    <p className="font-display text-[20px] font-bold tracking-[-0.02em]">
                        PDF hierher ziehen oder auswählen
                    </p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                        Für Elster, Finanzamt und andere Portal-Uploads — Zielgröße festlegen,
                        Vorschau prüfen, herunterladen.
                    </p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="ms-sr-only"
                        onChange={(e) => {
                            const next = e.target.files?.[0];
                            if (next) acceptFile(next);
                        }}
                    />
                </section>
            ) : (
                <>
                    <div className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
                        <div>
                            <p className="font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                                Geladene Datei
                            </p>
                            <p className="text-[14px]">{file.name}</p>
                            <p className="text-[12px] text-[var(--color-ink-soft)]">
                                Original: {formatBytes(file.size)}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="ms-btn"
                            onClick={() => {
                                if (fileInput.source === 'flow') {
                                    fileInput.editInFlow();
                                    return;
                                }
                                setFile(null);
                                setResult(null);
                                setPreviewSize(null);
                                if (fileInput.source === 'local') fileInput.setValue(null);
                            }}
                        >
                            Wechseln
                        </button>
                    </div>

                    <section
                        className={`rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm space-y-4 transition-opacity duration-200 ${fitting ? 'opacity-75' : ''}`}
                        aria-busy={fitting}
                    >
                        {fitting ? (
                            <div
                                className="rounded-lg border-2 border-black bg-[var(--color-info)] px-3 py-3 shadow-brutal-sm"
                                role="status"
                                aria-live="polite"
                            >
                                <p className="font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                                    Berechne Einstellungen …
                                </p>
                                <p className="mt-1 text-[13px] leading-snug">
                                    Qualität und Auflösung werden im Hintergrund an dein Limit
                                    angepasst. Die Regler sind kurz gesperrt.
                                </p>
                                <div
                                    className="mt-3 h-2 overflow-hidden rounded-full border-2 border-black bg-white"
                                    aria-hidden="true"
                                >
                                    <div className="ms-progress-stripes h-full w-full" />
                                </div>
                            </div>
                        ) : null}

                        <div className={fitting ? 'pointer-events-none' : undefined}>
                            <p className="font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                                Zielgröße
                            </p>
                            <p className="mt-1 text-[13px] text-[var(--color-ink-soft)]">
                                Elster akzeptiert meist maximal 2 MB pro Anhang. Wir versuchen,
                                unter dein Limit zu kommen.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {(
                                    [
                                        ['elster', 'Elster 2 MB'],
                                        ['1mb', '1 MB'],
                                        ['5mb', '5 MB'],
                                        ['custom', 'Eigene Größe'],
                                    ] as const
                                ).map(([id, label]) => (
                                    <button
                                        key={id}
                                        type="button"
                                        disabled={fitting}
                                        className={`ms-btn text-[12px] disabled:cursor-not-allowed disabled:opacity-50 ${preset === id ? 'ring-2 ring-black' : ''}`}
                                        onClick={() => {
                                            setPreset(id);
                                            setResult(null);
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {preset === 'custom' ? (
                                <label className="mt-3 block">
                                    <span className="font-display text-[11px] font-bold uppercase tracking-[0.05em]">
                                        Limit in MB
                                    </span>
                                    <input
                                        type="number"
                                        min={0.1}
                                        step={0.1}
                                        disabled={fitting}
                                        value={customTargetMb}
                                        onChange={(e) => {
                                            setCustomTargetMb(e.target.value);
                                            setResult(null);
                                        }}
                                        className="mt-1 w-full rounded-md border-2 border-black px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </label>
                            ) : null}
                        </div>

                        <div className={fitting ? 'space-y-4 pointer-events-none opacity-60' : 'space-y-4'}>
                        <div>
                            <label
                                htmlFor={`${tool.id}-quality`}
                                className="mb-2 block font-display text-[12px] font-bold uppercase tracking-[0.05em]"
                            >
                                Bildqualität ({fitting ? '…' : `${quality}%`})
                            </label>
                            <input
                                id={`${tool.id}-quality`}
                                type="range"
                                min={35}
                                max={100}
                                disabled={fitting}
                                value={quality}
                                onChange={(e) => {
                                    setQuality(Number(e.target.value));
                                    setResult(null);
                                }}
                                className="w-full disabled:cursor-not-allowed"
                                style={{ accentColor: '#000' }}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor={`${tool.id}-downscale`}
                                className="mb-2 block font-display text-[12px] font-bold uppercase tracking-[0.05em]"
                            >
                                Bild-Auflösung ({fitting ? '…' : `${downscale}%`})
                            </label>
                            <input
                                id={`${tool.id}-downscale`}
                                type="range"
                                min={45}
                                max={100}
                                disabled={fitting}
                                value={downscale}
                                onChange={(e) => {
                                    setDownscale(Number(e.target.value));
                                    setResult(null);
                                }}
                                className="w-full disabled:cursor-not-allowed"
                                style={{ accentColor: '#000' }}
                            />
                        </div>
                        </div>
                    </section>

                    <ResultCard
                        tone={fitting ? 'info' : previewStatus === 'under_limit' ? 'success' : 'warn'}
                        heading="Größenvorschau"
                    >
                        {fitting ? (
                            <p className="text-[13px] font-semibold">
                                Warte auf die berechneten Einstellungen …
                            </p>
                        ) : null}
                        <InfoGrid
                            items={[
                                {
                                    label: 'Ziel',
                                    value: formatBytes(targetBytes),
                                },
                                {
                                    label: previewing ? 'Aktualisiere Vorschau …' : 'Erwartete Größe',
                                    value:
                                        fitting || previewSize === null
                                            ? '—'
                                            : formatBytes(previewSize),
                                },
                            ]}
                        />
                        {!fitting && previewSize !== null && file ? (
                            <ProgressBar
                                value={Math.min(previewSize, targetBytes * 1.5)}
                                max={targetBytes * 1.5}
                            />
                        ) : null}
                        {!fitting && previewStatus ? (
                            <p className="text-[13px] font-semibold">
                                {statusLabel(previewStatus, targetBytes)}
                            </p>
                        ) : null}
                    </ResultCard>

                    <button
                        type="button"
                        className="ms-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={working || fitting}
                        onClick={() => void compressForDownload()}
                    >
                        {working
                            ? 'Optimiere …'
                            : fitting
                              ? 'Berechne Einstellungen …'
                              : 'Unter Ziel komprimieren & herunterladen'}
                    </button>

                    {result ? (
                        <ResultCard
                            tone={
                                result.status === 'under_limit'
                                    ? 'success'
                                    : result.status === 'limit_unreachable'
                                      ? 'danger'
                                      : 'warn'
                            }
                            heading="Ergebnis"
                        >
                            <InfoGrid
                                items={[
                                    { label: 'Original', value: formatBytes(result.originalSize) },
                                    {
                                        label: 'Komprimiert',
                                        value: formatBytes(result.compressedSize),
                                    },
                                    {
                                        label: 'Einstellungen',
                                        value: `${Math.round(result.settings.quality * 100)}% Qualität · ${Math.round(result.settings.scale * 100)}% Auflösung`,
                                    },
                                ]}
                            />
                            <p className="text-[13px] font-semibold">
                                {statusLabel(result.status, targetBytes)}
                            </p>
                            <button
                                type="button"
                                className="ms-btn-primary w-full"
                                onClick={download}
                            >
                                Verkleinertes PDF herunterladen
                            </button>
                        </ResultCard>
                    ) : null}
                </>
            )}
            <StateHint>
                Beim Wechsel der Zielgröße passen wir Qualität und Auflösung automatisch an. Du
                kannst die Regler danach noch feinjustieren.
            </StateHint>
        </div>
    );
}
