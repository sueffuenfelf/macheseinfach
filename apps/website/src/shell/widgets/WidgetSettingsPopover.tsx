import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
};

type PopoverPosition = {
    top: number;
    left: number;
};

function clampPopoverPosition(anchor: DOMRect, popoverHeight: number): PopoverPosition {
    let top = anchor.bottom + POPOVER_GAP;
    let left = anchor.right - POPOVER_WIDTH;

    left = Math.max(VIEWPORT_PADDING, Math.min(left, window.innerWidth - POPOVER_WIDTH - VIEWPORT_PADDING));

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
    return [options.uppercase, options.lowercase, options.numbers, options.symbols].filter(Boolean).length;
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
}: Omit<WidgetSettingsPopoverProps, 'open' | 'onOpenChange'>) {
    const isPassword = widget.id === PASSWORD_WIDGET_ID;
    const supportsShared = Boolean(widget.supportsSharedInput);
    const supportsLinkedInput = Boolean(widget.supportsLinkedInput);

    if (!isPassword && !supportsShared && !(advancedLinkingEnabled && supportsLinkedInput)) {
        return <p className="widget-settings__empty">Für dieses Widget gibt es noch keine Einstellungen.</p>;
    }

    function updateLink(index: number, patch: Partial<WorkspaceWidgetLinkInput>) {
        const next = selectedLinks.map((entry, current) => (current === index ? { ...entry, ...patch } : entry));
        onSelectedLinksChange?.(next);
    }

    function removeLink(index: number) {
        onSelectedLinksChange?.(selectedLinks.filter((_, current) => current !== index));
    }

    function addLink() {
        const firstWidget = sourceWidgets[0];
        const firstPort = firstWidget?.ports[0];
        if (!firstWidget || !firstPort) return;
        onSelectedLinksChange?.([...selectedLinks, { sourceWidgetId: firstWidget.id, sourcePort: firstPort.id }]);
    }

    return (
        <div className="widget-settings__panel">
            {isPassword && passwordOptions && onPasswordOptionsChange ? (
                <>
                    <PasswordLengthField
                        length={passwordOptions.length}
                        onChange={(length) => onPasswordOptionsChange({ ...passwordOptions, length })}
                    />
                    <PasswordCharTypeFields options={passwordOptions} onChange={onPasswordOptionsChange} />
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
            {advancedLinkingEnabled && supportsLinkedInput && onSelectedLinksChange ? (
                <fieldset className="widget-settings__fieldset">
                    <legend className="widget-settings__legend">Verknüpfte Eingänge</legend>
                    <p className="text-[11px] leading-[1.4] text-[var(--color-ink-soft)]">
                        Mehrere Quellen werden als kombinierter Text an dieses Widget übergeben.
                    </p>
                    <div className="mt-2 space-y-2">
                        {selectedLinks.map((link, index) => {
                            const sourceWidget = sourceWidgets.find((entry) => entry.id === link.sourceWidgetId) ?? sourceWidgets[0];
                            const ports = sourceWidget?.ports ?? [];
                            return (
                                <div key={`${link.sourceWidgetId}:${link.sourcePort}:${index}`} className="rounded-[8px] border-2 border-black bg-white p-2">
                                    <label className="block text-[10px] font-semibold uppercase text-[var(--color-ink-muted)]">
                                        Quelle
                                    </label>
                                    <select
                                        className="ms-input mt-1 text-[12px]"
                                        value={sourceWidget?.id ?? ''}
                                        onChange={(event) => {
                                            const nextWidget = sourceWidgets.find((entry) => entry.id === event.target.value);
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
                                            onChange={(event) => updateLink(index, { sourcePort: event.target.value as WidgetValuePort })}
                                        >
                                            {ports.map((port) => (
                                                <option key={port.id} value={port.id}>
                                                    {port.label}
                                                </option>
                                            ))}
                                        </select>
                                        <button type="button" className="ms-btn px-2 py-1 text-[11px]" onClick={() => removeLink(index)}>
                                            Entfernen
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        <button type="button" className="ms-btn w-full py-1 text-[12px]" disabled={sourceWidgets.length === 0} onClick={addLink}>
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
    }, [open, updatePosition, passwordOptions, useSharedInput, widget.id, selectedLinks, advancedLinkingEnabled]);

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
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
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
                              <span className="font-display text-[12px] font-bold">Einstellungen</span>
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
                          />
                      </div>,
                      document.body,
                  )
                : null}
        </>
    );
}
