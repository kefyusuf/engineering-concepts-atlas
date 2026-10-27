import { resolve } from 'node:path';
import { auditSite, readConceptPages, loadCatalog } from './lib/catalog.mjs';
import { auditSourceNavigation } from './lib/source-navigation.mjs';
const root=resolve(import.meta.dirname,'..');
const navigation=auditSourceNavigation(resolve(root, 'src/content/docs'));
const errors=[...auditSite(root), ...navigation.errors];
if(errors.length){ console.error(`Content validation: ${errors.length} errors\n${errors.map(e=>'- '+e).join('\n')}`);process.exitCode=1; }
else {
 const c=loadCatalog(root);
 const p=readConceptPages(root);
 console.log(`Content gate PASS: ${c.concepts.length} catalog entries, ${new Set(c.concepts.map(x=>x.category_id)).size} categories, ${c.relationships.length} relations, ${p.length} preview drafts, ${navigation.pageCount} source routes, ${navigation.linkCount} local links, ${p.filter(x=>x.meta.editorialStatus==='published').length} approved articles.`);
}
