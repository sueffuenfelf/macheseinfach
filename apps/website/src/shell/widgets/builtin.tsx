import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { getTool, type ToolId } from '../../data/catalog';
import { validateIban } from '../../lib/iban';
import { parseGermanNumber } from '../../lib/format';
import { buildEpcPayload, generateQrDataUrl } from '../../lib/qr';
import { generatePassword } from '../commands/utils';
import { DEFAULT_WIDGET_PASSWORD_OPTIONS } from '../workspaces/model';
import { PasswordCharTypesInline } from './WidgetSettingsPopover';
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
        return <div className="widget-tile">{children}</div>;
    }

    return (
        <section className="flex h-full min-h-0 flex-col rounded-[10px] border-2 border-black bg-white">
            <header className="border-b-2 border-black px-3 py-2">
                <h3 className="font-display text-[13px] font-bold">{title}</h3>
            </header>
            <div className="widget-tile min-h-0 flex-1">{children}</div>
        </section>
    );
}

function QuickIbanWidget({ embedded, sharedInput = '', useSharedInput = false }: WidgetComponentProps) {
    const [input, setInput] = useState('');
    const linked = useSharedInput && sharedInput.trim().length > 0;
    const effectiveInput = linked ? sharedInput : input;

    useEffect(() => {
        if (useSharedInput) setInput(sharedInput);
    }, [sharedInput, useSharedInput]);

    const result = useMemo(() => (effectiveInput.trim() ? validateIban(effectiveInput) : null), [effectiveInput]);
    const state = !effectiveInput.trim() ? null : result?.ok ? 'ok' : 'bad';
    return (
        <WidgetCard title="IBAN Quick Check" embedded={embedded}>
            <div className="widget-iban">
                <input
                    value={effectiveInput}
                    onChange={(event) => setInput(event.target.value)}
                    readOnly={linked}
                    placeholder="DE89 3704 0044 0532 0130 00"
                    className={`widget-iban__input ms-input font-mono ${linked ? 'bg-[var(--color-chip)]' : ''}`}
                    aria-readonly={linked}
                />
                <p className="widget-iban__status">
                    {state === null ? 'Prueft lokal ohne Netzwerkzugriff.' : state === 'ok' ? 'Gueltige IBAN.' : 'IBAN ist ungueltig.'}
                </p>
            </div>
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

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 48;

function clampPasswordLength(value: number): number {
    return Math.min(PASSWORD_MAX_LENGTH, Math.max(PASSWORD_MIN_LENGTH, value));
}

function PasswordMiniWidget({
    embedded,
    passwordOptions: passwordOptionsProp,
    onPasswordOptionsChange,
}: WidgetComponentProps) {
    const passwordOptions = passwordOptionsProp ?? DEFAULT_WIDGET_PASSWORD_OPTIONS;
    const [password, setPassword] = useState(() =>
        generatePassword(passwordOptions.length, passwordOptions),
    );
    const [copied, setCopied] = useState(false);

    const { length } = passwordOptions;

    useEffect(() => {
        setPassword(generatePassword(passwordOptions.length, passwordOptions));
    }, [
        passwordOptions.length,
        passwordOptions.uppercase,
        passwordOptions.lowercase,
        passwordOptions.numbers,
        passwordOptions.symbols,
    ]);

    function setLengthClamped(value: number) {
        onPasswordOptionsChange?.({
            ...passwordOptions,
            length: clampPasswordLength(value),
        });
    }

    function regenerate() {
        setPassword(generatePassword(passwordOptions.length, passwordOptions));
    }

    async function copyPassword() {
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            // Ignore clipboard permission failures.
        }
    }

    return (
        <WidgetCard title="Passwort Generator" embedded={embedded}>
            <div className="widget-password">
                <div className="widget-password__main">
                    <div className="widget-password__controls">
                        <div className="widget-password__stepper">
                            <span className="widget-password__label widget-password__label--decorative">Länge</span>
                            <div className="widget-password__stepper-group">
                                <button
                                    type="button"
                                    className="widget-password__step"
                                    aria-label="Passwort kürzer"
                                    disabled={length <= PASSWORD_MIN_LENGTH}
                                    onClick={() => setLengthClamped(length - 1)}
                                >
                                    −
                                </button>
                                <span className="widget-password__value" aria-live="polite">
                                    {length}
                                </span>
                                <button
                                    type="button"
                                    className="widget-password__step"
                                    aria-label="Passwort länger"
                                    disabled={length >= PASSWORD_MAX_LENGTH}
                                    onClick={() => setLengthClamped(length + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="widget-password__generate ms-btn"
                            aria-label="Neues Passwort generieren"
                            onClick={() => regenerate()}
                        >
                            <span className="widget-password__generate-label widget-password__generate-label--full">Neu</span>
                            <span className="widget-password__generate-label widget-password__generate-label--short" aria-hidden>
                                ↻
                            </span>
                        </button>
                    </div>
                    {onPasswordOptionsChange ? (
                        <PasswordCharTypesInline
                            options={passwordOptions}
                            onChange={onPasswordOptionsChange}
                        />
                    ) : null}
                    <button
                        type="button"
                        className="widget-password__output ms-focus"
                        onClick={() => void copyPassword()}
                        title={copied ? 'Kopiert!' : 'Klicken zum Kopieren'}
                        aria-label={copied ? 'Passwort kopiert' : 'Passwort kopieren'}
                    >
                        <span className="widget-password__output-text">{password}</span>
                        <span className="widget-password__copy-hint" aria-hidden>
                            {copied ? '✓' : '⎘'}
                        </span>
                    </button>
                </div>
            </div>
        </WidgetCard>
    );
}

function QuickQrWidget({ embedded, sharedInput = '', useSharedInput = false }: WidgetComponentProps) {
    const [text, setText] = useState('https://macheseinfa.ch');
    const [image, setImage] = useState<string | null>(null);
    const linked = useSharedInput && sharedInput.trim().length > 0;
    const effectiveText = linked ? sharedInput : text;

    useEffect(() => {
        if (useSharedInput) setText(sharedInput);
    }, [sharedInput, useSharedInput]);

    useEffect(() => {
        const value = effectiveText.trim();
        if (!value) {
            setImage(null);
            return;
        }
        let cancelled = false;
        const timer = window.setTimeout(() => {
            void generateQrDataUrl(value, 128).then((url) => {
                if (!cancelled) setImage(url);
            });
        }, linked ? 0 : 280);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [effectiveText, linked]);

    return (
        <WidgetCard title="QR Mini" embedded={embedded}>
            <div className={`widget-qr${linked ? ' widget-qr--linked' : ''}`}>
                <div className="widget-qr__main">
                    {!linked ? (
                        <div className="widget-qr__controls widget-no-drag">
                            <input
                                value={effectiveText}
                                onChange={(event) => setText(event.target.value)}
                                placeholder="URL oder Text"
                                className="widget-qr__input ms-input"
                            />
                            <button
                                type="button"
                                className="widget-qr__generate ms-btn"
                                aria-label="QR-Code erzeugen"
                                disabled={!effectiveText.trim()}
                                onClick={() => {
                                    const value = effectiveText.trim();
                                    if (!value) return;
                                    void generateQrDataUrl(value, 128).then(setImage);
                                }}
                            >
                                <span className="widget-qr__generate-label widget-qr__generate-label--full">QR erzeugen</span>
                                <span className="widget-qr__generate-label widget-qr__generate-label--short" aria-hidden>
                                    QR
                                </span>
                            </button>
                        </div>
                    ) : null}
                    <div className="widget-qr__preview">
                        {image ? (
                            <img src={image} alt="QR Vorschau" className="widget-qr__image" />
                        ) : (
                            <span className="widget-qr__placeholder widget-qr__placeholder--decorative">
                                {linked ? 'Gemeinsame Eingabe leer' : 'Noch kein QR'}
                            </span>
                        )}
                    </div>
                </div>
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
        supportsSharedInput: true,
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
        minW: 4,
        maxW: 8,
        minH: 2,
        maxH: 4,
        defaultW: 4,
        defaultH: 2,
    },
    {
        id: 'widget-qr-mini',
        title: 'QR Mini',
        description: 'Beliebigen Text als QR erstellen.',
        tags: ['QR', 'Quick'],
        toolId: 'girocode-gen',
        component: QuickQrWidget,
        supportsSharedInput: true,
        minW: 4,
        maxW: 8,
        minH: 2,
        maxH: 4,
        defaultW: 4,
        defaultH: 2,
    },
    createLaunchWidget('widget-pdf-compress', 'pdf-compress'),
    createLaunchWidget('widget-pdf-redact', 'pdf-redact'),
    createLaunchWidget('widget-pdf-merge', 'pdf-merge'),
    createLaunchWidget('widget-pdf-sign', 'pdf-sign'),
    createLaunchWidget('widget-heic-convert', 'heic-convert'),
    createLaunchWidget('widget-ocr-local', 'ocr-local'),
    createLaunchWidget('widget-epc-read', 'epc-read'),
];
