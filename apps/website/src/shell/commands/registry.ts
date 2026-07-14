import { formatIban, ibanCountryName, validateIban } from '../../lib/iban';
import { generateQrDataUrl } from '../../lib/qr';
import type { CommandResult, SlashCommand } from './types';
import {
    base64Decode,
    base64Encode,
    countText,
    generatePassword,
    generateUuidV4,
    sha256Hex,
    slugify,
} from './utils';

function ok(output: string, copyText = output, feedback = 'In Zwischenablage kopiert'): CommandResult {
    return { status: 'success', output, copyText, feedback };
}

function err(message: string): CommandResult {
    return { status: 'error', output: message };
}

function info(message: string): CommandResult {
    return { status: 'info', output: message };
}

async function readClipboardText(): Promise<string | null> {
    try {
        return await navigator.clipboard.readText();
    } catch {
        return null;
    }
}

const commands: SlashCommand[] = [
    {
        name: 'pw',
        description: 'Sicheres Passwort generieren',
        usage: '/pw [länge]',
        execute(args) {
            const len = args.trim() ? Number.parseInt(args.trim(), 10) : 16;
            if (!Number.isFinite(len) || len < 4 || len > 128) {
                return err('Länge muss zwischen 4 und 128 liegen.');
            }
            return ok(generatePassword(len));
        },
    },
    {
        name: 'uuid',
        description: 'UUID v4 erzeugen',
        usage: '/uuid',
        execute() {
            return ok(generateUuidV4());
        },
    },
    {
        name: 'iban',
        description: 'IBAN prüfen und formatieren',
        usage: '/iban [text|paste]',
        async execute(args) {
            let input = args.trim();
            if (!input || input.toLowerCase() === 'paste') {
                const clip = await readClipboardText();
                if (!clip?.trim()) return err('Zwischenablage leer oder nicht lesbar.');
                input = clip.trim();
            }
            const result = validateIban(input);
            if (!result.ok) {
                const reasons: Record<string, string> = {
                    format: 'Format ungültig',
                    length: 'Länge passt nicht zum Land',
                    checksum: 'Prüfsumme falsch',
                    country: 'Land nicht unterstützt',
                };
                return err(`${reasons[result.reason]} — ${formatIban(result.iban)}`);
            }
            const formatted = formatIban(result.iban);
            const lines = [
                formatted,
                `${ibanCountryName(result.country)} · ${result.bank}`,
                result.bic !== '—' ? `BIC ${result.bic}` : '',
            ]
                .filter(Boolean)
                .join('\n');
            return ok(lines, formatted);
        },
    },
    {
        name: 'hash',
        description: 'SHA-256 Hash berechnen',
        usage: '/hash <text>',
        async execute(args) {
            if (!args.trim()) return err('Text fehlt — z. B. /hash hallo');
            const hex = await sha256Hex(args);
            return ok(hex);
        },
    },
    {
        name: 'b64e',
        description: 'Base64 encodieren',
        usage: '/b64e <text>',
        execute(args) {
            if (!args.trim()) return err('Text fehlt — z. B. /b64e hallo');
            try {
                return ok(base64Encode(args));
            } catch {
                return err('Encoding fehlgeschlagen.');
            }
        },
    },
    {
        name: 'b64d',
        description: 'Base64 decodieren',
        usage: '/b64d <text>',
        execute(args) {
            if (!args.trim()) return err('Text fehlt — z. B. /b64d aGFsbG8=');
            try {
                return ok(base64Decode(args));
            } catch {
                return err('Ungültiger Base64-String.');
            }
        },
    },
    {
        name: 'slug',
        description: 'URL-Slug erzeugen',
        usage: '/slug <text>',
        execute(args) {
            if (!args.trim()) return err('Text fehlt — z. B. /slug Mein Blog Post');
            return ok(slugify(args));
        },
    },
    {
        name: 'ts',
        description: 'Aktuellen ISO-Zeitstempel',
        usage: '/ts',
        execute() {
            const iso = new Date().toISOString();
            return ok(iso);
        },
    },
    {
        name: 'len',
        description: 'Zeichen, Wörter und Zeilen zählen',
        usage: '/len <text>',
        execute(args) {
            if (!args.trim()) return err('Text fehlt — z. B. /len hallo welt');
            const { chars, words, lines } = countText(args);
            const output = `${chars} Zeichen · ${words} Wörter · ${lines} Zeilen`;
            return { status: 'info', output, copyText: output, feedback: 'Zähler kopiert' };
        },
    },
    {
        name: 'qr',
        description: 'QR-Code als Vorschau erzeugen',
        usage: '/qr <text>',
        async execute(args) {
            if (!args.trim()) return err('Text fehlt — z. B. /qr https://macheseinfa.ch');
            const dataUrl = await generateQrDataUrl(args.trim(), 256);
            return {
                status: 'success',
                output: args.trim(),
                copyText: args.trim(),
                imageDataUrl: dataUrl,
                feedback: 'Text kopiert · QR-Vorschau',
            };
        },
    },
];

const byName = new Map<string, SlashCommand>();
for (const cmd of commands) {
    byName.set(cmd.name, cmd);
    for (const alias of cmd.aliases ?? []) byName.set(alias, cmd);
}

export const slashCommands = commands;

export function getSlashCommand(name: string): SlashCommand | undefined {
    return byName.get(name.toLowerCase());
}

export function filterSlashCommands(query: string): SlashCommand[] {
    const trimmed = query.trim();
    if (!trimmed.startsWith('/')) return [];
    const body = trimmed.slice(1).trim();
    if (!body) return commands;
    const namePart = body.split(/\s/)[0]?.toLowerCase() ?? '';
    return commands.filter(
        (c) =>
            c.name.startsWith(namePart) ||
            (c.aliases?.some((a) => a.startsWith(namePart)) ?? false),
    );
}

export async function executeSlashInput(query: string): Promise<CommandResult> {
    const trimmed = query.trim();
    if (!trimmed.startsWith('/')) {
        return err('Kein Befehl — Eingabe muss mit / beginnen.');
    }
    const body = trimmed.slice(1).trim();
    if (!body) {
        const help = commands.map((c) => `${c.usage} — ${c.description}`).join('\n');
        return info(help);
    }
    const space = body.indexOf(' ');
    const name = (space === -1 ? body : body.slice(0, space)).toLowerCase();
    const args = space === -1 ? '' : body.slice(space + 1).trim();
    const cmd = getSlashCommand(name);
    if (!cmd) return err(`Unbekannter Befehl „/${name}". Tippe / für Hilfe.`);
    return cmd.execute(args);
}
