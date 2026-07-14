import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';

const meta = {
    title: 'Primitives/Text',
    component: Text,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['display', 'title', 'body', 'caption'],
        },
        as: {
            control: 'select',
            options: ['p', 'span', 'h1', 'h2', 'h3'],
        },
    },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Display: Story = {
    args: { variant: 'display', as: 'h1', children: 'Sell digital products' },
};

export const Title: Story = {
    args: { variant: 'title', as: 'h2', children: 'Pricing that scales with you' },
};

export const Body: Story = {
    args: {
        variant: 'body',
        children: 'Creator-first copy with muted ink for supporting paragraphs.',
    },
};

export const Caption: Story = {
    args: { variant: 'caption', children: 'Updated 2 days ago' },
};
