import type { FieldValues, GenerateOutput } from '../_shared/shells';
import { generateQrDataUrl } from '../../lib/qr';
import { buildVCard } from '../_shared/kommunikation/vcard';

export async function generateVCardQr(values: FieldValues): Promise<GenerateOutput> {
    const firstName = (values.firstName ?? '').trim();
    const lastName = (values.lastName ?? '').trim();
    if (!firstName && !lastName) return null;

    const vcard = buildVCard({
        firstName,
        lastName,
        org: values.org,
        title: values.title,
        phone: values.phone,
        email: values.email,
        url: values.url,
    });

    const dataUrl = await generateQrDataUrl(vcard, 320);
    return { kind: 'qr', dataUrl, filename: 'vcard-qr.png' };
}
