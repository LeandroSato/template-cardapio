// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cardapio from './src/data/cardapio.json' with { type: 'json' };

// A URL final do cliente vem do cardapio.json (usada no sitemap e no Open Graph).
export default defineConfig({
  site: cardapio.restaurante.url,
  integrations: [sitemap()],
  // A barra de ferramentas do Astro cobre o botão fixo de pedido no celular.
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
  },
});
