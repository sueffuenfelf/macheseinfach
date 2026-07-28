/** Runtime values for Flow context slots. */

export type FlowSlotValue =
    | { kind: 'file'; file: File; name: string; byteSize: number; objectUrl?: string }
    | { kind: 'files'; files: { file: File; name: string; byteSize: number }[] }
    | { kind: 'image'; file: File; name: string; byteSize: number; objectUrl?: string }
    | {
          kind: 'text' | 'multiline' | 'iban' | 'url' | 'date' | 'password' | 'enum';
          value: string;
      }
    | { kind: 'currency'; value: number; raw?: string }
    | { kind: 'json'; value: unknown; raw: string }
    | null;

export const DEFAULT_MAX_FILE_BYTES = 40 * 1024 * 1024; // 40 MB
