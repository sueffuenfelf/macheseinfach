import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LIVE_FORMAT_IDS, getFormat } from '../../tools/_shared/image/formats';
import type { WidgetImageStepOptions } from '../workspaces/image-step-options';
import type { WidgetPasswordOptions } from '../workspaces/model';
import { SettingsToggleRow } from './SettingsToggleRow';
import type { ToolWidgetDef, WidgetValuePort } from './types';
import type { WorkspaceWidgetLinkInput } from '../workspaces/model';
import { useDismissLayer } from '../useDismissLayer';

const PASSWORD_WIDGET_ID = 'widget-password-mini';
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 48;
const POPOVER_WIDTH = 264;
const POPOVER_GAP = 6;
const VIEWPORT_PADDING = 8;

type WidgetSettingsPopoverProps = {
    widget: ToolWidgetDef;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    passwordOptions?: WidgetPasswordOptions;
    onPasswordOptionsChange?: (options: WidgetPasswordOptions) => void;
    useSharedInput?: boolean;
    onUseSharedInputChange?: (value: boolean) => void;
    advancedLinkingEnabled?: boolean;
    sourceWidgets?: {
        id: string;
        title: string;
        ports: readonly { id: WidgetValuePort; label: string }[];
    }[];
    selectedLinks?: WorkspaceWidgetLinkInput[];
    onSelectedLinksChange?: (links: WorkspaceWidgetLinkInput[]) => void;
    imageStepOptions?: WidgetImageStepOptions;
    onImageStepOptionsChange?: (options: WidgetImageStepOptions) => void;
    useLinkedArtifactInput?: boolean;
    onUseLinkedArtifactInputChange?: (value: boolean) => void;
};

type PopoverPosition = {
    top: number;
    left: number;
};

function clampPopoverPosition(anchor: DOMRect, popoverHeight: number): PopoverPosition {
    let top = anchor.bottom + POPOVER_GAP;
    let left = anchor.right - POPOVER_WIDTH;

    left = Math.max(
        VIEWPORT_PADDING,
        Math.min(left, window.innerWidth - POPOVER_WIDTH - VIEWPORT_PADDING),
    );

    if (top + popoverHeight > window.innerHeight - VIEWPORT_PADDING) {
        const flippedTop = anchor.top - POPOVER_GAP - popoverHeight;
        if (flippedTop >= VIEWPORT_PADDING) {
            top = flippedTop;
        } else {
            top = Math.max(VIEWPORT_PADDING, window.innerHeight - popoverHeight - VIEWPORT_PADDING);
        }
    }

    return { top, left };
}

function clampPasswordLength(value: number): number {
    return Math.min(PASSWORD_MAX_LENGTH, Math.max(PASSWORD_MIN_LENGTH, value));
}

function countEnabledCharTypes(options: WidgetPasswordOptions): number {
    return [options.uppercase, options.lowercase, options.numbers, options.symbols].filter(Boolean)
        .length;
}

const PASSWORD_CHAR_TYPES: {
    key: keyof Pick<WidgetPasswordOptions, 'uppercase' | 'lowercase' | 'numbers' | 'symbols'>;
    title: string;
    description: string;
}[] = [
    { key: 'uppercase', title: 'Großbuchstaben', description: 'Enthält Buchstaben von A bis Z.' },
    { key: 'lowercase', title: 'Kleinbuchstaben', description: 'Enthält Buchstaben von a bis z.' },
    { key: 'numbers', title: 'Zahlen', description: 'Enthält Ziffern von 0 bis 9.' },
    { key: 'symbols', title: 'Sonderzeichen', description: 'Enthält Symbole wie !, @, # oder $.' },
];

