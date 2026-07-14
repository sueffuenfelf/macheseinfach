import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { Text } from './Text';

const meta = {
    title: 'Primitives/Card',
    component: Card,
    tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padded: Story = {
    args: {
        children: (
            <>
                <Text variant="title">Card title</Text>
                <Text variant="body">Soft surface with Gumroad-style shadow and border.</Text>
            </>
        ),
    },
};

export const Unpadded: Story = {
    args: {
        padded: false,
        children: <div className="p-5">Custom padding inside an unpadded card shell.</div>,
    },
};
