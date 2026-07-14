import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta = {
    title: 'Primitives/Input',
    component: Input,
    tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: 'Email',
        placeholder: 'you@example.com',
        hint: 'We never share your address.',
    },
};

export const WithoutLabel: Story = {
    args: {
        placeholder: 'Search products…',
    },
};
