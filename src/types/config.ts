import type { Locale } from "../config";
import type { ImageMetaData } from "astro";

export interface SiteConfig {
	title: string;
	description: string;
	author: {
		name: string;
		url?: string;
		avatar?: string | ImageMetaData;
		bio?: string;
	};
	defaultOgImage: string;
	postsPerPage: number;
	isoDates: boolean;
	showFeaturedImages: boolean;
	boxedArticles: boolean;
	dynamicPostCardHeight: boolean;
	autoOgImage: boolean;
	showPrivacyPolicy: boolean;
	footer: {
		/** Optional full override for left footer line for {year} and {author} */
		leftText?: string;
		/** Optional custom text shown before the site link in right footer line */
		rightText?: string;
		/** Whether to show Privacy Policy in footer */
		showPrivacyPolicy?: boolean;
		/** Show site credits in footer right side. */
		showThemeCredits?: boolean;
		/** Site label text used by right ofoter link */
		siteName: string;
		/** site repo URL used by right footer link` */
		repoUrl: string;
	};
	url: string;
	locales: readonly Locale[];
	defaultLocale: Locale;
	multilingual: boolean;
}

export interface NavItem {
	/** Unique key matching i18n.ts etries. */
	key: string;
	/** Path w/out leading locale prefix. Renderer adds it */
	href: string;
	/** Optional icon name */
	icon?: string;
}

export interface SocialLink {
	label: string;
	href: string;
	icon: string;
}

export interface GiscusConfig {
	/** Master switch */
	enabled: boolean;
	/** GitHub repo (e.g. `user/repo`) */
	repo: string;
	/** Repo ID from giscus.app */
	repoId: string;
	/** Discussion category */
	category: string;
	/** Category ID */
	categoryId: string;
	/** Discussion mapping strategy */
	mapping: "pathname" | "url" | "title" | "og:title" | "specific" | "number";
	/** strict matching */
	strict: "0" | "1";
	/** Enable reactions on the main post. */
	reactionsEnabled: "0" | "1";
	/** Emit metadata events */
	emitMetadata: "0" | "1";
	/** Comment input position */
	inputPosition: "top" | "bottom";
	/** Lazy load */
	loading: "lazy" | "eager";
}