function PasswordCharTypeFields({
    options,
    onChange,
    compact = false,
}: {
    options: WidgetPasswordOptions;
    onChange: (next: WidgetPasswordOptions) => void;
    compact?: boolean;
}) {
    function toggle(key: (typeof PASSWORD_CHAR_TYPES)[number]['key'], checked: boolean) {
        if (!checked && countEnabledCharTypes(options) <= 1) return;
        onChange({ ...options, [key]: checked });
    }

    if (compact) {
        return (
            <fieldset className="widget-settings__fieldset widget-settings__fieldset--compact">
                <legend className="widget-settings__legend">Zeichenarten</legend>
                <div className="widget-settings__checks widget-settings__checks--inline">
                    {PASSWORD_CHAR_TYPES.map(({ key, title }) => (
                        <label key={key} className="widget-settings__check">
                            <input
                                type="checkbox"
                                checked={options[key]}
                                onChange={(event) => toggle(key, event.target.checked)}
                            />
                            <span>{title}</span>
                        </label>
                    ))}
                </div>
            </fieldset>
        );
    }

    return (
        <fieldset className="widget-settings__fieldset">
            <legend className="widget-settings__legend">Zeichenarten</legend>
            <div className="widget-settings__toggle-rows">
                {PASSWORD_CHAR_TYPES.map(({ key, title, description }) => {
                    const enabledCount = countEnabledCharTypes(options);
                    const isOnlyEnabled = options[key] && enabledCount <= 1;
                    return (
                        <SettingsToggleRow
                            key={key}
                            id={`password-char-${key}`}
                            title={title}
                            description={description}
                            checked={options[key]}
                            disabled={isOnlyEnabled}
                            onChange={(checked) => toggle(key, checked)}
                        />
                    );
                })}
            </div>
        </fieldset>
    );
}

function PasswordLengthField({
    length,
    onChange,
}: {
    length: number;
    onChange: (length: number) => void;
}) {
    return (
        <div className="widget-settings__field">
            <span className="widget-settings__label">Länge</span>
            <div className="widget-password__stepper-group widget-settings__stepper">
                <button
                    type="button"
                    className="widget-password__step"
                    aria-label="Passwort kürzer"
                    disabled={length <= PASSWORD_MIN_LENGTH}
                    onClick={() => onChange(clampPasswordLength(length - 1))}
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
                    onClick={() => onChange(clampPasswordLength(length + 1))}
                >
                    +
                </button>
            </div>
        </div>
    );
}

export function PasswordCharTypesInline({
    options,
    onChange,
}: {
    options: WidgetPasswordOptions;
    onChange: (next: WidgetPasswordOptions) => void;
}) {
    return (
        <div className="widget-password__char-types widget-no-drag">
            <PasswordCharTypeFields options={options} onChange={onChange} compact />
        </div>
    );
}

const IMAGE_FILE_DROP_WIDGET_ID = 'widget-image-file-drop';

