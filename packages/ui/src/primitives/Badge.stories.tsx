import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
    title: 'Primitives/Badge',
    component: Badge,
    tags: ['autodocs'],
    argTypes: {
        tone: {
            control: 'select',
            options: ['neutral', 'accent', 'success'],
        },
    },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
    args: { children: 'Draft', tone: 'neutral' },
};

export const Accent: Story = {
    args: { children: 'Featured', tone: 'accent' },
};

export const Success: Story = {
    args: { children: 'Published', tone: 'success' },
};
