import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z, ZodAny } from "astro/zod";

function removeDupsAndLowerCase(array: string[]) {
	return [...new Set(array.map((str) => str.toLowerCase()))];
}

const titleSchema = z.string();

const baseSchema = z.object({
	title: titleSchema,
});

const post = defineCollection({
	loader: glob({ base: "./content/posts", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		baseSchema.extend({
			description: z.string(),
			coverImage: z
				.object({
					alt: z.string(),
					src: image(),
				})
				.optional(),
			draft: z.boolean().default(false),
			ogImage: z.string().optional(),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			updatedDate: z
				.string()
				.optional()
				.transform((str) => (str ? new Date(str) : undefined)),
			pinned: z.boolean().default(false),
			status: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
		}),
});

const journal = defineCollection({
	loader: glob({ base: "./content/journals", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		baseSchema.extend({
			description: z.string(),
			coverImage: z
				.object({
					alt: z.string(),
					src: image(),
				})
				.optional(),
			draft: z.boolean().default(false),
			ogImage: z.string().optional(),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			pinned: z.boolean().default(false),
		}),
});

const project = defineCollection({
	loader: glob({ base: "./content/projects", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		baseSchema.extend({
			description: z.string(),
			coverImage: z
				.object({
					alt: z.string(),
					src: image(),
				})
				.optional(),
			draft: z.boolean().default(false),
			ogImage: z.string().optional(),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			updatedDate: z
				.string()
				.optional()
				.transform((str) => (str ? new Date(str) : undefined)),
			pinned: z.boolean().default(false),
			status: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
		}),
});

const note = defineCollection({
	loader: glob({ base: "./content/notes", pattern: "**/*.{md,mdx}" }),
	schema: baseSchema.extend({
		description: z.string().optional(),
		publishDate: z.iso
			.datetime({ offset: true }) // Ensures ISO 8601 format with offsets allowed (e.g. "2024-01-01T00:00:00Z" and "2024-01-01T00:00:00+02:00")
			.transform((val) => new Date(val)),
		tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
		status: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
	}),
});

const seedling = defineCollection({
	loader: glob({ base: "./content/seedlings", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		description: z.string().optional(),
		publishDate: z.iso
			.datetime({ offset: true })
			.transform((val) => new Date(val)),
	    tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
	})
})

const story = defineCollection({
	loader: glob({ base: "./content/stories", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		description: z.string().optional(),
		publishDate: z.iso
			.datetime({ offset: true })
			.transform((val) => new Date(val)),
		tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
		status: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
	}),
})

const tag = defineCollection({
	loader: glob({ base: "./content/tags", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: titleSchema.optional(),
		description: z.string().optional(),
	}),
});

const status = defineCollection({
	loader: glob({ base: "./content/status", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: titleSchema.optional(),
		description: z.string().optional(),
	})
})

export const collections = { post, journal, project, note, seedling, story, tag, status };
