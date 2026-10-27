import { resolve } from 'node:path';
import { loadCatalog, readConceptPages, auditSite } from './lib/catalog.mjs';
const root=resolve(import.meta.dirname,'..');
const errors=auditSite(root);
const pages=readConceptPages(root);
const catalog=loadCatalog(root);
const categories=new Set(catalog.concepts.map(x=>x.category_id));
const approved=pages.filter(p=>p.meta.editorialStatus==='published');
if(approved.length<20) errors.push(`Release requires 20 approved articles; found ${approved.length}`);
for(const category of categories) if(!approved.some(p=>p.meta.category===category)) errors.push(`No published article for ${category}`);
if(errors.length){console.error(`Release blocked:\n${errors.map(e=>'- '+e).join('\n')}`);process.exitCode=1;}
else console.log('Release gate passed');
