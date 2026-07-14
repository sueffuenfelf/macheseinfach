import type { Meta, StoryObj } from '@storybook/react-vite';
import { CreatorHeader } from './CreatorHeader';

const meta = {
    title: 'Components/CreatorHeader',
    component: CreatorHeader,
    tags: ['autodocs'],
} satisfies Meta<typeof CreatorHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        name: 'Macheseinfach',
        handle: 'macheseinfach',
        bio: 'Creator-commerce UI kit — Gumroad-inspired primitives and components.',
        productCount: 12,
    },
};

export const SoloCreator: Story = {
    args: {
        name: 'Elena Joao',
        handle: 'teigverliebt',
        bio: 'Sauerteigpizza foodtruck for events in Südbaden.',
        productCount: 3,
    },
};
