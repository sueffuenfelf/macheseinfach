import { useMemo, useState } from 'react';
import type { Tool } from '../../data/catalog';
import { usePlatform } from '../../context/PlatformContext';
import { StateHint } from './_shared';

type PdfRedactToolProps = {
    tool: Tool;
};

const MOCK_LINES = [
    'Rechnung 2026-1142 · Kundendaten',
    'Name: Erika Mustermann',
    'Adresse: Musterstraße 14, 20457 Hamburg',
    'Steuer-ID: 12/345/67890',
    'IBAN: DE89 3704 0044 0532 0130 00',
    'Positionen und Beträge',
    'Gesamtsumme: 1.420,00 EUR',
    'Anhang: Gehaltsnachweis',
];

export function PdfRedactTool({ tool }: PdfRedactToolProps) {
    const { file } = usePlatform();
    const [redacted, setRedacted] = useState<number[]>([]);

    const nextLineIndex = useMemo(() => {
        for (let i = 0; i < MOCK_LINES.length; i++) {
            if (!redacted.includes(i)) return i;
        }
        return -1;
    }, [redacted]);

    function toggleLine(index: number) {
        setRedacted((prev) => (prev.includes(index) ? prev.filter((v) => v !== index) : [...prev, index]));
    }

    return (
        <div className="ms-animate-fade mx-auto grid w-full max-w-3xl gap-5 px-4 py-6 md:grid-cols-[1.2fr_0.8fr] md:px-6">
            <section className="rounded-xl border-2 border-black bg-white p-4 shadow-brutal-lg md:p-5">
                <h3 className="font-display text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-soft)]">{tool.title}</h3>
                <p className="mt-1 text-[14px] font-semibold">{file?.name ?? 'beispiel-dokument.pdf'}</p>
                <div className="mt-4 space-y-2">
                    {MOCK_LINES.map((line, index) => {
                        const active = redacted.includes(index);
                        return (
                            <button
                                type="button"
                                key={line}
                                onClick={() => toggleLine(index)}
                                className="ms-focus block w-full rounded-[4px] text-left"
                                aria-pressed={active}
                                aria-label={`Zeile ${index + 1} schwärzen`}
                            >
                                <div
                                    className="h-[12px] rounded-[3px] transition-colors"
                                    style={{
                                        background: active ? '#000' : 'var(--color-line)',
                                        width: `${Math.max(45, 92 - index * 6)}%`,
                                    }}
                                />
                                <span className="ms-sr-only">{line}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <aside className="rounded-xl border-2 border-black bg-[#ffd0f0] p-4 shadow-brutal-lg md:p-5">
                <p className="font-display text-[18px] font-bold tracking-[-0.02em]">Werkzeug</p>
                <div className="mt-3 space-y-2">
                    <button
                        type="button"
                        className="ms-btn-primary w-full"
                        disabled={nextLineIndex === -1}
                        onClick={() => {
                            if (nextLineIndex > -1) toggleLine(nextLineIndex);
                        }}
                    >
                        Bereich schwärzen
                    </button>
                    <button
                        type="button"
                        className="ms-btn w-full"
                        disabled={redacted.length === 0}
                        onClick={() => setRedacted((prev) => prev.slice(0, -1))}
                    >
                        Rückgängig
                    </button>
                </div>
                <p className="mt-4 rounded-md border-2 border-black bg-white px-3 py-2 text-[14px] font-semibold">
                    Geschwärzte Zeilen: {redacted.length}
                </p>
                <p className="mt-3 text-[13px] leading-snug">
                    Schwärzung wird fest ins PDF eingebrannt — der Text darunter ist wirklich weg.
                </p>
                <div className="mt-3">
                    <StateHint>Klicke auf Zeilen links, um sensible Inhalte direkt zu schwärzen.</StateHint>
                </div>
            </aside>
        </div>
    );
}
