import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductCard } from './ProductCard';

const meta = {
    title: 'Components/ProductCard',
    component: ProductCard,
    tags: ['autodocs'],
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Notion Template Pack',
        creator: 'Studio M',
        priceLabel: '€19',
        description: 'Launch-ready creator templates with Gumroad-style polish.',
        tag: 'Digital',
    },
};

export const WithoutTag: Story = {
    args: {
        title: 'Preset Bundle',
        creator: 'Lightroom Lab',
        priceLabel: '€12',
        description: 'Soft contrast presets for product photography.',
    },
};
