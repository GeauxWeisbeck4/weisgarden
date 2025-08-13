import type { SiteConfig } from "./types.ts";

export const siteConfig: SiteConfig = {
  author: "Andrew Weisbeck",
  date: {
		locale: "en-US",
		options: {
			day: "numeric",
			month: "short",
			year: "numeric",
		},
	},
  description: "A digital garden for sharing knowledge about programming, computer enscience, system design, and a whole lot of other stuff!",
  lang: "en-US",
  ogLocale: "en_US",
  title: "Andrew's Digital Garden",
  url: "https://andrewsdigitalgarden.netlify.app",
};
