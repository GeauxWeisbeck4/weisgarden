/**
 * Everything shown on the About page. Edit this file to update your profile.
 */

export interface SocialLink {
	name: string;
	url: string;
	/** astro-icon name, e.g. "logos/github" (src/icons/logos/github.svg) or "mdi:linkedin" */
	icon: string;
	/** adds rel="me" so sites like Mastodon/IndieWeb can verify the link */
	rel?: string;
}

export interface Experience {
	role: string;
	company: string;
	/** e.g. "2023 – Present" */
	period: string;
	summary: string;
	url?: string;
}

export interface Skill {
	name: string;
	/** astro-icon name of the logo */
	icon: string;
	/** brand colour for the logo; leave out to use the text colour (for black/white logos) */
	color?: string;
	/** 0–100 */
	level: number;
}

export interface Project {
	name: string;
	description: string;
	language: string | undefined;
	stars: number;
	url: string;
	homepage?: string;
}

export const profile = {
	name: "Andrew Weisbeck",
	title: "Full Stack Developer",
	location: "Durham, NC",
	tagline:
		"Full stack developer, entrepreneur, and writer. Fan of Deno, TypeScript, Rust, and software design.",
	/** placeholder: drop your photo in public/images/ and point this at it */
	image: "/images/profile-placeholder.svg",
	imageAlt: "Portrait of Andrew Weisbeck",
};

export const socialLinks: SocialLink[] = [
	{ name: "GitHub", url: "https://github.com/GeauxWeisbeck4", icon: "logos/github", rel: "me" },
	{
		name: "Bluesky",
		url: "https://bsky.app/profile/geauxweisbeck4.bsky.social",
		icon: "logos/bluesky",
		rel: "me",
	},
	{ name: "X (Twitter)", url: "https://x.com/geauxweisbeck4", icon: "logos/x", rel: "me" },
	{ name: "YouTube", url: "https://www.youtube.com/@geauxweisbeck4", icon: "logos/youtube" },
	{ name: "DEV Community", url: "https://dev.to/geauxweisbeck4", icon: "logos/devdotto" },
];

/** TODO: placeholders, replace with your real work history (shown newest first, in this order) */
export const experience: Experience[] = [
	{
		role: "Your current role",
		company: "Company name",
		period: "2024 – Present",
		summary: "One or two sentences about what you build there and the impact you've had.",
	},
	{
		role: "Previous role",
		company: "Company name",
		period: "2022 – 2024",
		summary: "One or two sentences about what you built and the tools you used.",
	},
	{
		role: "Previous role",
		company: "Company name",
		period: "2020 – 2022",
		summary: "One or two sentences about what you built and the tools you used.",
	},
	{
		role: "Previous role",
		company: "Company name",
		period: "2018 – 2020",
		summary: "One or two sentences about what you built and the tools you used.",
	},
	{
		role: "Earlier role",
		company: "Company name",
		period: "2016 – 2018",
		summary: "One or two sentences about what you built and the tools you used.",
	},
];

/** TODO: the levels are placeholders, set each one to how you rate yourself (0–100) */
export const skills: Skill[] = [
	{ name: "JavaScript", icon: "logos/javascript", color: "#F7DF1E", level: 90 },
	{ name: "TypeScript", icon: "logos/typescript", color: "#3178C6", level: 85 },
	{ name: "React", icon: "logos/react", color: "#61DAFB", level: 80 },
	{ name: "Deno", icon: "logos/deno", level: 80 },
	{ name: "Node.js", icon: "logos/nodedotjs", color: "#5FA04E", level: 80 },
	{ name: "Astro", icon: "logos/astro", color: "#BC52EE", level: 85 },
	{ name: "Python", icon: "logos/python", color: "#3776AB", level: 65 },
	{ name: "Rust", icon: "logos/rust", level: 40 },
	{ name: "Svelte", icon: "logos/svelte", color: "#FF3E00", level: 60 },
	{ name: "HTML", icon: "logos/html5", color: "#E34F26", level: 95 },
	{ name: "CSS", icon: "logos/css3", color: "#1572B6", level: 90 },
	{ name: "Tailwind CSS", icon: "logos/tailwindcss", color: "#06B6D4", level: 85 },
	{ name: "Supabase", icon: "logos/supabase", color: "#3FCF8E", level: 70 },
	{ name: "PostgreSQL", icon: "logos/postgresql", color: "#4169E1", level: 65 },
	{ name: "Docker", icon: "logos/docker", color: "#2496ED", level: 55 },
	{ name: "Git", icon: "logos/git", color: "#F05032", level: 85 },
];

