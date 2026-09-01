import type { ToolHit } from './types';

export function buildSystemPrompt(ctx: {
    favorites: Pick<ToolHit, 'id' | 'title'>[];
    locale: 'de';
}): string {
    return [
        'Du bist der Assistent von macheseinfa.ch.',
        'Du hilfst lokal im Browser. Sensible Dateien verarbeiten Tools lokal — du orchestrierst nur.',
        'Nutze Meta-Tools: erst Bereiche/Tools suchen, dann run_tool oder open_tool.',
        'Erfinde keine toolIds. Bei Unsicherheit search_tools / list_areas.',
        'Sprich Deutsch, knapp, klar.',
        `Favoriten des Nutzers: ${ctx.favorites.map((f) => `${f.title} (${f.id})`).join(', ') || '— keine —'}`,
    ].join('\n');
}
