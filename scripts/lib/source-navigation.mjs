import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

function collectContent(dir) {
  const files = [];
  const visit = (folder) => {
    for (const item of readdirSync(folder, { withFileTypes: true })) {
      const file = join(folder, item.name);
      if (item.isDirectory()) visit(file);
      else if (item.isFile() && /\.(?:md|mdx)$/.test(item.name)) files.push(file);
    }
  };
  visit(dir);
  return files;
}

function sourceRoute(root, path) {
  const rel = relative(root, path).replaceAll('\\', '/').replace(/\.(md|mdx)$/, '');
  return rel === 'index' ? '/' : `/${rel.replace(/\/index$/, '')}/`;
}

export function auditSourceNavigation(rootDir) {
  const root = resolve(rootDir);
  const files = collectContent(root);
  const routes = new Set(files.map(path => sourceRoute(root, path)));
  const errors = [];
  let linkCount = 0;
  for (const path of files) {
    const body = readFileSync(path, 'utf8');
    const rel = relative(root, path).replaceAll('\\', '/');
    const references = [
      ...[...body.matchAll(/\]\(\s*(\/[^)\s]+)\s*\)/g)].map(match => match[1]),
      ...[...body.matchAll(/^\s*(?:-\s*)?link:\s*(\/[^\s#]+[^\s]*)/gm)].map(match => match[1]),
    ];
    for (const reference of references) {
      linkCount++;
      const route = reference.split(/[?#]/)[0];
      if (!routes.has(route)) errors.push(`${rel}: unknown source route ${reference}`);
    }
  }
  return { pageCount: files.length, linkCount, errors };
}
