import type { GenerateOutput, FieldValues } from '../_shared/shells';
import { titleToSlug } from '../_shared/seo/slug';

/** German title → URL slug. */
export function generateSlug(values: FieldValues): GenerateOutput {
    const title = values.title?.trim() ?? '';
    if (!title) return null;

    const slug = titleToSlug(title);
    if (!slug) {
        return {
            kind: 'text',
            content: 'Kein gültiger Slug — bitte Buchstaben oder Zahlen verwenden.',
        };
    }

    return {
        kind: 'text',
        content: [slug, '', `Vollständige URL: https://beispiel.de/${slug}`].join('\n'),
    };
}
