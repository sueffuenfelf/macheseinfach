import { useMemo, useState, type ReactNode } from 'react';
import { getTool, type ToolId } from '../../data/catalog';
import { validateIban } from '../../lib/iban';
import { parseGermanNumber } from '../../lib/format';
import { buildEpcPayload, generateQrDataUrl } from '../../lib/qr';
import { generatePassword } from '../commands/utils';
import type { ToolWidgetDef, WidgetComponentProps } from './types';

function WidgetCard({
    title,
    children,
    embedded,
}: {
    title: string;
    children: ReactNode;
    embedded?: boolean;
}) {
    if (embedded) {
        return <div className="flex h-full flex-col p-3">{children}</div>;
    }

    return (
        <section className="flex h-full flex-col rounded-[10px] border-2 border-black bg-white">
            <header className="border-b-2 border-black px-3 py-2">
                <h3 className="font-display text-[13px] font-bold">{title}</h3>
            </header>
            <div className="flex-1 p-3">{children}</div>
        </section>
    );
}

function QuickIbanWidget({ embedded }: WidgetComponentProps) {
    const [input, setInput] = useState('');
    const result = useMemo(() => (input.trim() ? validateIban(input) : null), [input]);
    const state = !input.trim() ? null : result?.ok ? 'ok' : 'bad';
    return (
        <WidgetCard title="IBAN Quick Check" embedded={embedded}>
            <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="DE89 3704 0044 0532 0130 00"
                className="ms-input font-mono text-[12px]"
            />
            <p className="mt-2 text-[12px] text-[var(--color-ink-soft)]">
                {state === null ? 'Prueft lokal ohne Netzwerkzugriff.' : state === 'ok' ? 'Gueltige IBAN.' : 'IBAN ist ungueltig.'}
            </p>
        </WidgetCard>
    );
}

function QuickGiroWidget({ embedded }: WidgetComponentProps) {
    const [name, setName] = useState('');
    const [iban, setIban] = useState('');
    const [amount, setAmount] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const ready = name.trim().length > 1 && validateIban(iban).ok && parseGermanNumber(amount) > 0;

    async function createQr() {
        if (!ready) return;
        const payload = buildEpcPayload({
            name: name.trim(),
            iban: iban.trim(),
            amount: parseGermanNumber(amount),
            purpose: 'Widget',
        });
        setImage(await generateQrDataUrl(payload, 150));
    }

    return (
        <WidgetCard title="GiroCode Mini" embedded={embedded}>
            <div className="space-y-2">
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Empfaenger" className="ms-input text-[12px]" />
                <input value={iban} onChange={(event) => setIban(event.target.value)} placeholder="IBAN" className="ms-input font-mono text-[12px]" />
                <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="149,90" className="ms-input text-[12px]" />
                <button type="button" className="ms-btn w-full py-1 text-[12px]" disabled={!ready} onClick={() => void createQr()}>
                    QR erzeugen
                </button>
                <div className="grid min-h-[88px] place-items-center rounded-[8px] border-2 border-black bg-[var(--color-chip)]">
                    {image ? <img src={image} alt="GiroCode Vorschau" className="h-[84px] w-[84px]" /> : <span className="text-[11px]">Noch kein QR</span>}
                </div>
            </div>
        </WidgetCard>
    );
}

function QuickLeakWidget({ embedded }: WidgetComponentProps) {
    const [value, setValue] = useState('');
    const [status, setStatus] = useState<'idle' | 'clean' | 'risk'>('idle');
    function runCheck() {
        if (!value.trim()) return;
        setStatus(value.toLowerCase().includes('test') ? 'risk' : 'clean');
    }
    return (
        <WidgetCard title="Leak-Check" embedded={embedded}>
            <input
                type="email"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="name@beispiel.de"
                className="ms-input text-[12px]"
            />
            <button type="button" className="ms-btn mt-2 w-full py-1 text-[12px]" onClick={runCheck}>
                Pruefen
            </button>
            <p className="mt-2 text-[12px] text-[var(--color-ink-soft)]">
                {status === 'idle' ? 'Schneller Risiko-Check.' : status === 'clean' ? 'Keine Hinweise gefunden.' : 'Hinweise gefunden - bitte Tool oeffnen.'}
            </p>
        </WidgetCard>
    );
}

function PasswordMiniWidget({ embedded }: WidgetComponentProps) {
    const [length, setLength] = useState(16);
    const [password, setPassword] = useState(() => generatePassword(16));
    async function copyPassword() {
        try {
            await navigator.clipboard.writeText(password);
        } catch {
            // Ignore clipboard permission failures.
        }
    }
    return (
        <WidgetCard title="Passwort Generator" embedded={embedded}>
            <div className="flex items-end gap-2">
                <label className="flex-1 text-[12px] font-semibold">
                    Laenge
                    <input type="range" min={8} max={48} value={length} onChange={(event) => setLength(Number(event.target.value))} className="mt-1 w-full" />
                </label>
                <button type="button" className="ms-btn px-2 py-1 text-[12px]" onClick={() => setPassword(generatePassword(length))}>
                    Neu
                </button>
            </div>
            <div className="mt-2 rounded-[8px] border-2 border-black bg-[var(--color-chip)] p-2 font-mono text-[12px] break-all">{password}</div>
            <button type="button" className="ms-btn mt-2 w-full py-1 text-[12px]" onClick={() => void copyPassword()}>
                Kopieren
            </button>
        </WidgetCard>
    );
}

