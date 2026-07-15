import { describe, expect, test } from 'bun:test';
import {
    BILD_PORTAL_WIDGET_IDS,
    getNextImagePipelineStep,
    IMAGE_TOOL_CHAIN,
} from './pipeline';

describe('image pipeline registry', () => {
    test('defines bild-portal widget order', () => {
        expect(BILD_PORTAL_WIDGET_IDS).toEqual([
            'widget-image-file-drop',
            'widget-image-convert',
            'widget-image-compress',
            'widget-image-resize',
            'widget-image-exif-strip',
        ]);
    });

    test('chains convert through exif strip', () => {
        expect(getNextImagePipelineStep('image-convert')?.toolId).toBe('image-compress');
        expect(getNextImagePipelineStep('image-compress')?.toolId).toBe('image-resize');
        expect(getNextImagePipelineStep('image-resize')?.toolId).toBe('image-exif-strip');
        expect(getNextImagePipelineStep('image-exif-strip')).toBeUndefined();
    });

    test('uses German labels for continue flow', () => {
        expect(IMAGE_TOOL_CHAIN['image-convert']?.label).toBe('Komprimieren');
        expect(IMAGE_TOOL_CHAIN['image-resize']?.label).toBe('Metadaten entfernen');
    });
});
