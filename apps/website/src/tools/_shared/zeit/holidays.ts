import { getHolidayByDate, getHolidays, isHoliday } from 'feiertagejs';
import type { Region } from 'feiertagejs';

export const BUNDESLAENDER = [
    { value: 'BW', label: 'Baden-Württemberg' },
    { value: 'BY', label: 'Bayern' },
    { value: 'BE', label: 'Berlin' },
    { value: 'BB', label: 'Brandenburg' },
    { value: 'HB', label: 'Bremen' },
    { value: 'HH', label: 'Hamburg' },
    { value: 'HE', label: 'Hessen' },
    { value: 'MV', label: 'Mecklenburg-Vorpommern' },
    { value: 'NI', label: 'Niedersachsen' },
    { value: 'NW', label: 'Nordrhein-Westfalen' },
    { value: 'RP', label: 'Rheinland-Pfalz' },
    { value: 'SL', label: 'Saarland' },
    { value: 'SN', label: 'Sachsen' },
    { value: 'ST', label: 'Sachsen-Anhalt' },
    { value: 'SH', label: 'Schleswig-Holstein' },
    { value: 'TH', label: 'Thüringen' },
] as const;

export type BundeslandCode = (typeof BUNDESLAENDER)[number]['value'];

export function asRegion(code: string): Region {
    return code as Region;
}

export function isGermanHoliday(date: Date, region: string): boolean {
    return isHoliday(date, asRegion(region));
}

export function getGermanHolidayName(date: Date, region: string): string | null {
    const holiday = getHolidayByDate(date, asRegion(region));
    return holiday ? holiday.translate('de') : null;
}

export function listGermanHolidays(year: number, region: string): { date: Date; name: string }[] {
    const holidays = getHolidays(year, asRegion(region));
    return holidays
        .map((h) => ({ date: h.date, name: h.translate('de') }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
}
