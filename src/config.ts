import process from "node:process";
/**Import avatar image here  `import avatarImg from './assets/images/site/avatar.svg`; */
/** Import ogDefaultImg here from `./assets/images/site/og-default.svg'; */
import type { GiscusConfig, NavItem, SiteConfig, SocialLink }

export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

export const siteConfig: SITE_CONFIG = {
	/** Default site title for homepage <title> and meta */
	title: "WeisGarden",
	/** Site tagline and description */
    description: "The digital garden of Andrew Weisbeck",
    /** Author and hanle info for Footer + Meta */
    author: {
        name: 'Andrew Weisbeck',
        url: GITHUB_HANDLE ? `https://github.com/${GITHUB_HANDLE}` : undefined;
    }
};