function ImageFormatSelect({
    id,
    label,
    value,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="widget-settings__field">
            <span className="widget-settings__label">{label}</span>
            <select
                id={id}
                className="ms-input mt-1 text-[12px]"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                {LIVE_FORMAT_IDS.map((formatId) => (
                    <option key={formatId} value={formatId}>
                        {getFormat(formatId).label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function ImageStepOptionsFields({
    options,
    onChange,
}: {
    options: WidgetImageStepOptions;
    onChange: (next: WidgetImageStepOptions) => void;
}) {
    switch (options.kind) {
        case 'convert':
            return (
                <fieldset className="widget-settings__fieldset">
                    <legend className="widget-settings__legend">Konvertierung</legend>
                    <p className="text-[11px] leading-[1.4] text-[var(--color-ink-soft)]">
                        Das Quellformat wird automatisch aus der Datei erkannt.
                    </p>
                    <div className="mt-2 space-y-2">
                        <ImageFormatSelect
                            id="image-convert-to"
                            label="Zielformat"
                            value={options.convertTo ?? 'jpg'}
                            onChange={(convertTo) =>
                                onChange({
                                    ...options,
                                    convertTo: convertTo as WidgetImageStepOptions['convertTo'],
                                })
                            }
                        />
                    </div>
                </fieldset>
            );
        case 'compress':
            return (
                <fieldset className="widget-settings__fieldset">
                    <legend className="widget-settings__legend">Komprimierung</legend>
                    <div className="space-y-2">
                        <div className="widget-settings__field">
                            <span className="widget-settings__label">Qualität (%)</span>
                            <div className="widget-password__stepper-group widget-settings__stepper">
                                <button
                                    type="button"
                                    className="widget-password__step"
                                    aria-label="Qualität verringern"
                                    disabled={(options.compressQuality ?? 82) <= 10}
                                    onClick={() =>
                                        onChange({
                                            ...options,
                                            compressQuality: Math.max(
                                                10,
                                                (options.compressQuality ?? 82) - 5,
                                            ),
                                        })
                                    }
                                >
                                    −
                                </button>
                                <span className="widget-password__value" aria-live="polite">
                                    {options.compressQuality ?? 82}
                                </span>
                                <button
                                    type="button"
                                    className="widget-password__step"
                                    aria-label="Qualität erhöhen"
                                    disabled={(options.compressQuality ?? 82) >= 100}
                                    onClick={() =>
                                        onChange({
                                            ...options,
                                            compressQuality: Math.min(
                                                100,
                                                (options.compressQuality ?? 82) + 5,
                                            ),
                                        })
                                    }
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <ImageFormatSelect
                            id="image-compress-format"
                            label="Ausgabeformat"
                            value={options.compressFormat ?? 'jpg'}
                            onChange={(compressFormat) =>
                                onChange({
                                    ...options,
                                    compressFormat:
                                        compressFormat as WidgetImageStepOptions['compressFormat'],
                                })
                            }
                        />
                    </div>
                </fieldset>
            );
        case 'resize':
            return (
                <fieldset className="widget-settings__fieldset">
                    <legend className="widget-settings__legend">Skalierung</legend>
                    <div className="space-y-2">
                        <div className="widget-settings__field">
                            <span className="widget-settings__label">Max. Breite (px)</span>
                            <input
                                type="number"
                                min={64}
                                max={8192}
                                className="ms-input mt-1 text-[12px]"
                                value={options.resizeMaxWidth ?? 1920}
                                onChange={(event) =>
                                    onChange({
                                        ...options,
                                        resizeMaxWidth: Number(event.target.value) || 1920,
                                    })
                                }
                            />
                        </div>
                        <div className="widget-settings__field">
                            <span className="widget-settings__label">Max. Höhe (px)</span>
                            <input
                                type="number"
                                min={64}
                                max={8192}
                                className="ms-input mt-1 text-[12px]"
                                value={options.resizeMaxHeight ?? 1920}
                                onChange={(event) =>
                                    onChange({
                                        ...options,
                                        resizeMaxHeight: Number(event.target.value) || 1920,
                                    })
                                }
                            />
                        </div>
                        <ImageFormatSelect
                            id="image-resize-format"
                            label="Ausgabeformat"
                            value={options.resizeFormat ?? 'jpg'}
                            onChange={(resizeFormat) =>
                                onChange({
                                    ...options,
                                    resizeFormat:
                                        resizeFormat as WidgetImageStepOptions['resizeFormat'],
                                })
                            }
                        />
                    </div>
                </fieldset>
            );
        case 'exif-strip':
            return (
                <fieldset className="widget-settings__fieldset">
                    <legend className="widget-settings__legend">Metadaten</legend>
                    <ImageFormatSelect
                        id="image-exif-format"
                        label="Ausgabeformat"
                        value={options.exifFormat ?? 'jpg'}
                        onChange={(exifFormat) =>
                            onChange({
                                ...options,
                                exifFormat: exifFormat as WidgetImageStepOptions['exifFormat'],
                            })
                        }
                    />
                </fieldset>
            );
    }
}

function ImageArtifactOutputFields({ widget }: { widget: ToolWidgetDef }) {
    const ports = widget.outputPorts ?? [];
    if (ports.length === 0) return null;
    return (
        <fieldset className="widget-settings__fieldset">
            <legend className="widget-settings__legend">Ausgänge für Verknüpfungen</legend>
            <p className="text-[11px] leading-[1.4] text-[var(--color-ink-soft)]">
                Nachgelagerte Widgets können diese Ausgänge als Bild-Eingang nutzen.
            </p>
            <ul className="mt-2 space-y-1">
                {ports.map((port) => (
                    <li
                        key={port.id}
                        className="rounded-[8px] border-2 border-black bg-white px-2 py-1 text-[12px]"
                    >
                        <span className="font-semibold">{port.label}</span>
                        <span className="ml-1 text-[10px] text-[var(--color-ink-muted)]">
                            ({port.id})
                        </span>
                    </li>
                ))}
            </ul>
        </fieldset>
    );
}

function ImageArtifactLinkFields({
    sourceWidgets,
    selectedLinks,
    onSelectedLinksChange,
    useLinkedArtifactInput,
    onUseLinkedArtifactInputChange,
}: {
    sourceWidgets: {
        id: string;
        title: string;
        ports: readonly { id: WidgetValuePort; label: string }[];
    }[];
    selectedLinks: WorkspaceWidgetLinkInput[];
    onSelectedLinksChange: (links: WorkspaceWidgetLinkInput[]) => void;
    useLinkedArtifactInput?: boolean;
    onUseLinkedArtifactInputChange?: (value: boolean) => void;
}) {
    const artifactSources = sourceWidgets.filter((entry) =>
        entry.ports.some((port) => port.id === 'imageArtifact'),
    );
    const artifactLink = selectedLinks.find((link) => link.sourcePort === 'imageArtifact');
    const textLinks = selectedLinks.filter((link) => link.sourcePort !== 'imageArtifact');

    function setArtifactLink(sourceWidgetId: string) {
        onSelectedLinksChange([
            ...textLinks,
            { sourceWidgetId, sourcePort: 'imageArtifact' },
        ]);
    }

    function clearArtifactLink() {
        onSelectedLinksChange(textLinks);
    }

    return (
        <fieldset className="widget-settings__fieldset">
            <legend className="widget-settings__legend">Bild-Eingang</legend>
            {onUseLinkedArtifactInputChange ? (
                <SettingsToggleRow
                    id="image-linked-artifact-input"
                    title="Verknüpften Eingang nutzen"
                    description="Verarbeitet Bild-Artefakte von einem vorgelagerten Widget automatisch."
                    checked={useLinkedArtifactInput ?? true}
                    onChange={onUseLinkedArtifactInputChange}
                />
            ) : null}
            <p className="mt-2 text-[11px] leading-[1.4] text-[var(--color-ink-soft)]">
                Wähle das Widget, dessen Bild-Artefakt als Eingabe dient.
            </p>
            <div className="mt-2 space-y-2">
                <label className="block text-[10px] font-semibold uppercase text-[var(--color-ink-muted)]">
                    Quelle
                </label>
                <select
                    className="ms-input text-[12px]"
                    value={artifactLink?.sourceWidgetId ?? ''}
                    disabled={artifactSources.length === 0}
                    onChange={(event) => {
                        const value = event.target.value;
                        if (!value) {
                            clearArtifactLink();
                            return;
                        }
                        setArtifactLink(value);
                    }}
                >
                    <option value="">Keine Quelle</option>
                    {artifactSources.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                            {entry.title}
                        </option>
                    ))}
                </select>
                {artifactSources.length === 0 ? (
                    <p className="text-[11px] text-[var(--color-ink-soft)]">
                        Kein Widget mit Bild-Artefakt-Ausgang im Arbeitsbereich.
                    </p>
                ) : null}
            </div>
        </fieldset>
    );
}

function WidgetSettingsPanel({
    widget,
    passwordOptions,
    onPasswordOptionsChange,
    useSharedInput,
    onUseSharedInputChange,
    advancedLinkingEnabled,
    sourceWidgets = [],
    selectedLinks = [],
    onSelectedLinksChange,
    imageStepOptions,
    onImageStepOptionsChange,
    useLinkedArtifactInput,
    onUseLinkedArtifactInputChange,
}: Omit<WidgetSettingsPopoverProps, 'open' | 'onOpenChange'>) {
    const isPassword = widget.id === PASSWORD_WIDGET_ID;
    const isImageFileDrop = widget.id === IMAGE_FILE_DROP_WIDGET_ID;
    const isImageStep = Boolean(widget.imageStepKind);
    const supportsShared = Boolean(widget.supportsSharedInput);
    const supportsLinkedInput = Boolean(widget.supportsLinkedInput);
    const hasImageArtifactOutput = Boolean(
        widget.outputPorts?.some((port) => port.id === 'imageArtifact'),
    );
    const hasImageSettings =
        isImageFileDrop || isImageStep || (hasImageArtifactOutput && !supportsLinkedInput);
    const showTextLinking =
        advancedLinkingEnabled && supportsLinkedInput && !isImageStep && onSelectedLinksChange;
    const showImageLinking =
        advancedLinkingEnabled &&
        isImageStep &&
        onSelectedLinksChange &&
        onUseLinkedArtifactInputChange;

    if (
        !isPassword &&
        !supportsShared &&
        !showTextLinking &&
        !showImageLinking &&
        !hasImageSettings
    ) {
        return (
            <p className="widget-settings__empty">
                Für dieses Widget gibt es noch keine Einstellungen.
            </p>
        );
    }

    function updateLink(index: number, patch: Partial<WorkspaceWidgetLinkInput>) {
        const next = selectedLinks.map((entry, current) =>
            current === index ? { ...entry, ...patch } : entry,
        );
        onSelectedLinksChange?.(next);
    }

    function removeLink(index: number) {
        onSelectedLinksChange?.(selectedLinks.filter((_, current) => current !== index));
    }

    function addLink() {
        const firstWidget = sourceWidgets[0];
        const firstPort = firstWidget?.ports[0];
        if (!firstWidget || !firstPort) return;
        onSelectedLinksChange?.([
            ...selectedLinks,
            { sourceWidgetId: firstWidget.id, sourcePort: firstPort.id },
        ]);
    }

    return (
        <div className="widget-settings__panel">
            {isPassword && passwordOptions && onPasswordOptionsChange ? (
                <>
                    <PasswordLengthField
                        length={passwordOptions.length}
                        onChange={(length) =>
                            onPasswordOptionsChange({ ...passwordOptions, length })
                        }
                    />
                    <PasswordCharTypeFields
                        options={passwordOptions}
                        onChange={onPasswordOptionsChange}
                    />
                </>
            ) : null}
            {supportsShared && onUseSharedInputChange ? (
                <SettingsToggleRow
                    id={`${widget.id}-shared-input`}
                    title="Gemeinsame Eingabe"
                    description="Nutzt den workspace-weiten Wert statt eines lokalen Feldes."
                    checked={useSharedInput ?? false}
                    onChange={onUseSharedInputChange}
                />
            ) : null}
            {imageStepOptions && onImageStepOptionsChange ? (
                <ImageStepOptionsFields
                    options={imageStepOptions}
                    onChange={onImageStepOptionsChange}
                />
            ) : null}
            {showImageLinking ? (
                <ImageArtifactLinkFields
                    sourceWidgets={sourceWidgets}
                    selectedLinks={selectedLinks}
                    onSelectedLinksChange={onSelectedLinksChange}
                    useLinkedArtifactInput={useLinkedArtifactInput}
                    onUseLinkedArtifactInputChange={onUseLinkedArtifactInputChange}
                />
            ) : null}
            {!advancedLinkingEnabled && isImageStep ? (
                <p className="rounded-[8px] border-2 border-black bg-[var(--color-brand-soft)] px-2 py-2 text-[11px] leading-[1.4] text-[var(--color-ink-soft)]">
                    Aktiviere unter Einstellungen „Erweiterte Widget-Verknüpfungen", um
                    Bild-Eingänge von anderen Widgets zu verbinden.
                </p>
            ) : null}
            {(isImageFileDrop || (hasImageArtifactOutput && !isImageStep)) ? (
                <ImageArtifactOutputFields widget={widget} />
            ) : null}
            {showTextLinking ? (
                <fieldset className="widget-settings__fieldset">
                    <legend className="widget-settings__legend">Verknüpfte Eingänge</legend>
                    <p className="text-[11px] leading-[1.4] text-[var(--color-ink-soft)]">
                        Mehrere Quellen werden als kombinierter Text an dieses Widget übergeben.
                    </p>
                    <div className="mt-2 space-y-2">
                        {selectedLinks.map((link, index) => {
                            const sourceWidget =
                                sourceWidgets.find((entry) => entry.id === link.sourceWidgetId) ??
                                sourceWidgets[0];
                            const ports = sourceWidget?.ports ?? [];
                            return (
                                <div
                                    key={`${link.sourceWidgetId}:${link.sourcePort}:${index}`}
                                    className="rounded-[8px] border-2 border-black bg-white p-2"
                                >
                                    <label className="block text-[10px] font-semibold uppercase text-[var(--color-ink-muted)]">
                                        Quelle
                                    </label>
                                    <select
                                        className="ms-input mt-1 text-[12px]"
                                        value={sourceWidget?.id ?? ''}
                                        onChange={(event) => {
                                            const nextWidget = sourceWidgets.find(
                                                (entry) => entry.id === event.target.value,
                                            );
                                            updateLink(index, {
                                                sourceWidgetId: event.target.value,
                                                sourcePort: nextWidget?.ports[0]?.id ?? 'value',
                                            });
                                        }}
                                    >
                                        {sourceWidgets.map((entry) => (
                                            <option key={entry.id} value={entry.id}>
                                                {entry.title}
                                            </option>
                                        ))}
                                    </select>
                                    <label className="mt-2 block text-[10px] font-semibold uppercase text-[var(--color-ink-muted)]">
                                        Ausgang
                                    </label>
                                    <div className="mt-1 flex gap-2">
                                        <select
                                            className="ms-input text-[12px]"
                                            value={link.sourcePort}
                                            onChange={(event) =>
                                                updateLink(index, {
                                                    sourcePort: event.target
                                                        .value as WidgetValuePort,
                                                })
                                            }
                                        >
                                            {ports.map((port) => (
                                                <option key={port.id} value={port.id}>
                                                    {port.label}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            className="ms-btn px-2 py-1 text-[11px]"
                                            onClick={() => removeLink(index)}
                                        >
                                            Entfernen
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        <button
                            type="button"
                            className="ms-btn w-full py-1 text-[12px]"
                            disabled={sourceWidgets.length === 0}
                            onClick={addLink}
                        >
                            Quelle hinzufügen
                        </button>
                    </div>
                </fieldset>
            ) : null}
        </div>
    );
}

export function WidgetSettingsPopover({
    widget,
    open,
    onOpenChange,
    passwordOptions,
    onPasswordOptionsChange,
    useSharedInput,
    onUseSharedInputChange,
    advancedLinkingEnabled,
    sourceWidgets,
    selectedLinks,
    onSelectedLinksChange,
    imageStepOptions,
    onImageStepOptionsChange,
    useLinkedArtifactInput,
    onUseLinkedArtifactInputChange,
}: WidgetSettingsPopoverProps) {
    const panelId = useId();
    const anchorRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0 });

    useDismissLayer(open, () => onOpenChange(false));

    const updatePosition = useCallback(() => {
        const anchor = anchorRef.current;
        const popover = popoverRef.current;
        if (!anchor || !popover) return;
        setPosition(clampPopoverPosition(anchor.getBoundingClientRect(), popover.offsetHeight));
    }, []);

    useLayoutEffect(() => {
        if (!open) return;
        updatePosition();
    }, [
        open,
        updatePosition,
        passwordOptions,
        useSharedInput,
        widget.id,
        selectedLinks,
        advancedLinkingEnabled,
        imageStepOptions,
        useLinkedArtifactInput,
    ]);

    useEffect(() => {
        if (!open) return;
        function onPointerDown(event: MouseEvent) {
            const target = event.target as Node;
            if (anchorRef.current?.contains(target)) return;
            if (popoverRef.current?.contains(target)) return;
            onOpenChange(false);
        }
        function onViewportChange() {
            updatePosition();
        }
        window.addEventListener('mousedown', onPointerDown);
        window.addEventListener('resize', onViewportChange);
        window.addEventListener('scroll', onViewportChange, true);
        return () => {
            window.removeEventListener('mousedown', onPointerDown);
            window.removeEventListener('resize', onViewportChange);
            window.removeEventListener('scroll', onViewportChange, true);
        };
    }, [open, onOpenChange, updatePosition]);

    useEffect(() => {
        if (!open || !popoverRef.current) return;
        const observer = new ResizeObserver(() => updatePosition());
        observer.observe(popoverRef.current);
        return () => observer.disconnect();
    }, [open, updatePosition]);

    return (
        <>
            <button
                ref={anchorRef}
                type="button"
                className="widget-settings__gear widget-no-drag"
                aria-label={`${widget.title} Einstellungen`}
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                onClick={() => onOpenChange(!open)}
            >
                <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                >
                    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                </svg>
            </button>
            {open
                ? createPortal(
                      <div
                          ref={popoverRef}
                          id={panelId}
                          role="dialog"
                          aria-label={`${widget.title} Einstellungen`}
                          className="widget-settings__popover widget-settings__popover--portal"
                          style={{ top: position.top, left: position.left }}
                      >
                          <header className="widget-settings__header">
                              <span className="font-display text-[12px] font-bold">
                                  Einstellungen
                              </span>
                              <button
                                  type="button"
                                  className="widget-settings__close"
                                  aria-label="Einstellungen schließen"
                                  onClick={() => onOpenChange(false)}
                              >
                                  ×
                              </button>
                          </header>
                          <WidgetSettingsPanel
                              widget={widget}
                              passwordOptions={passwordOptions}
                              onPasswordOptionsChange={onPasswordOptionsChange}
                              useSharedInput={useSharedInput}
                              onUseSharedInputChange={onUseSharedInputChange}
                              advancedLinkingEnabled={advancedLinkingEnabled}
                              sourceWidgets={sourceWidgets}
                              selectedLinks={selectedLinks}
                              onSelectedLinksChange={onSelectedLinksChange}
                              imageStepOptions={imageStepOptions}
                              onImageStepOptionsChange={onImageStepOptionsChange}
                              useLinkedArtifactInput={useLinkedArtifactInput}
                              onUseLinkedArtifactInputChange={onUseLinkedArtifactInputChange}
                          />
                      </div>,
                      document.body,
                  )
                : null}
        </>
    );
}
