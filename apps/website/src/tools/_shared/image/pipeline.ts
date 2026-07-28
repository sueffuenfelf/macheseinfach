import type { ToolId } from '../../../data/catalog/types';

export type ImagePipelineNextStep = {
    toolId: ToolId;
    label: string;
};

/** Default Bild-Portal tool chain for „Weiter mit …“. */
export const IMAGE_TOOL_CHAIN: Partial<Record<ToolId, ImagePipelineNextStep>> = {
    'image-convert': { toolId: 'image-compress', label: 'Komprimieren' },
    'image-compress': { toolId: 'image-resize', label: 'Verkleinern' },
    'image-resize': { toolId: 'image-exif-strip', label: 'Metadaten entfernen' },
};

export function getNextImagePipelineStep(toolId: ToolId): ImagePipelineNextStep | undefined {
    return IMAGE_TOOL_CHAIN[toolId];
}
