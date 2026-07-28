import type { FlowContextSchema, FlowSlotDef, FlowSlotKind } from '../data/catalog/types';
import type { FlowSlotValue } from './context-types';

/** Decode a slot into a form string (Calc/Check/Generate fields). */
export function decodeFormString(slot: FlowSlotValue): string | null {
    if (slot == null) return null;
    switch (slot.kind) {
        case 'text':
        case 'multiline':
        case 'iban':
        case 'url':
        case 'date':
        case 'password':
        case 'enum':
            return slot.value;
        case 'currency':
            return slot.raw ?? String(slot.value);
        case 'json':
            return slot.raw;
        default:
            return null;
    }
}

/** Decode file/image slot to File. */
export function decodeFile(slot: FlowSlotValue): File | null {
    if (slot == null) return null;
    if (slot.kind === 'file' || slot.kind === 'image') return slot.file;
    return null;
}

/** Decode text-like slots (paste / extract text). */
export function decodeText(slot: FlowSlotValue): string | null {
    return decodeFormString(slot);
}

/** Chip label for a filled slot value. */
export function chipLabelFromSlot(slot: FlowSlotValue): string {
    if (slot == null) return '';
    switch (slot.kind) {
        case 'file':
        case 'image':
            return slot.name;
        case 'files':
            return slot.files.length === 1
                ? (slot.files[0]?.name ?? '1 Datei')
                : `${slot.files.length} Dateien`;
        case 'currency':
            return slot.raw ?? String(slot.value);
        case 'json':
            return slot.raw.length > 48 ? `${slot.raw.slice(0, 48)}…` : slot.raw;
        case 'password':
            return '••••••••';
        case 'text':
        case 'multiline':
        case 'iban':
        case 'url':
        case 'date':
        case 'enum': {
            const v = slot.value;
            return v.length > 48 ? `${v.slice(0, 48)}…` : v;
        }
        default:
            return '';
    }
}

function parseCurrencyInput(raw: string): { value: number; raw: string } | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const normalized = trimmed.replace(/\./g, '').replace(',', '.');
    const n = Number(normalized);
    if (!Number.isFinite(n)) return null;
    return { value: n, raw: trimmed };
}

/** Encode a local tool value into a FlowSlotValue for write-through. */
export function encodeForSlot(
    schema: FlowContextSchema,
    slotId: string,
    value: unknown,
): FlowSlotValue {
    const def = schema.slots.find((s) => s.id === slotId);
    if (!def) return null;
    return encodeForSlotDef(def, value);
}

export function encodeForSlotDef(def: FlowSlotDef, value: unknown): FlowSlotValue {
    if (value == null) return null;

    if (value instanceof File) {
        return encodeFileForKind(def.kind, value);
    }

    if (typeof value === 'string') {
        return encodeStringForKind(def, value);
    }

    if (typeof value === 'number' && def.kind === 'currency') {
        return { kind: 'currency', value };
    }

    return null;
}

function encodeFileForKind(kind: FlowSlotKind, file: File): FlowSlotValue {
    if (kind === 'image') {
        return { kind: 'image', file, name: file.name, byteSize: file.size };
    }
    if (kind === 'file' || kind === 'files') {
        return { kind: 'file', file, name: file.name, byteSize: file.size };
    }
    return null;
}

function encodeStringForKind(def: FlowSlotDef, raw: string): FlowSlotValue {
    const trimmed = raw;
    switch (def.kind) {
        case 'text':
        case 'multiline':
        case 'iban':
        case 'url':
        case 'date':
        case 'password':
        case 'enum':
            return { kind: def.kind, value: trimmed };
        case 'currency': {
            const parsed = parseCurrencyInput(trimmed);
            if (!parsed) return { kind: 'currency', value: 0, raw: trimmed };
            return { kind: 'currency', value: parsed.value, raw: parsed.raw };
        }
        case 'json': {
            try {
                return { kind: 'json', value: JSON.parse(trimmed) as unknown, raw: trimmed };
            } catch {
                return { kind: 'json', value: null, raw: trimmed };
            }
        }
        default:
            return null;
    }
}
