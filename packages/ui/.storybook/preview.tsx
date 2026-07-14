import type { Preview } from '@storybook/react-vite';
import './preview.css';

const preview: Preview = {
    parameters: {
        layout: 'padded',
        controls: {
            matchers: {
                color: /(background|color|tone)$/i,
            },
        },
        options: {
            storySort: {
                order: ['Introduction', 'Primitives', 'Components', '*'],
                method: 'alphabetical',
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="min-h-[240px] bg-[var(--color-canvas)] p-6 text-[var(--color-ink)]">
                <Story />
            </div>
        ),
    ],
};

export default preview;
