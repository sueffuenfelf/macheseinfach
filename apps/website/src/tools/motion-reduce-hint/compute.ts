import type { FieldValues, GenerateOutput } from '../_shared/shells';

export function generateMotionReduceHint(_values: FieldValues): GenerateOutput {
    const css = `@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`;
    const lines = [
        '# Motion & Animation — Checkliste',
        '',
        '1. [ ] Keine Auto-Play-Videos mit Ton',
        '2. [ ] Parallax/Scroll-Animationen abschaltbar oder reduziert',
        '3. [ ] prefers-reduced-motion respektieren',
        '4. [ ] Keine blinkenden Inhalte (>3/s)',
        '5. [ ] Lade-Spinner mit aria-live/status',
        '',
        'CSS-Snippet:',
        '```css',
        css,
        '```',
    ];
    return { kind: 'text', content: lines.join('\n'), filename: 'motion-checkliste.md' };
}
