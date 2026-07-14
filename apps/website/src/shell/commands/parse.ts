import type { ParsedSlashInput } from './types';

/** True when the palette should show slash-command mode instead of tool search. */
export function isCommandMode(query: string): boolean {
    return query.startsWith('/');
}

export function parseSlashInput(query: string): ParsedSlashInput | null {
    const trimmed = query.trim();
    if (!trimmed.startsWith('/')) return null;
    const body = trimmed.slice(1).trim();
    if (!body) return { commandName: '', args: '' };
    const space = body.indexOf(' ');
    if (space === -1) return { commandName: body.toLowerCase(), args: '' };
    return {
        commandName: body.slice(0, space).toLowerCase(),
        args: body.slice(space + 1).trim(),
    };
}
