import {
    areaOrder,
    areas,
    getAreaBySlug,
    getTool,
    searchTools,
    stories,
    type AreaId,
    type StoryId,
    type ToolId,
} from '../data/catalog';
import { searchPath, storyPath, vorhabenPath } from '../routing/paths';

export type ComposerCommandContext = {
    startFreshThread: () => void;
    selectArea: (areaId: AreaId) => void;
    selectStory: (storyId: StoryId) => void;
    selectTool: (toolId: ToolId) => void;
    listFavorites: () => ToolId[];
    goToSearch: (query?: string) => void;
    goToVorhaben: (areaSlug?: string) => void;
    attachFromClipboard: () => Promise<void>;
    injectAssistantReply: (text: string) => void;
    navigate: (href: string) => void;
};

export type ComposerSlashCommand = {
    name: string;
    description: string;
    usage: string;
    aliases?: string[];
    /** When true, selecting from menu runs immediately (no args needed). */
    instant?: boolean;
};

export const composerSlashCommands: ComposerSlashCommand[] = [
    {
        name: 'hilfe',
        description: 'Alle Befehle anzeigen',
        usage: '/hilfe',
        instant: true,
    },
    {
        name: 'neu',
        description: 'Neuen Chat starten',
        usage: '/neu',
        instant: true,
    },
    {
        name: 'tool',
        description: 'Tool suchen und öffnen',
        usage: '/tool <name>',
    },
    {
        name: 'bereich',
        description: 'Bereich öffnen',
        usage: '/bereich <slug>',
        aliases: ['area'],
    },
    {
        name: 'vorhaben',
        description: 'Vorhaben suchen oder Übersicht öffnen',
        usage: '/vorhaben [suche]',
        aliases: ['flow'],
    },
    {
        name: 'favorit',
        description: 'Favoriten anzeigen',
        usage: '/favorit',
        aliases: ['favoriten', 'fav'],
        instant: true,
    },
    {
        name: 'suche',
        description: 'Globale Suche öffnen',
        usage: '/suche [query]',
        aliases: ['search'],
    },
    {
        name: 'clipboard',
        description: 'Text aus Zwischenablage anhängen',
        usage: '/clipboard',
        aliases: ['paste'],
        instant: true,
    },
];

const byName = new Map<string, ComposerSlashCommand>();
for (const cmd of composerSlashCommands) {
    byName.set(cmd.name, cmd);
    for (const alias of cmd.aliases ?? []) byName.set(alias, cmd);
}

export type ParsedComposerSlash = {
    commandName: string;
    args: string;
};

