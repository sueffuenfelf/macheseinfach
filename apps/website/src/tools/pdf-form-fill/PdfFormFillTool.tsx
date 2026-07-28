import { useEffect, useRef, useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useToast } from '../../shell/toast';
import { StateHint } from '../_shared/_shared';
import {
    exportFilledPdf,
    loadPdfFormFields,
    type FormFieldDescriptor,
} from '../_shared/pdf/form-fill';
import { downloadPdfBytes, swapBaseFilename } from '../_shared/pdf/io';

type PdfFormFillToolProps = {
    tool: Tool;
};

export function PdfFormFillTool({ tool }: PdfFormFillToolProps) {
    const [file, setFile] = useState<File | null>(null);
    const [fields, setFields] = useState<FormFieldDescriptor[]>([]);
    const [values, setValues] = useState<Record<string, string | boolean>>({});
    const [flatten, setFlatten] = useState(true);
    const [loading, setLoading] = useState(false);
    const [working, setWorking] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!file) return;
        setLoading(true);
        void loadPdfFormFields(file)
            .then((nextFields) => {
                setFields(nextFields);
                const initial: Record<string, string | boolean> = {};
                for (const field of nextFields) {
                    if (field.value !== undefined) {
                        initial[field.name] = field.value;
                    } else if (field.kind === 'checkbox') {
                        initial[field.name] = false;
                    } else {
                        initial[field.name] = '';
                    }
                }
                setValues(initial);
            })
            .catch(() => {
                toast({ message: 'PDF konnte nicht gelesen werden.', variant: 'error' });
                setFields([]);
            })
            .finally(() => setLoading(false));
    }, [file, toast]);

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((files) => {
        const next = Array.from(files).find(
            (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
        );
        if (next) acceptFile(next);
    });

    function acceptFile(next: File) {
        setFile(next);
        setFields([]);
        setValues({});
    }

    function updateValue(name: string, value: string | boolean) {
        setValues((prev) => ({ ...prev, [name]: value }));
    }

    async function downloadFilled() {
        if (!file || working) return;
        setWorking(true);
        try {
            const bytes = await exportFilledPdf(file, values, flatten);
            downloadPdfBytes(bytes, swapBaseFilename(file.name, '-ausgefuellt'));
            toast({ message: 'Ausgefülltes PDF heruntergeladen', variant: 'success' });
        } catch {
            toast({ message: 'PDF konnte nicht gespeichert werden.', variant: 'error' });
        } finally {
            setWorking(false);
        }
    }

    const editableFields = fields.filter((field) => field.kind !== 'other');
    const hasFields = editableFields.length > 0;

    return (
        <div
            className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6"
            aria-busy={loading || working}
        >
            {!file ? (
                <section
                    className="ms-dropzone cursor-pointer rounded-xl p-8 text-center"
                    data-drag={dragOver}
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
                        Formular-PDF laden
                    </p>
                    <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                        Behörden- und Antrags-PDFs mit ausfüllbaren Feldern — lokal im Browser
                        bearbeiten.
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
            ) : loading ? (
                <p className="text-center text-[14px] font-semibold">
                    Formularfelder werden gelesen …
                </p>
            ) : !hasFields ? (
                <section className="rounded-xl border-2 border-black bg-[var(--color-warn)] p-6 shadow-brutal-lg">
                    <p className="font-display text-[18px] font-bold">Keine ausfüllbaren Felder</p>
                    <p className="mt-2 text-[14px]">
                        Diese PDF enthält keine AcroForm-Felder. Oft ist es nur ein Scan oder
                        Bild-PDF — dann kann man hier nichts ausfüllen.
                    </p>
                    <button
                        type="button"
                        className="ms-btn mt-4"
                        onClick={() => {
                            setFile(null);
                            setFields([]);
                        }}
                    >
                        Andere PDF wählen
                    </button>
                </section>
            ) : (
                <>
                    <div className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
                        <div>
                            <p className="font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                                {file.name}
                            </p>
                            <p className="text-[12px] text-[var(--color-ink-soft)]">
                                {editableFields.length} Felder erkannt
                            </p>
                        </div>
                        <button
                            type="button"
                            className="ms-btn"
                            onClick={() => {
                                setFile(null);
                                setFields([]);
                            }}
                        >
                            Wechseln
                        </button>
                    </div>

                    <section className="space-y-3 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm">
                        {editableFields.map((field) => (
                            <div key={field.name}>
                                <label
                                    htmlFor={`${tool.id}-${field.name}`}
                                    className="font-display text-[11px] font-bold uppercase tracking-[0.05em]"
                                >
                                    {field.name}
                                </label>
                                {field.kind === 'text' ? (
                                    <input
                                        id={`${tool.id}-${field.name}`}
                                        type="text"
                                        value={String(values[field.name] ?? '')}
                                        onChange={(e) => updateValue(field.name, e.target.value)}
                                        className="mt-1 w-full rounded-md border-2 border-black px-3 py-2"
                                    />
                                ) : null}
                                {field.kind === 'checkbox' ? (
                                    <label className="mt-1 flex items-center gap-2 text-[14px]">
                                        <input
                                            id={`${tool.id}-${field.name}`}
                                            type="checkbox"
                                            checked={Boolean(values[field.name])}
                                            onChange={(e) =>
                                                updateValue(field.name, e.target.checked)
                                            }
                                        />
                                        Aktivieren
                                    </label>
                                ) : null}
                                {field.kind === 'dropdown' || field.kind === 'radio' ? (
                                    <select
                                        id={`${tool.id}-${field.name}`}
                                        value={String(values[field.name] ?? '')}
                                        onChange={(e) => updateValue(field.name, e.target.value)}
                                        className="mt-1 w-full rounded-md border-2 border-black px-3 py-2"
                                    >
                                        <option value="">— wählen —</option>
                                        {(field.options ?? []).map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                ) : null}
                            </div>
                        ))}
                    </section>

                    <label className="flex items-center gap-2 rounded-md border-2 border-black bg-white px-3 py-2 text-[14px]">
                        <input
                            type="checkbox"
                            checked={flatten}
                            onChange={(e) => setFlatten(e.target.checked)}
                        />
                        Felder fixieren (nicht mehr editierbar nach dem Speichern)
                    </label>

                    <button
                        type="button"
                        className="ms-btn-primary w-full"
                        disabled={working}
                        onClick={() => void downloadFilled()}
                    >
                        {working ? 'Speichere …' : 'Ausgefülltes PDF herunterladen'}
                    </button>
                </>
            )}

            <StateHint>
                Nur PDFs mit echten Formularfeldern (AcroForm) können hier ausgefüllt werden.
                Gescannte Formulare ohne Felder brauchen OCR oder ein anderes Format.
            </StateHint>
        </div>
    );
}
