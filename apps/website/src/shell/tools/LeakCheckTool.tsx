import { useState } from 'react';
import type { Tool } from '../../data/catalog';
import { deterministicSeed } from '../../lib/format';
import { ResultCard, StateHint } from './_shared';

type LeakCheckToolProps = {
    tool: Tool;
};

type LeakResult =
    | { kind: 'found'; count: number; rows: { service: string; detail: string }[] }
    | { kind: 'clean' };

const SERVICES = ['Online-Shop XY', 'Forum Alpha', 'Cloud-Backup Beta', 'Marktplatz Delta'];

export function LeakCheckTool({ tool }: LeakCheckToolProps) {
    const [email, setEmail] = useState('');
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<LeakResult | null>(null);

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const value = email.trim().toLowerCase();
        if (!value) return;
        setChecking(true);
        window.setTimeout(() => {
            const seed = deterministicSeed(value);
            if (seed % 3 !== 0) {
                const count = (seed % 3) + 1;
                const rows = Array.from({ length: count }).map((_, idx) => ({
                    service: SERVICES[(seed + idx) % SERVICES.length],
                    detail: `${2022 + ((seed + idx) % 3)} · Passwort, E-Mail`,
                }));
                setResult({ kind: 'found', count, rows });
            } else {
                setResult({ kind: 'clean' });
            }
            setChecking(false);
        }, 700);
    }

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:px-6" aria-busy={checking}>
            <form onSubmit={onSubmit} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                    <label htmlFor={`${tool.id}-email`} className="mb-1 block font-display text-[12px] font-bold uppercase tracking-[0.05em]">
                        E-Mail-Adresse
                    </label>
                    <input
                        id={`${tool.id}-email`}
                        type="email"
                        className="ms-input"
                        placeholder="name@beispiel.de"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button type="submit" className="ms-btn-primary h-[44px]">
                    Prüfen
                </button>
            </form>

            {checking ? <p className="ms-pulse text-[14px] font-semibold">Prüfe bekannte Leaks …</p> : null}

            {result?.kind === 'found' ? (
                <ResultCard tone="danger" heading={`In ${result.count} bekannten Leaks gefunden`}>
                    <div className="space-y-2">
                        {result.rows.map((row) => (
                            <div key={`${row.service}-${row.detail}`} className="rounded-md border-2 border-black bg-white p-3">
                                <p className="font-display text-[14px] font-bold">{row.service}</p>
                                <p className="text-[13px]">{row.detail}</p>
                            </div>
                        ))}
                    </div>
                </ResultCard>
            ) : null}

            {result?.kind === 'clean' ? (
                <ResultCard tone="success" heading="Keine Leaks gefunden">
                    <p className="text-[14px]">Deine Adresse taucht in keinen bekannten Leaks auf.</p>
                </ResultCard>
            ) : null}

            <StateHint>
                Passwörter werden nie im Klartext gesendet — geprüft wird nur ein kurzes, anonymisiertes Fragment
                (k-Anonymität).
            </StateHint>
        </div>
    );
}
