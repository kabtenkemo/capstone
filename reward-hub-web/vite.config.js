import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Serve static files from the repo root so `/tree/*.png` images
// located at the workspace root are available during local dev.
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5173
    },
    // Use the parent folder as the public dir for local dev only
    publicDir: '../'
});
