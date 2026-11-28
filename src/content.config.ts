import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

function removeDupsAndLowerCase(array: string[]) {
	return [...new Set(array.map((str) => str.toLowerCase()))];
}

const titleSchema = z.string();

const baseSchema = z.object({
	title: titleSchema,
});

const post = defineCollection({
	loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
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
	loader: glob({ base: "./src/content/notes", pattern: "**/*.{md,mdx}" }),
	schema: baseSchema.extend({
		description: z.string().optional(),
		/** Wiki category shown in the notes sidebar. Falls back to the note's folder name, then "General". */
		category: z.string().optional(),
		publishDate: z.iso
			.datetime({ offset: true }) // Ensures ISO 8601 format with offsets allowed (e.g. "2024-01-01T00:00:00Z" and "2024-01-01T00:00:00+02:00")
			.transform((val) => new Date(val)),
		tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
		status: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
	}),
});

/** A calendar day, kept as local midnight so it lines up with posts and notes from the same day.
 *  Accepts "2026-11-01" (quoted or not) or anything `new Date()` understands. */
const calendarDay = z
	.string()
	.or(z.date())
	.transform((val) => {
		if (val instanceof Date) {
			// YAML parses an unquoted 2026-11-01 as UTC midnight
			return new Date(val.getUTCFullYear(), val.getUTCMonth(), val.getUTCDate());
		}
		const ymd = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
		if (!ymd) return new Date(val);
		const [, y, m, d] = ymd.map(Number) as [number, number, number, number];
		return new Date(y, m - 1, d);
	});

const journal = defineCollection({
	loader: glob({ base: "./src/content/journal", pattern: "**/*.{md,mdx}" }),
	schema: baseSchema.extend({
		/** the day this entry is about */
		date: calendarDay,
		/** the sprint this entry belongs to */
		sprint: z.number().int().positive(),
		description: z.string().optional(),
		draft: z.boolean().default(false),
		tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
		/** extra notes/posts to link, on top of the ones published on the same day */
		notes: z.array(reference("note")).default([]),
		posts: z.array(reference("post")).default([]),
	}),
});

const tag = defineCollection({
	loader: glob({ base: "./src/content/tags", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: titleSchema.optional(),
		description: z.string().optional(),
	}),
});

export const collections = { post, note, journal, tag };
