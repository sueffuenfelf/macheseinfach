import type { ToolId } from '../../../data/catalog/types';
import type { ReactNode } from 'react';

/** Local-only image file helper (shared context journeys were removed). */
export function useImageToolFile(_toolId: ToolId, _inputKey = 'file') {
    return {
        bound: false as const,
        boundFile: null as File | null,
        chip: null as ReactNode,
        onLocalFile: (_file: File | null) => {},
        writeBack: (_blob: Blob, _filename: string) => {},
        reportSuccess: () => {},
    };
}
