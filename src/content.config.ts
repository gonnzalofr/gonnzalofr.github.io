import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Bench log: one Markdown file per entry in src/content/log/, named YYYY-MM-DD-slug.md.
// The file name (minus .md) becomes the entry id and the page URL: log/<id>.html.
const log = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/log' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { log };
