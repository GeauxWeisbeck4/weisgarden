// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import mdx from '@astrojs/mdx';


import expressiveCode from 'astro-expressive-code';


// https://astro.build/config
export default defineConfig({
  site: "https://weisgarden.netlify.app",
  vite: {
    css: {
      transformer: "lightningcss",
    },
    plugins: [tailwindcss()],
  },

  integrations: [sitemap(), icon(), mdx(), expressiveCode()],
});