/**
 * IBAN-Validierung offline.
 * Mod-97-Prüfsumme + kleine BLZ→Bank-Tabelle (Auszug, Demo-Zwecke).
 * Keine Netzwerkanfragen — alles im Browser.
 */

export type IbanResult =
    | {
          ok: true;
          iban: string;
          country: string;
          checksum: string;
          bban: string;
          bank: string;
          bic: string;
          valid: true;
      }
    | {
          ok: false;
          iban: string;
          reason: 'format' | 'length' | 'checksum' | 'country';
          valid: false;
      };

/** Kleine Demo-Bankleitzahl-Tabelle (Auszug, in Produktion größere Tabelle). */
const BLZ_BANKS: Record<string, { bank: string; bic: string }> = {
    '37040044': { bank: 'Commerzbank', bic: 'COBADEFFXXX' },
    '70020270': { bank: 'UniCredit Bank - HypoVereinsbank', bic: 'HYVEDEMMXXX' },
    '50010517': { bank: 'ING-DiBa', bic: 'INGDDEFFXXX' },
    '10050000': { bank: 'Sparkasse Berlin', bic: 'BELADEBEXXX' },
    '60250110': { bank: 'Kreissparkasse Karlsruhe', bic: 'KARSDE66XXX' },
    '20041133': { bank: 'Commerzbank Hamburg', bic: 'COBADEHBXXX' },
    '50070010': { bank: 'Deutsche Bank Frankfurt', bic: 'DEUTDEFFXXX' },
    '70010080': { bank: 'Postbank', bic: 'PBNKDEFFXXX' },
    '30050000': { bank: 'Sparkasse Düsseldorf', bic: 'DUSSDEDDXXX' },
    '66070024': { bank: 'Deutsche Bank Karlsruhe', bic: 'DEUTDESMXXX' },
};

const COUNTRY_LENGTHS: Record<string, number> = {
    DE: 22,
    AT: 20,
    CH: 21,
    FR: 27,
    NL: 18,
    BE: 16,
    ES: 24,
    IT: 27,
    PL: 28,
    GB: 22,
};

export function normalizeIban(input: string): string {
    return input.replace(/\s+/g, '').toUpperCase();
}

export function formatIban(input: string): string {
    const clean = normalizeIban(input);
    return clean.replace(/(.{4})/g, '$1 ').trim();
}

export function validateIban(input: string): IbanResult {
    const iban = normalizeIban(input);
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban)) {
        return { ok: false, iban, reason: 'format', valid: false };
    }
    const country = iban.slice(0, 2);
    const expectedLen = COUNTRY_LENGTHS[country];
    if (!expectedLen) {
        return { ok: false, iban, reason: 'country', valid: false };
    }
    if (iban.length !== expectedLen) {
        return { ok: false, iban, reason: 'length', valid: false };
    }
    // Rearrange: first 4 chars to end, then map A-Z → 10..35
    const rearranged = iban.slice(4) + iban.slice(0, 4);
    const numeric = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
    // mod-97 via chunked BigInt
    let remainder = 0;
    for (let i = 0; i < numeric.length; i++) {
        remainder = (remainder * 10 + Number(numeric[i])) % 97;
    }
    if (remainder !== 1) {
        return { ok: false, iban, reason: 'checksum', valid: false };
    }
    const checksum = iban.slice(2, 4);
    const bban = iban.slice(4);
    let bank = 'Unbekannte Bank';
    let bic = '—';
    if (country === 'DE') {
        const blz = iban.slice(4, 12);
        const found = BLZ_BANKS[blz];
        if (found) {
            bank = found.bank;
            bic = found.bic;
        }
    }
    return {
        ok: true,
        iban,
        country,
        checksum,
        bban,
        bank,
        bic,
        valid: true,
    };
}

export function ibanCountryName(code: string): string {
    const names: Record<string, string> = {
        DE: 'Deutschland',
        AT: 'Österreich',
        CH: 'Schweiz',
        FR: 'Frankreich',
        NL: 'Niederlande',
        BE: 'Belgien',
        ES: 'Spanien',
        IT: 'Italien',
        PL: 'Polen',
        GB: 'Vereinigtes Königreich',
    };
    return names[code] ?? code;
}
