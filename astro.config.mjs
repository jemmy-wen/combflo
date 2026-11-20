import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  devToolbar: { enabled: false },
  output: 'static',
  adapter: vercel(),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  server: { port: 4323 },
});