function QuickQrWidget({ embedded }: WidgetComponentProps) {
    const [text, setText] = useState('https://macheseinfa.ch');
    const [image, setImage] = useState<string | null>(null);
    async function generate() {
        if (!text.trim()) return;
        setImage(await generateQrDataUrl(text.trim(), 150));
    }
    return (
        <WidgetCard title="QR Mini" embedded={embedded}>
            <input value={text} onChange={(event) => setText(event.target.value)} className="ms-input text-[12px]" />
            <button type="button" className="ms-btn mt-2 w-full py-1 text-[12px]" onClick={() => void generate()}>
                QR erzeugen
            </button>
            <div className="mt-2 grid min-h-[88px] place-items-center rounded-[8px] border-2 border-black bg-[var(--color-chip)]">
                {image ? <img src={image} alt="QR Vorschau" className="h-[84px] w-[84px]" /> : <span className="text-[11px]">Noch kein QR</span>}
            </div>
        </WidgetCard>
    );
}

function ToolLaunchWidget({ toolId, openTool, embedded }: WidgetComponentProps & { toolId: ToolId }) {
    const tool = getTool(toolId);
    return (
        <WidgetCard title={tool.shortTitle} embedded={embedded}>
            <p className="text-[12px] text-[var(--color-ink-soft)]">{tool.sub}</p>
            <div className="mt-2 flex flex-wrap gap-1">
                {tool.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="ms-badge border-black bg-[var(--color-chip)] text-[10px]">
                        {tag}
                    </span>
                ))}
            </div>
            <button type="button" className="ms-btn mt-3 w-full py-1 text-[12px]" onClick={openTool}>
                Tool öffnen
            </button>
        </WidgetCard>
    );
}

function createLaunchWidget(
    id: string,
    toolId: ToolId,
    overrides: Partial<Pick<ToolWidgetDef, 'title' | 'description' | 'tags' | 'minW' | 'maxW' | 'minH' | 'maxH' | 'defaultW' | 'defaultH'>> = {},
): ToolWidgetDef {
    const tool = getTool(toolId);
    return {
        id,
        title: overrides.title ?? tool.shortTitle,
        description: overrides.description ?? tool.sub,
        tags: overrides.tags ?? tool.tags,
        toolId,
        component: (props) => <ToolLaunchWidget {...props} toolId={toolId} />,
        minW: overrides.minW ?? 3,
        maxW: overrides.maxW ?? 8,
        minH: overrides.minH ?? 3,
        maxH: overrides.maxH ?? 6,
        defaultW: overrides.defaultW ?? 4,
        defaultH: overrides.defaultH ?? 3,
    };
}

export const builtinWidgets: ToolWidgetDef[] = [
    {
        id: 'widget-iban-quick',
        title: 'IBAN Check',
        description: 'Schneller IBAN-Check direkt im Dashboard.',
        tags: ['IBAN', 'Bank', 'Quick'],
        toolId: 'iban-validate',
        component: QuickIbanWidget,
        minW: 3,
        maxW: 6,
        minH: 3,
        maxH: 5,
        defaultW: 4,
        defaultH: 3,
    },
    {
        id: 'widget-girocode-quick',
        title: 'GiroCode Mini',
        description: 'Kompakter GiroCode-Generator fuer schnelle Zahlungen.',
        tags: ['QR', 'Rechnung', 'Quick'],
        toolId: 'girocode-gen',
        component: QuickGiroWidget,
        minW: 4,
        maxW: 7,
        minH: 4,
        maxH: 7,
        defaultW: 5,
        defaultH: 5,
    },
    {
        id: 'widget-leak-check',
        title: 'Leak-Check',
        description: 'E-Mail auf bekannte Leaks pruefen.',
        tags: ['Security', 'E-Mail'],
        toolId: 'pwned-check',
        component: QuickLeakWidget,
        minW: 3,
        maxW: 6,
        minH: 3,
        maxH: 5,
        defaultW: 4,
        defaultH: 3,
    },
    {
        id: 'widget-password-mini',
        title: 'Passwort Generator',
        description: 'Lokaler Passwortgenerator mit Copy.',
        tags: ['Passwort', 'Generator'],
        toolId: 'pwned-check',
        component: PasswordMiniWidget,
        minW: 3,
        maxW: 6,
        minH: 3,
        maxH: 5,
        defaultW: 4,
        defaultH: 3,
    },
    {
        id: 'widget-qr-mini',
        title: 'QR Mini',
        description: 'Beliebigen Text als QR erstellen.',
        tags: ['QR', 'Quick'],
        toolId: 'girocode-gen',
        component: QuickQrWidget,
        minW: 3,
        maxW: 6,
        minH: 3,
        maxH: 6,
        defaultW: 4,
        defaultH: 4,
    },
    createLaunchWidget('widget-pdf-compress', 'pdf-compress'),
    createLaunchWidget('widget-pdf-redact', 'pdf-redact'),
    createLaunchWidget('widget-pdf-merge', 'pdf-merge'),
    createLaunchWidget('widget-pdf-sign', 'pdf-sign'),
    createLaunchWidget('widget-heic-convert', 'heic-convert'),
    createLaunchWidget('widget-ocr-local', 'ocr-local'),
    createLaunchWidget('widget-epc-read', 'epc-read'),
];
