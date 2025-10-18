import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

function removeDupsAndLowerCase(array: string[]) {
  return [...new Set(array.map((str) => str.toLowerCase()))];
};

const titleSchema = z.string().max(60);

const baseSchema = z.object({
  title: titleSchema,
});


const post = defineCollection({
  loader: glob({ pattern: ['**/*.md', '**/*.mdx'], base: './src/content/posts' }),
  schema: ({ image }) =>
    baseSchema.extend({
      description: z.string(),
      coverImage: z.object({
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
    }),
});

const note = defineCollection({
  loader: glob({ base: "./src/content/notes", pattern: "**/*.{md,mdx}" }),
  schema: baseSchema.extend({
    description: z.string().optional(),
    publishDate: z
      .string()
      .datetime({ offset: true })
      .transform((val) => new Date(val)),
    categories: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
    tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
  }),
});

const category = defineCollection({
  loader: glob({ base: "./src/content/categories", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: titleSchema.optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
  }),
});

const tag = defineCollection({
  loader: glob({ base: "./src/content/tags", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: titleSchema.optional(),
    description: z.string().optional(),
  }),
});



export const collections = { post, note, category, tag };