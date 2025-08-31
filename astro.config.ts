// @ts-check
import fs from "node:fs";

import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import icon from 'astro-icon';
import expressiveCode from 'astro-expressive-code';
import webmanifest from 'astro-webmanifest';
import robotsTxt from "astro-robots-txt";
// Rehype plugins
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
// Remark plugins
import remarkDirective from "remark-directive";
import { remarkAdmonitions } from "./src/plugins/remark-admonitions"

import { expressiveCodeOptions, siteConfig } from './src/site.config';


// https://astro.build/config
export default defineConfig({
  site: siteConfig.url,
  image: {
    domains: ["webmention.io"]
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
  }), 
  robotsTxt()
  ],
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg.js"],
    },
    plugins: [tailwindcss(), rawFonts([".ttf", ".woff"])],
  },
  env: {
    schema: {
      WEBMENTION_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      WEBMENTION_URL: envField.string({ context: "client", access: "public", optional: true }),
      WEBMENTION_PINGBACK: envField.string({ context: "client", access: "public", optional: true }),
    },
  },
  adapter: netlify()
});

function rawFonts(ext: string[]) {
  return {
    name: "vite-plugin-raw-fonts",
    // @ts-expect-error:next-line
    transform(_, id) {
      if (ext.some((e) => id.endsWith(e))) {
        const buffer = fs.readFileSync(id);
        return {
          code: `export default ${JSON.stringify(buffer)}`,
          map: null,
        };
      }
    },
  };
}