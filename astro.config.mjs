import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import { existsSync } from 'node:fs';
import { loadCatalog, taxonomy } from './scripts/lib/catalog.mjs';
import { pagesConfig, rebaseDocumentLinks } from './scripts/lib/pages-config.mjs';

const catalog = loadCatalog(import.meta.dirname);
const groups = taxonomy(catalog.concepts);
const pages = pagesConfig();

export default defineConfig({
  ...(pages.site ? { site: pages.site } : {}),
  base: pages.base || '/',
  markdown: { processor: unified(), rehypePlugins: [() => rebaseDocumentLinks(pages.base)] },
  // No server adapter: the M1 site is entirely static.
  integrations: [
    starlight({
      title: pages.preview ? 'Engineering Concepts Atlas — Editorial Preview' : 'Engineering Concepts Atlas',
      description: 'Technical concepts, precise guarantees, failure modes, and primary sources.',
      customCss: ['./src/styles/atlas.css'],
      favicon: `${pages.base}/favicon.svg`,
      ...(pages.preview ? { head: [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' } }] } : {}),
      sidebar: [
        { label: 'Explore', items: [{ label: 'Home', link: '/' }, { slug: 'concept-index' }] },
        ...groups.map((group) => ({
          label: group.label,
          items: group.categories.map((category) => ({
            label: category.label,
            items: [
              { slug: category.id, label: 'Category overview' },
              ...catalog.concepts
                .filter((concept) => concept.category_id === category.id)
                .filter((concept) => existsSync(new URL(`./src/content/docs/${category.id}/${concept.slug}.mdx`, import.meta.url)))
                .map((concept) => ({ slug: `${category.id}/${concept.slug}`, label: concept.title })),
            ],
          })),
        })),
      ],
    }),
  ],
});
