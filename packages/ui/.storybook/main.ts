import type { StorybookConfig } from '@storybook/react-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const config: StorybookConfig = {
    stories: ['../.storybook/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
    addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
    framework: '@storybook/react-vite',
    viteFinal: async (config) => {
        config.plugins = [...(config.plugins ?? []), react(), tailwindcss()];
        return config;
    },
};

export default config;
