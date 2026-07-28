import type { GenerateOutput, FieldValues } from '../_shared/shells';

function buildLocalBusiness(values: FieldValues): Record<string, unknown> {
    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: values.name?.trim(),
    };
    const street = values.street?.trim();
    const city = values.city?.trim();
    const zip = values.zip?.trim();
    if (street || city || zip) {
        schema.address = {
            '@type': 'PostalAddress',
            ...(street ? { streetAddress: street } : {}),
            ...(city ? { addressLocality: city } : {}),
            ...(zip ? { postalCode: zip } : {}),
            addressCountry: 'DE',
        };
    }
    const phone = values.phone?.trim();
    if (phone) schema.telephone = phone;
    const url = values.url?.trim();
    if (url) schema.url = url;
    return schema;
}

function buildFaq(values: FieldValues): Record<string, unknown> {
    const questions = (values.questions?.trim() ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const sep = line.indexOf('|');
            if (sep === -1) return { q: line, a: '' };
            return { q: line.slice(0, sep).trim(), a: line.slice(sep + 1).trim() };
        });

    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: questions.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: a || q,
            },
        })),
    };
}

/** Generate LocalBusiness or FAQ JSON-LD. */
export function generateSchema(values: FieldValues): GenerateOutput {
    const schemaType = values.schemaType ?? 'local-business';

    if (schemaType === 'faq') {
        const questions = values.questions?.trim() ?? '';
        if (!questions) return null;
        const schema = buildFaq(values);
        if ((schema.mainEntity as unknown[]).length === 0) return null;
        return {
            kind: 'code',
            content: JSON.stringify(schema, null, 2),
            language: 'json',
            filename: 'faq-schema.json',
        };
    }

    const name = values.name?.trim() ?? '';
    if (!name) return null;

    const schema = buildLocalBusiness(values);
    return {
        kind: 'code',
        content: JSON.stringify(schema, null, 2),
        language: 'json',
        filename: 'local-business-schema.json',
    };
}
