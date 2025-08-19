// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

import netlify from '@astrojs/netlify';

import icon from 'astro-icon';

import expressiveCode from 'astro-expressive-code';

import webmanifest from 'astro-webmanifest';

import robotsTxt from "astro-robots-txt";

import { expressiveCodeOptions, siteConfig } from './src/site.config';

// https://astro.build/config
export default defineConfig({
  site: "https://weisgarden.netlify.app",
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    expressiveCode(expressiveCodeOptions), 
    alpinejs(), 
    mdx(), 
    sitemap(), 
    icon(), 
    mdx(), 
    webmanifest({
      name: "WeisGarden - Andrew's Digital Garden",
      short_name: "WeisGarden",
      description: "A digital garden for Andrew Weis's notes, ideas, and projects.",
      theme_color: "#ffffff",
    // icons: [
    //   {
    //     src: "/icon-192.png",
    //     sizes: "192x192",
    //     type: "image/png"
    //   },
    // ],
    // start_url: "/",
    // display: "standalone",
    // background_color: "#ffffff",
    // scope: "/"
  }), robotsTxt()],
  adapter: netlify()
});