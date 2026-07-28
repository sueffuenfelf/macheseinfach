import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { FlowSlotDef } from '../data/catalog/types';
import type { FlowSlotValue } from './context-types';
import { useFlowContextRequired } from './FlowContextProvider';
import {
    hasAnySlotSet,
    isSlotFilled,
    missingRequiredSlots,
    validateFileForSlot,
} from './flow-workspace-policy';
import { chipLabelFromSlot, encodeForSlotDef } from './slot-codec';

type FlowContextBarProps = {
    flowTitle: string;
    onRequestClear: () => void;
};

/**
 * Sticky Context Bar — all slots (filled / empty / error), soft-warn for required,
 * slot editors; wires focusSlotEditor („Ändern“ from Chip).
 */
export function FlowContextBar({ flowTitle, onRequestClear }: FlowContextBarProps) {
    const ctx = useFlowContextRequired();
    const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
    const [slotErrors, setSlotErrors] = useState<Record<string, string>>({});
    const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const missing = useMemo(() => missingRequiredSlots(ctx.schema.slots, ctx.getSlot), [ctx]);
    const anySet = useMemo(() => hasAnySlotSet(ctx.schema.slots, ctx.getSlot), [ctx]);

    useEffect(() => {
        if (!ctx.focusedSlotId) return;
        setEditingSlotId(ctx.focusedSlotId);
        const node = slotRefs.current[ctx.focusedSlotId];
        node?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const focusable = node?.querySelector<HTMLElement>(
            'input, textarea, select, button[data-slot-edit]',
        );
        focusable?.focus();
    }, [ctx.focusedSlotId]);

    useEffect(() => {
        if (!editingSlotId) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setEditingSlotId(null);
            }
        };
        window.addEventListener('keydown', onKey, true);
        return () => window.removeEventListener('keydown', onKey, true);
    }, [editingSlotId]);

    const slots = ctx.schema.slots;

    return (
        <section
            className="sticky top-0 z-20 border-b-2 border-black bg-white"
            data-testid="flow-context-bar"
            aria-label="Ausgangslage im Vorhaben"
        >
            <div className="space-y-3 px-4 py-3 md:px-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--color-ink-muted)]">
                            Im Vorhaben
                        </p>
                        <h2 className="truncate font-display text-[16px] font-bold tracking-[-0.02em] sm:text-[18px]">
                            {flowTitle}
                        </h2>
                    </div>
                    {anySet ? (
                        <button
                            type="button"
                            className="ms-btn shrink-0 text-[13px]"
                            onClick={onRequestClear}
                        >
                            Kontext löschen
                        </button>
                    ) : null}
                </div>

                <p className="text-[12px] text-[var(--color-ink-soft)]">
                    Alles bleibt lokal in diesem Tab — nichts wird hochgeladen.
                </p>

                {missing.length > 0 ? (
                    <div
                        className="rounded-[10px] border-2 border-black bg-[#fff3bf] px-3 py-2 text-[13px]"
                        role="status"
                        data-testid="flow-soft-warn"
                    >
                        Noch offen: {missing.map((s) => s.label).join(', ')} — Tools können die
                        Werte hier oder im Tool erfassen.
                    </div>
                ) : null}

                {slots.length === 0 ? (
                    <p className="text-[13px] text-[var(--color-ink-muted)]">
                        Keine gemeinsamen Felder für dieses Vorhaben.
                    </p>
                ) : (
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {slots.map((slot) => {
                            const value = ctx.getSlot(slot.id);
                            const filled = isSlotFilled(value);
                            const error = slotErrors[slot.id];
                            const editing = editingSlotId === slot.id;
                            return (
                                <li key={slot.id}>
                                    <div
                                        ref={(el) => {
                                            slotRefs.current[slot.id] = el;
                                        }}
                                        className={`rounded-[10px] border-2 px-3 py-2 ${
                                            error
                                                ? 'border-[#c1121f] bg-[#ffe5e5]'
                                                : filled
                                                  ? 'border-black bg-[var(--color-chip)]'
                                                  : slot.required
                                                    ? 'border-black/50 bg-white'
                                                    : 'border-black/25 bg-white'
                                        }`}
                                        data-slot-id={slot.id}
                                        data-slot-filled={filled ? 'true' : 'false'}
                                        data-slot-required={slot.required ? 'true' : undefined}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="font-display text-[13px] font-semibold">
                                                    {slot.label}
                                                    {slot.required ? (
                                                        <span
                                                            className="ml-1 text-[#c1121f]"
                                                            title="Pflichtfeld"
                                                        >
                                                            *
                                                        </span>
                                                    ) : null}
                                                </p>
                                                <p className="mt-0.5 truncate text-[12px] text-[var(--color-ink-soft)]">
                                                    {filled
                                                        ? slot.kind === 'password'
                                                            ? '••••••••'
                                                            : `Im Vorhaben: ${chipLabelFromSlot(value)}`
                                                        : 'Noch leer'}
                                                </p>
                                                {slot.kind === 'password' ? (
                                                    <p className="mt-0.5 text-[11px] text-[var(--color-ink-muted)]">
                                                        wird nicht gespeichert
                                                    </p>
                                                ) : null}
                                            </div>
                                            <button
                                                type="button"
                                                data-slot-edit
                                                className="ms-btn shrink-0 px-2 py-1 text-[12px]"
                                                onClick={() =>
                                                    setEditingSlotId(editing ? null : slot.id)
                                                }
                                            >
                                                {editing ? 'Fertig' : filled ? 'Ändern' : 'Setzen'}
                                            </button>
                                        </div>
                                        {error ? (
                                            <p
                                                className="mt-1 text-[12px] text-[#c1121f]"
                                                role="alert"
                                            >
                                                {error}
                                            </p>
                                        ) : null}
                                        {editing ? (
                                            <div className="mt-2 border-t border-black/15 pt-2">
                                                <SlotEditor
                                                    slot={slot}
                                                    value={value}
                                                    onError={(msg) =>
                                                        setSlotErrors((prev) => {
                                                            const next = { ...prev };
                                                            if (msg) next[slot.id] = msg;
                                                            else delete next[slot.id];
                                                            return next;
                                                        })
                                                    }
                                                    onChange={(next) => {
                                                        ctx.setSlot(slot.id, next);
                                                        if (next != null) {
                                                            setSlotErrors((prev) => {
                                                                const copy = { ...prev };
                                                                delete copy[slot.id];
                                                                return copy;
                                                            });
                                                        }
                                                    }}
                                                    onClear={() => {
                                                        ctx.clearSlot(slot.id);
                                                        setSlotErrors((prev) => {
                                                            const copy = { ...prev };
                                                            delete copy[slot.id];
                                                            return copy;
                                                        });
                                                    }}
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}

function SlotEditor({
    slot,
    value,
    onChange,
    onClear,
    onError,
}: {
    slot: FlowSlotDef;
    value: FlowSlotValue;
    onChange: (v: FlowSlotValue) => void;
    onClear: () => void;
    onError: (msg: string | null) => void;
}) {
    const acceptAttr = [...(slot.accept?.mime ?? []), ...(slot.accept?.ext ?? [])].join(',');

    if (slot.kind === 'file' || slot.kind === 'image') {
        return (
            <div className="space-y-2">
                <input
                    type="file"
                    accept={acceptAttr || (slot.kind === 'image' ? 'image/*' : undefined)}
                    className="ms-input w-full text-[13px]"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const err = validateFileForSlot(slot, file);
                        if (err) {
                            onError(err);
                            return;
                        }
                        onError(null);
                        onChange(
                            slot.kind === 'image'
                                ? {
                                      kind: 'image',
                                      file,
                                      name: file.name,
                                      byteSize: file.size,
                                  }
                                : {
                                      kind: 'file',
                                      file,
                                      name: file.name,
                                      byteSize: file.size,
                                  },
                        );
                    }}
                />
                {value != null ? (
                    <button type="button" className="ms-btn text-[12px]" onClick={onClear}>
                        Leeren
                    </button>
                ) : null}
            </div>
        );
    }

    if (slot.kind === 'files') {
        return (
            <div className="space-y-2">
                <input
                    type="file"
                    multiple
                    accept={acceptAttr || undefined}
                    className="ms-input w-full text-[13px]"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const files = [...(e.target.files ?? [])];
                        for (const file of files) {
                            const err = validateFileForSlot(slot, file);
                            if (err) {
                                onError(err);
                                return;
                            }
                        }
                        onError(null);
                        onChange({
                            kind: 'files',
                            files: files.map((file) => ({
                                file,
                                name: file.name,
                                byteSize: file.size,
                            })),
                        });
                    }}
                />
                {value != null ? (
                    <button type="button" className="ms-btn text-[12px]" onClick={onClear}>
                        Leeren
                    </button>
                ) : null}
            </div>
        );
    }

    if (slot.kind === 'multiline' || slot.kind === 'json') {
        const raw =
            value?.kind === 'multiline' || value?.kind === 'json'
                ? value.kind === 'json'
                    ? value.raw
                    : value.value
                : '';
        return (
            <div className="space-y-2">
                <textarea
                    className="ms-input min-h-[88px] w-full text-[13px]"
                    value={raw}
                    onChange={(e) => {
                        onError(null);
                        onChange(encodeForSlotDef(slot, e.target.value));
                    }}
                    placeholder={slot.label}
                />
                {raw ? (
                    <button type="button" className="ms-btn text-[12px]" onClick={onClear}>
                        Leeren
                    </button>
                ) : null}
            </div>
        );
    }

    if (slot.kind === 'enum' && slot.options?.length) {
        const current = value?.kind === 'enum' ? value.value : '';
        return (
            <div className="space-y-2">
                <select
                    className="ms-input w-full text-[13px]"
                    value={current}
                    onChange={(e) => {
                        onError(null);
                        if (!e.target.value) {
                            onClear();
                            return;
                        }
                        onChange(encodeForSlotDef(slot, e.target.value));
                    }}
                >
                    <option value="">— wählen —</option>
                    {slot.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    const stringValue =
        value &&
        (value.kind === 'text' ||
            value.kind === 'iban' ||
            value.kind === 'url' ||
            value.kind === 'date' ||
            value.kind === 'password' ||
            value.kind === 'currency')
            ? value.kind === 'currency'
                ? (value.raw ?? String(value.value))
                : value.value
            : '';

    const inputType =
        slot.kind === 'password'
            ? 'password'
            : slot.kind === 'date'
              ? 'date'
              : slot.kind === 'url'
                ? 'url'
                : 'text';

    return (
        <div className="space-y-2">
            <input
                type={inputType}
                className="ms-input w-full text-[13px]"
                value={stringValue}
                autoComplete={slot.kind === 'password' ? 'new-password' : 'off'}
                onChange={(e) => {
                    onError(null);
                    if (!e.target.value) {
                        onClear();
                        return;
                    }
                    onChange(encodeForSlotDef(slot, e.target.value));
                }}
                placeholder={slot.label}
            />
            {stringValue ? (
                <button type="button" className="ms-btn text-[12px]" onClick={onClear}>
                    Leeren
                </button>
            ) : null}
        </div>
    );
}
