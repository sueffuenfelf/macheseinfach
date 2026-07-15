import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { staticSeoPlugin } from './vite-plugin-static-seo';

export default defineConfig({
    plugins: [react(), tailwindcss(), staticSeoPlugin()],
    define: {
        'process.env': {},
    },
    optimizeDeps: {
        exclude: ['@xenova/transformers'],
        esbuildOptions: {
            define: {
                'process.env': '{}',
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('@xenova/transformers')) return 'transformers';
                },
            },
        },
    },
    server: { port: 5173 },
});
