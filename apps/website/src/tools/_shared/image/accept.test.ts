import { describe, expect, test } from 'bun:test';
import { filterAcceptedImageFiles, isAcceptedImageFile } from './accept';

describe('image accept', () => {
    test('accepts common image mime types', () => {
        expect(isAcceptedImageFile(new File(['x'], 'photo.png', { type: 'image/png' }))).toBe(true);
        expect(isAcceptedImageFile(new File(['x'], 'photo.jpg', { type: 'image/jpeg' }))).toBe(true);
        expect(isAcceptedImageFile(new File(['x'], 'photo.webp', { type: 'image/webp' }))).toBe(
            true,
        );
    });

    test('accepts heic by extension when mime is empty', () => {
        expect(isAcceptedImageFile(new File(['x'], 'iphone.heic', { type: '' }))).toBe(true);
        expect(isAcceptedImageFile(new File(['x'], 'iphone.HEIF', { type: '' }))).toBe(true);
    });

    test('rejects non-image files', () => {
        expect(isAcceptedImageFile(new File(['x'], 'notes.pdf', { type: 'application/pdf' }))).toBe(
            false,
        );
        expect(isAcceptedImageFile(new File(['x'], 'data.csv', { type: 'text/csv' }))).toBe(false);
    });

    test('filterAcceptedImageFiles keeps only images', () => {
        const files = [
            new File(['x'], 'a.png', { type: 'image/png' }),
            new File(['x'], 'b.pdf', { type: 'application/pdf' }),
            new File(['x'], 'c.heic', { type: '' }),
        ];
        const filtered = filterAcceptedImageFiles(files);
        expect(filtered.map((file) => file.name)).toEqual(['a.png', 'c.heic']);
    });
});
