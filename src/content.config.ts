import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const relation = z.object({
  conceptId: z.string().regex(/^[a-z]+\.[a-z0-9-]+$/),
  relation: z.enum(['related_to', 'contrasts_with']),
});

const source = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  role: z.enum(['primary', 'secondary', 'vendor', 'draft']),
  scope: z.string().min(1),
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        description: z.string().min(8),
        contentType: z.enum(['page', 'category', 'concept']).default('page'),
        conceptId: z.string().regex(/^[a-z]+\.[a-z0-9-]+$/).optional(),
        category: z.string().optional(),
        kind: z.enum(['concept', 'organization']).optional(),
        aliases: z.array(z.string()).optional(),
        related: z.array(relation).optional(),
        reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        reviewer: z.string().optional(),
        editorialStatus: z.enum(['draft', 'reviewed', 'published']).optional(),
        sources: z.array(source).optional(),
      }).superRefine((v, ctx) => {
        if (v.contentType !== 'concept') return;
        for (const field of ['conceptId', 'category', 'kind', 'editorialStatus', 'sources', 'aliases', 'related'] as const) {
          if (v[field] === undefined) ctx.addIssue({ code: 'custom', path: [field], message: `Concept requires ${field}` });
        }
        if (!v.sources?.length) ctx.addIssue({ code: 'custom', path: ['sources'], message: 'Concept requires primary documentation' });
        if (v.editorialStatus === 'published' && (!v.reviewedAt || !v.reviewer)) {
          ctx.addIssue({ code: 'custom', path: ['reviewedAt'], message: 'Published concepts require review evidence' });
        }
        if (v.editorialStatus === 'draft' && v.reviewedAt) {
          ctx.addIssue({ code: 'custom', path: ['reviewedAt'], message: 'Drafts cannot claim completed review' });
        }
      }),
    }),
  }),
};
