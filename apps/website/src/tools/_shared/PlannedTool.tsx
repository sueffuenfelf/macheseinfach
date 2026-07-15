import { useState } from 'react';
import type { ToolDefinition as Tool } from '../../data/catalog/types';
import { useToast } from '../../shell/toast';
import { ResultCard } from './_shared';

type PlannedToolProps = {
    tool: Tool;
};

export function PlannedTool({ tool }: PlannedToolProps) {
    const [email, setEmail] = useState('');
    const { toast } = useToast();

    return (
        <div className="ms-animate-fade mx-auto w-full max-w-2xl px-4 py-6 md:px-6">
            <ResultCard tone="info" heading="Bald verfügbar">
                <p className="text-[14px]">{tool.sub}</p>
                <p className="text-[14px]">
                    Wir arbeiten an diesem Werkzeug. Trag dich ein und wir sagen Bescheid, sobald es
                    soweit ist.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        type="email"
                        className="ms-input"
                        placeholder="name@beispiel.de"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-label="E-Mail für Benachrichtigung"
                    />
                    <button
                        type="button"
                        className="ms-btn"
                        onClick={() => {
                            if (!email.trim()) return;
                            toast({ message: 'Danke — wir melden uns.', variant: 'success' });
                            setEmail('');
                        }}
                    >
                        Benachrichtigen, wenn fertig
                    </button>
                </div>
            </ResultCard>
        </div>
    );
}
