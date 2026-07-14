import QRCode from 'qrcode';

export type GiroCodeData = {
    name: string;
    iban: string;
    bic?: string;
    amount: number; // euros
    purpose: string;
};

/**
 * EPC/Bezahlcode (GiroCode) Payload nach Spezifikation v2.1.
 * Service-Code 001 = SEPA Credit Transfer, ohne Betrag auf encoder-Seite,
 * aber mit Betrag (SCT mit Betrag). Versionsnummer 002, encoding UTF-8.
 */
export function buildEpcPayload(data: GiroCodeData): string {
    const service = 'BCD';
    const version = '002';
    const encoding = '1'; // UTF-8
    const transferType = 'SCT';
    const name = data.name.slice(0, 70).trim();
    const iban = data.iban.replace(/\s+/g, '').toUpperCase();
    const bic = (data.bic ?? '').replace(/\s+/g, '').toUpperCase();
    const amount = `EUR${data.amount.toFixed(2)}`;
    const purpose = data.purpose.slice(0, 140).trim();
    return [
        service,
        version,
        encoding,
        transferType,
        bic,
        name,
        iban,
        amount,
        '',
        '',
        '',
        '',
        '',
        purpose,
        '',
        '',
        '',
    ].join('\n');
}

export async function generateQrDataUrl(payload: string, size = 320): Promise<string> {
    return QRCode.toDataURL(payload, {
        width: size,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
    });
}
