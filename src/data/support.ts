/**
 * Everything shown on the Support page. Edit this file to update it.
 */

export interface CreatorPlatform {
	name: string;
	/** your page on the platform */
	url: string;
	/** astro-icon name of the logo (src/icons/logos/<name>.svg) */
	icon: string;
	/** brand colour for the logo */
	color: string;
	description: string;
	/** total earned on this platform, in `currency`. TODO: update these by hand */
	earned: number;
}

export const currency = "USD";

export const creatorPlatforms: CreatorPlatform[] = [
	{
		name: "Buy Me a Coffee",
		url: "https://buymeacoffee.com/geauxweisbeck4",
		icon: "logos/buymeacoffee",
		color: "#FFDD00",
		description:
			"A quick, one-off way to say thanks. Buy me a coffee (or a few) to keep the late-night coding sessions going.",
		earned: 0,
	},
	{
		name: "Ko-fi",
		url: "https://ko-fi.com/geauxweisbeck4",
		icon: "logos/kofi",
		color: "#FF5E5B",
		description:
			"Tip what you like, with no platform fees, and find the digital products, guides and templates I share there.",
		earned: 0,
	},
	{
		name: "Patreon",
		url: "https://www.patreon.com/geauxweisbeck4",
		icon: "logos/patreon",
		color: "#FF424D",
		description:
			"Become a monthly member for behind-the-scenes posts, early access to projects and member-only content.",
		earned: 0,
	},
	{
		name: "Open Collective",
		url: "https://opencollective.com/geauxweisbeck4",
		icon: "logos/opencollective",
		color: "#7FADF2",
		description:
			"Fund Tar Heel Dev Studio and WeisMind in the open. Every contribution and expense is public and transparent.",
		earned: 0,
	},
];

/**
 * Contact form. The site is static, so messages go through a form service.
 * TODO: create a free form at https://formspree.io, then paste its endpoint here,
 * e.g. "https://formspree.io/f/abcdwxyz". Until then the form is shown but can't be sent.
 */
export const contactFormAction = "";

export const newsletter = {
	name: "WeisMind Newsletter",
	url: "https://weismind.substack.com",
	description:
		"Writing on software development, computer science and entrepreneurship: how to become a developer and founder at the same time. Free and paid subscriptions both help.",
};