export function parseComposerSlashInput(text: string): ParsedComposerSlash | null {
    const trimmed = text.trim();
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

export function isComposerSlashMode(text: string): boolean {
    return text.startsWith('/');
}

export function filterComposerSlashCommands(text: string): ComposerSlashCommand[] {
    const parsed = parseComposerSlashInput(text);
    if (!parsed) return [];
    if (!parsed.commandName) return composerSlashCommands;
    return composerSlashCommands.filter(
        (cmd) =>
            cmd.name.startsWith(parsed.commandName) ||
            (cmd.aliases?.some((a) => a.startsWith(parsed.commandName)) ?? false),
    );
}

function resolveAreaId(input: string): AreaId | null {
    const raw = input.trim().toLowerCase();
    if (!raw) return null;
    const bySlug = getAreaBySlug(raw);
    if (bySlug) return bySlug.id;
    if (raw in areas) return raw as AreaId;
    return null;
}

function formatHelp(): string {
    return composerSlashCommands.map((c) => `${c.usage} — ${c.description}`).join('\n');
}

function searchStories(query: string, areaId?: AreaId) {
    const q = query.trim().toLowerCase();
    let list = Object.values(stories);
    if (areaId) list = list.filter((s) => s.areaIds.includes(areaId));
    if (!q) return list.slice(0, 8);
    return list
        .filter(
            (s) =>
                s.outcome.toLowerCase().includes(q) ||
                s.situation.toLowerCase().includes(q) ||
                s.title.toLowerCase().includes(q) ||
                s.slug.includes(q),
        )
        .slice(0, 8);
}

export type ComposerCommandResult =
    | { handled: true; clearDraft?: boolean }
    | { handled: false };

export async function executeComposerSlash(
    text: string,
    ctx: ComposerCommandContext,
): Promise<ComposerCommandResult> {
    const parsed = parseComposerSlashInput(text);
    if (!parsed) return { handled: false };

    if (!parsed.commandName) {
        ctx.injectAssistantReply(formatHelp());
        return { handled: true, clearDraft: true };
    }

    const cmd = byName.get(parsed.commandName);
    if (!cmd) return { handled: false };

    switch (cmd.name) {
        case 'hilfe': {
            ctx.injectAssistantReply(formatHelp());
            return { handled: true, clearDraft: true };
        }
        case 'neu': {
            ctx.startFreshThread();
            ctx.injectAssistantReply('Neuer Chat gestartet.');
            return { handled: true, clearDraft: true };
        }
        case 'tool': {
            const hits = searchTools(parsed.args);
            if (!parsed.args.trim()) {
                ctx.injectAssistantReply('Nutze z. B. `/tool iban` oder `/tool pdf verkleinern`.');
                return { handled: true, clearDraft: true };
            }
            if (hits.length === 1) {
                ctx.selectTool(hits[0].id);
                ctx.injectAssistantReply(`Öffne „${hits[0].shortTitle}“.`);
                return { handled: true, clearDraft: true };
            }
            if (hits.length === 0) {
                ctx.injectAssistantReply(`Kein Tool für „${parsed.args}“ gefunden.`);
                return { handled: true, clearDraft: true };
            }
            const lines = hits
                .slice(0, 6)
                .map((t) => `• ${t.shortTitle} — ${t.sub}`)
                .join('\n');
            ctx.injectAssistantReply(`Mehrere Treffer:\n${lines}\n\nPräzisiere mit \`/tool …\`.`);
            return { handled: true, clearDraft: true };
        }
        case 'bereich': {
            if (!parsed.args.trim()) {
                const lines = areaOrder
                    .map((id) => `• ${areas[id].label} (\`${areas[id].slug}\`)`)
                    .join('\n');
                ctx.injectAssistantReply(`Bereiche:\n${lines}\n\nNutze \`/bereich bilder\`.`);
                return { handled: true, clearDraft: true };
            }
            const areaId = resolveAreaId(parsed.args);
            if (!areaId) {
                ctx.injectAssistantReply(`Bereich „${parsed.args}“ nicht gefunden.`);
                return { handled: true, clearDraft: true };
            }
            ctx.selectArea(areaId);
            ctx.injectAssistantReply(`Öffne Bereich „${areas[areaId].label}“.`);
            return { handled: true, clearDraft: true };
        }
        case 'vorhaben': {
            if (!parsed.args.trim()) {
                ctx.goToVorhaben();
                ctx.injectAssistantReply('Vorhaben-Übersicht geöffnet.');
                return { handled: true, clearDraft: true };
            }
            const matches = searchStories(parsed.args);
            if (matches.length === 1) {
                const story = matches[0];
                const areaId = story.areaIds[0];
                if (areaId) {
                    ctx.navigate(storyPath(areaId, story.id));
                    ctx.injectAssistantReply(`Öffne Vorhaben „${story.outcome}“.`);
                }
                return { handled: true, clearDraft: true };
            }
            if (matches.length === 0) {
                ctx.goToVorhaben();
                ctx.injectAssistantReply(
                    `Kein Vorhaben für „${parsed.args}“ — Übersicht geöffnet.`,
                );
                return { handled: true, clearDraft: true };
            }
            const lines = matches.map((s) => `• ${s.outcome}`).join('\n');
            ctx.injectAssistantReply(`Treffer:\n${lines}\n\nNutze \`/vorhaben <genauer>\`.`);
            return { handled: true, clearDraft: true };
        }
        case 'favorit': {
            const ids = ctx.listFavorites();
            if (ids.length === 0) {
                ctx.injectAssistantReply('Noch keine Favoriten — markiere Tools mit dem Stern.');
            } else {
                const lines = ids.map((id) => `• ${getTool(id).shortTitle}`).join('\n');
                ctx.injectAssistantReply(`Deine Favoriten in der Seitenleiste:\n${lines}`);
            }
            return { handled: true, clearDraft: true };
        }
        case 'suche': {
            ctx.goToSearch(parsed.args || undefined);
            ctx.injectAssistantReply(
                parsed.args.trim()
                    ? `Suche nach „${parsed.args}“ geöffnet.`
                    : 'Globale Suche geöffnet.',
            );
            return { handled: true, clearDraft: true };
        }
        case 'clipboard': {
            await ctx.attachFromClipboard();
            ctx.injectAssistantReply('Zwischenablage angehängt — sende deine Nachricht.');
            return { handled: true, clearDraft: false };
        }
        default:
            return { handled: false };
    }
}

export function buildComposerSlashDraft(cmd: ComposerSlashCommand, args = ''): string {
    if (!args.trim()) return `/${cmd.name}`;
    return `/${cmd.name} ${args.trim()}`;
}
