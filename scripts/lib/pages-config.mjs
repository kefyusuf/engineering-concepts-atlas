// GitHub Actions supplies GITHUB_REPOSITORY. Local builds have no repository base.
export function pagesConfig(env = process.env) {
  if (env.GITHUB_PAGES !== 'true') return { base: '', site: undefined, preview: false };
  const fullName = env.GITHUB_REPOSITORY || 'kefyusuf/engineering-concepts-atlas';
  const [owner, repo, ...rest] = fullName.split('/');
  if (!owner || !repo || rest.length || !/^[a-z0-9-]+$/i.test(owner) || !/^[a-z0-9._-]+$/i.test(repo)) {
    throw new Error(`Invalid GITHUB_REPOSITORY: ${fullName}`);
  }
  const host = `${owner.toLowerCase()}.github.io`;
  const base = repo.toLowerCase() === host ? '' : `/${repo}`;
  return { base, site: `https://${host}`, preview: true };
}

export function addBase(path, base) {
  if (!base || !path.startsWith('/') || path.startsWith('//')) return path;
  if (path === base || path.startsWith(`${base}/`)) return path;
  return `${base}${path}`;
}

// Root-relative document links are authored without a hosting-provider prefix.
// Astro/Starlight do not automatically prefix arbitrary links within Markdown.
export function rebaseDocumentLinks(base) {
  return (tree) => {
    function walk(node) {
      if (node?.type === 'element' && ['a', 'img', 'source', 'video'].includes(node.tagName)) {
        for (const attr of ['href', 'src']) {
          const old = node.properties?.[attr];
          if (typeof old === 'string') node.properties[attr] = addBase(old, base);
        }
      }
      for (const child of node?.children ?? []) walk(child);
    }
    walk(tree);
  };
}
