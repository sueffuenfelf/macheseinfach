import { useMemo, useState } from 'react';
import type { ToolDefinition } from '../../data/catalog/types';
import { ResultCard } from '../_shared/_shared';
import {
    parseColor,
    rgbToHex,
    simulateColorBlindness,
    type ColorBlindMode,
} from '../_shared/color';
import { EditorToolShell } from '../_shared/shells';

const MODES: { value: ColorBlindMode; label: string }[] = [
    { value: 'deuteranopia', label: 'Deuteranopie' },
    { value: 'protanopia', label: 'Protanopie' },
    { value: 'tritanopia', label: 'Tritanopie' },
];

type SwatchProps = { label: string; hex: string };

function Swatch({ label, hex }: SwatchProps) {
    return (
        <div className="flex flex-col gap-1">
            <div
                className="h-16 w-full rounded-md border-2 border-black shadow-brutal-sm"
                style={{ backgroundColor: hex }}
            />
            <span className="text-xs font-medium text-ink-soft">
                {label}: {hex}
            </span>
        </div>
    );
}

export function ColorBlindSimTool({ tool }: { tool: ToolDefinition }) {
    const [fg, setFg] = useState('#e63946');
    const [bg, setBg] = useState('#f1faee');
    const [accent, setAccent] = useState('#457b9d');
    const [mode, setMode] = useState<ColorBlindMode>('deuteranopia');

    const preview = useMemo(() => {
        const colors = [
            { key: 'fg', input: fg },
            { key: 'bg', input: bg },
            { key: 'accent', input: accent },
        ];
        return colors.map(({ key, input }) => {
            const rgb = parseColor(input);
            if (!rgb) return { key, original: input, simulated: input, valid: false };
            return {
                key,
                original: rgbToHex(rgb),
                simulated: rgbToHex(simulateColorBlindness(rgb, mode)),
                valid: true,
            };
        });
    }, [fg, bg, accent, mode]);

    return (
        <>
            <EditorToolShell tool={tool}>
                <p className="mb-4 text-sm text-ink-soft">
                    Vereinfachte Farbblind-Simulation — zur groben Palette-Prüfung, nicht medizinisch.
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                    {MODES.map((m) => (
                        <button
                            key={m.value}
                            type="button"
                            className={`rounded-md border-2 border-black px-3 py-1.5 text-sm font-medium shadow-brutal-sm ${
                                mode === m.value ? 'bg-[var(--tool-accent-soft)]' : 'bg-surface'
                            }`}
                            onClick={() => setMode(m.value)}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
                <div className="mb-6 grid gap-3 sm:grid-cols-3">
                    <label className="flex flex-col gap-1 text-sm font-medium">
                        Vordergrund
                        <input
                            className="rounded-md border-2 border-black px-3 py-2 font-mono text-sm"
                            value={fg}
                            onChange={(e) => setFg(e.target.value)}
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium">
                        Hintergrund
                        <input
                            className="rounded-md border-2 border-black px-3 py-2 font-mono text-sm"
                            value={bg}
                            onChange={(e) => setBg(e.target.value)}
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium">
                        Akzent
                        <input
                            className="rounded-md border-2 border-black px-3 py-2 font-mono text-sm"
                            value={accent}
                            onChange={(e) => setAccent(e.target.value)}
                        />
                    </label>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <ResultCard title="Original" tone="info">
                        <div className="grid gap-3">
                            <Swatch label="Text" hex={preview[0]?.original ?? fg} />
                            <Swatch label="Hintergrund" hex={preview[1]?.original ?? bg} />
                            <Swatch label="Akzent" hex={preview[2]?.original ?? accent} />
                        </div>
                    </ResultCard>
                    <ResultCard title={`Simulation (${mode})`} tone="warn">
                        <div className="grid gap-3">
                            <Swatch label="Text" hex={preview[0]?.simulated ?? fg} />
                            <Swatch label="Hintergrund" hex={preview[1]?.simulated ?? bg} />
                            <Swatch label="Akzent" hex={preview[2]?.simulated ?? accent} />
                        </div>
                    </ResultCard>
                </div>
                <div
                    className="mt-6 rounded-lg border-2 border-black p-4 shadow-brutal"
                    style={{ backgroundColor: preview[1]?.simulated ?? bg, color: preview[0]?.simulated ?? fg }}
                >
                    <p className="text-lg font-semibold">Beispieltext auf Hintergrund</p>
                    <p className="mt-2 text-sm">
                        Sind Text und{' '}
                        <span style={{ color: preview[2]?.simulated ?? accent }}>Akzent-Link</span>{' '}
                        noch unterscheidbar?
                    </p>
                </div>
            </EditorToolShell>
        </>
    );
}
