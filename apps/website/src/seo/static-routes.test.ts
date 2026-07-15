import { describe, expect, test } from 'bun:test';
import { collectStaticRoutes } from './static-routes';

describe('static routes', () => {
    test('collectStaticRoutes includes variant and hub routes', () => {
        const routes = collectStaticRoutes();
        const paths = routes.map((route) => route.path);

        expect(paths).toContain('/');
        expect(paths).toContain('/suche');
        expect(paths).toContain('/bereich/bilder/bild-konvertieren');
        expect(paths).toContain('/bereich/bilder/heic-zu-png/image-convert');
        expect(paths).toContain('/bereich/bilder/bild-verkleinern/image-compress');
        expect(paths).toContain('/bereich/bilder/bild-metadaten/image-exif-strip');

        const variantRoutes = routes.filter((route) => route.variant);
        expect(variantRoutes.length).toBe(8);
    });
});