/** Your 20 most recently updated original GitHub repos (as of Nov 28, 2026), with a description */
export const projects: Project[] = [
	{
		name: "SupaSnake.js",
		description:
			"A full-stack version of Snake, built with Supabase, React, Vite, and Tailwind CSS.",
		language: "TypeScript",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/SupaSnake.js",
		homepage: "https://supasnakejs.netlify.app",
	},
	{
		name: "weisgarden",
		description:
			"Digital garden for Andrew Weisbeck. Props to the `astro-theme-cactus` by @chrismwilliams for the sick starter template.",
		language: "Astro",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/weisgarden",
	},
	{
		name: "geaux-tweet",
		description:
			"A Twitter clone called Geaux Tweet, which allows you to tweet with authenticated users. Built with Next.js, Tailwind CSS, Supabase, and Vercel.",
		language: "TypeScript",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/geaux-tweet",
		homepage: "https://geaux-tweet.vercel.app",
	},
	{
		name: "streetlifedigest.blog",
		description: "Blog about how to survive homelessness.",
		language: "MDX",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/streetlifedigest.blog",
	},
	{
		name: "productengagementsprint-section4",
		description: "Product engagement sprint blog and website for Section 4",
		language: "JavaScript",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/productengagementsprint-section4",
		homepage: "geauxengagingproducts.vercel.app",
	},
	{
		name: "andrewweisbeck-portfolio",
		description:
			"My portfolio website - for now. Using the astro-theme-cody by kirontoo as a placeholder while I code my own from scratch.",
		language: "Astro",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/andrewweisbeck-portfolio",
	},
	{
		name: "andrews-obisidan-garden-dell",
		description: "My digital garden built with Quartz and Obsidian",
		language: "TypeScript",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/andrews-obisidan-garden-dell",
	},
	{
		name: "astro-geauxweisbeck4-incomplete",
		description: "The third version of GeauxWeisbeck4.dev",
		language: "Astro",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/astro-geauxweisbeck4-incomplete",
		homepage: "https://geauxweisbeck4.dev",
	},
	{
		name: "11ty-digital-garden",
		description:
			"An 11ty starter project that makes setting up a digital garden simple and extensible.",
		language: "JavaScript",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/11ty-digital-garden",
	},
	{
		name: "tar-heel-dev-studio-v3",
		description:
			"Tar Heel Dev Studio company website for marketing, education, and providing services to small businesses and non-profits.",
		language: "Astro",
		stars: 2,
		url: "https://github.com/GeauxWeisbeck4/tar-heel-dev-studio-v3",
		homepage: "https://tarheeldevstudio.com",
	},
	{
		name: "digital-garden-v1-old",
		description: "The digital garden of Andrew Weisbeck. Built with Astro.js and friends.",
		language: "XSLT",
		stars: 1,
		url: "https://github.com/GeauxWeisbeck4/digital-garden-v1-old",
	},
	{
		name: "day-NN-project-slug",
		description: "Template for 50 days of projects - Typescript/JavaScript",
		language: undefined,
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/day-NN-project-slug",
	},
	{
		name: "day-01-commit-constellation",
		description: "The first project from my 50 days of projects super-project that I am working on",
		language: undefined,
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/day-01-commit-constellation",
	},
	{
		name: "todo-node-cli",
		description: "Create a todo list with the CLI!",
		language: "JavaScript",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/todo-node-cli",
	},
	{
		name: "dailydevprojects",
		description: "My journal site for documenting my daily JavaScript projects I complete",
		language: "HTML",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/dailydevprojects",
	},
	{
		name: "geauxcode.dev",
		description: "The Geaux Code Blog, created from the astro-solitude theme by @everfu",
		language: "TypeScript",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/geauxcode.dev",
	},
	{
		name: "geaux-brand-strategy-site",
		description: "My website and blog for the brand strategy sprint",
		language: "Nunjucks",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/geaux-brand-strategy-site",
	},
	{
		name: "calendeno-cli",
		description: "A calendar CLI tool, built with Deno, Deno KV, and Typescript.",
		language: "TypeScript",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/calendeno-cli",
	},
	{
		name: "GeauxManagement",
		description: "Website/Sprint Management for my Section 4 Managment Sprint",
		language: "Nunjucks",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/GeauxManagement",
	},
	{
		name: "litlogoanimation",
		description: "An animation of the Lit logo from the lit.dev playground",
		language: "TypeScript",
		stars: 0,
		url: "https://github.com/GeauxWeisbeck4/litlogoanimation",
		homepage: "https://studio.webcomponents.dev/view/JPf7gQikpIOLf2qeiIOB",
	},
];
