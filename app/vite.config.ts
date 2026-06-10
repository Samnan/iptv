import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const channelsSrc = path.resolve(__dirname, '../channels');

function copyChannelsPlugin() {
  return {
    name: 'copy-channels-folder',
    closeBundle: async () => {
      const distChannels = path.resolve(__dirname, 'dist/channels');
      await fs.mkdir(distChannels, { recursive: true });
      await fs.cp(channelsSrc, distChannels, { recursive: true });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyChannelsPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
