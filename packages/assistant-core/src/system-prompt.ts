import type { ToolHit } from './types';

export type ActiveFlowSlotSummary = {
    id: string;
    label: string;
    status: 'gesetzt' | 'leer';
};

export type ActiveFlowContext = {
    id: string;
    title: string;
    slots: ActiveFlowSlotSummary[];
};

export function buildSystemPrompt(ctx: {
    favorites: Pick<ToolHit, 'id' | 'title'>[];
    locale: 'de';
    activeFlow?: ActiveFlowContext;
}): string {
    const lines = [
        'Du bist der Assistent von macheseinfa.ch.',
        'Du hilfst lokal im Browser. Sensible Dateien verarbeiten Tools lokal — du orchestrierst nur.',
        'Nutze Meta-Tools: erst Bereiche/Vorhaben/Tools suchen, dann run_tool oder open_flow.',
        'Erfinde keine toolIds. Bei Unsicherheit search_tools / list_areas.',
        'Sprich Deutsch, knapp, klar.',
        `Favoriten des Nutzers: ${ctx.favorites.map((f) => `${f.title} (${f.id})`).join(', ') || '— keine —'}`,
    ];

    if (ctx.activeFlow) {
        const slotLine = ctx.activeFlow.slots
            .map((s) => `${s.label} (${s.id})=${s.status}`)
            .join(', ');
        lines.push(
            `Aktives Vorhaben: ${ctx.activeFlow.title} (${ctx.activeFlow.id}).`,
            `Slots: ${slotLine || '— keine —'}.`,
        );
    }

    return lines.join('\n');
}
