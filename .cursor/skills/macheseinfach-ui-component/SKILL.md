---
name: macheseinfach-ui-component
description: >-
  Adds React components to @macheseinfach/ui (primitives or composed), with
  Storybook stories and barrel exports. Use when extending the design system,
  Gumroad-inspired UI, or shared components for apps.
---

# Neue UI-Komponente (@macheseinfach/ui)

Package: `packages/ui` — neo-brutalist Gumroad-Stil, Tailwind v4, Design-Tokens in `src/styles/theme.css`.

## Wo ablegen?

| Art | Pfad | Wann |
| --- | --- | --- |
| **Primitive** | `packages/ui/src/primitives/<Name>.tsx` | Generisch wiederverwendbar (Button, Input, Card, …) |
| **Composed** | `packages/ui/src/components/<Name>.tsx` | Zusammengesetzt aus Primitives (ProductCard, CreatorHeader) |

**Regel:** Erst vorhandene Primitives erweitern/kombinieren — keine One-off-Styles in Apps, wenn es ins Design System gehört.

## Workflow

```text
- [ ] Komponente in primitives/ oder components/ anlegen
- [ ] Props-Typ exportieren (`export type XxxProps`)
- [ ] Story: <Name>.stories.tsx (gleicher Ordner)
- [ ] Optional: <Name>.test.tsx für Export/Smoke
- [ ] Barrel: packages/ui/src/index.ts
- [ ] Storybook prüfen: bun run storybook
```

## Komponenten-Muster

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type MyWidgetProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary';
    children: ReactNode;
};

export function MyWidget({ variant = 'primary', className = '', children, ...props }: MyWidgetProps) {
    return (
        <button
            type="button"
            className={`…tokens… ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
```

Referenz: `packages/ui/src/primitives/Button.tsx`.

## Styling-Regeln

- **Tokens statt Hardcodes:** `var(--color-ink)`, `var(--radius-pill)`, `var(--shadow-brutal)` aus `theme.css`.
- **Tailwind v4:** Utility-Klassen inline; `@theme` erweitern nur für globale Tokens.
- **Focus:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`.
- **Varianten:** `Record<Variant, string>` wie bei Button — kein `cva` unless schon im Repo etabliert.

## Storybook

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MyWidget } from './MyWidget';

const meta = {
    title: 'Primitives/MyWidget', // oder 'Components/…'
    component: MyWidget,
    tags: ['autodocs'],
} satisfies Meta<typeof MyWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Label' } };
```

Referenz: `packages/ui/src/primitives/Button.stories.tsx`.

## Barrel export

```ts
export { MyWidget, type MyWidgetProps } from './primitives/MyWidget';
```

## In Apps nutzen

```tsx
import { Button } from '@macheseinfach/ui';
import '@macheseinfach/ui/theme.css';
```

Website hängt per `workspace:*` an `@macheseinfach/ui` — nach Änderungen kein publish nötig, Dev-Server neu laden.

## Verifikation

```bash
bun run --filter @macheseinfach/ui build
bun run --filter @macheseinfach/ui test
bun run storybook
bun run format
```

## Anti-Patterns

- Keine App-spezifische Business-Logik im UI-Package.
- Keine neuen Farben inline — Area-Farben sind `--color-area-*` in `theme.css`.
- Kein Ordner ohne Export in `index.ts` (toter Code).
