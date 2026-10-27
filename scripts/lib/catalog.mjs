import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

// Deliberately dependency-free: the RED/GREEN catalog gate runs before npm install.
export function parseCsv(input) {
  const rows = []; let record = []; let field = ''; let quoted = false; let closedQuote = false;
  const data = input.replace(/^\uFEFF/, '');
  for (let i = 0; i < data.length; i++) {
    const ch = data[i];
    if (quoted) {
      if (ch === '"' && data[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { quoted = false; closedQuote = true; }
      else field += ch;
    } else if (ch === '"' && field === '' && !closedQuote) { quoted = true; }
    else if (ch === ',') { record.push(field); field = ''; closedQuote = false; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && data[i + 1] === '\n') i++;
      record.push(field); if (record.some(v => v.length)) rows.push(record);
      record = []; field = ''; closedQuote = false;
    } else if (closedQuote) { if (ch !== ' ' && ch !== '\t') throw new Error(`Invalid CSV content after closing quote at ${i}`); }
    else { if (ch === '"') throw new Error(`Unexpected quote in CSV at ${i}`); field += ch; }
  }
  if (quoted) throw new Error('Unclosed quoted CSV field');
  if (field.length || record.length) { record.push(field); rows.push(record); }
  if (!rows.length) return [];
  const header = rows.shift();
  return rows.map((r,i) => {
    if (r.length !== header.length) throw new Error(`CSV row ${i+2}: expected ${header.length} columns, got ${r.length}`);
    return Object.fromEntries(header.map((key,idx) => [key, r[idx]]));
  });
}

export function loadCatalog(root) {
  return {
    concepts: parseCsv(readFileSync(join(root,'data/concepts.csv'),'utf8')),
    relationships: parseCsv(readFileSync(join(root,'data/relationships.csv'),'utf8')),
  };
}

export function taxonomy(concepts) {
  const groups = [];
  for (const row of concepts) {
    let group = groups.find(g => g.label === row.group);
    if (!group) { group = { label: row.group, categories: [] }; groups.push(group); }
    if (!group.categories.some(c => c.id === row.category_id)) {
      group.categories.push({ id: row.category_id, label: row.category_label });
    }
  }
  return groups;
}

export function validateCatalog({concepts,relationships}) {
  const errors = [], ids = new Set(), categoryCounts = new Map(), seeds = new Map(), pairs = new Set();
  for (const c of concepts) {
    if (!/^[a-z]+\.[a-z0-9-]+$/.test(c.concept_id)) errors.push(`Invalid concept ID ${c.concept_id}`);
    if (ids.has(c.concept_id)) errors.push(`Duplicate concept ${c.concept_id}`);
    ids.add(c.concept_id);
    if (!/^[a-z0-9-]+$/.test(c.category_id) || !/^[a-z0-9-]+$/.test(c.slug)) errors.push(`Invalid category/slug in ${c.concept_id}`);
    categoryCounts.set(c.category_id, (categoryCounts.get(c.category_id) ?? 0)+1);
    if (c.m1_seed === 'yes') seeds.set(c.category_id, (seeds.get(c.category_id) ?? 0)+1);
    if (!['yes','no'].includes(c.m1_seed)) errors.push(`Invalid seed flag in ${c.concept_id}`);
    if (c.editorial_status !== 'planned') errors.push(`Unexpected catalog state for ${c.concept_id}`);
  }
  if (concepts.length !== 100) errors.push(`Expected 100 concepts; got ${concepts.length}`);
  if (categoryCounts.size !== 20) errors.push(`Expected 20 categories; got ${categoryCounts.size}`);
  for (const [cat,n] of categoryCounts) {
    if (n !== 5) errors.push(`Expected five concepts for category ${cat}`);
    if (seeds.get(cat) !== 1) errors.push(`Expected one M1 seed for category ${cat}`);
  }
  for (const r of relationships) {
    if (!ids.has(r.source_concept_id)) errors.push(`Unknown source relationship ${r.source_concept_id}`);
    if (!ids.has(r.target_concept_id)) errors.push(`Unknown target relationship ${r.target_concept_id}`);
    if (!['related_to','contrasts_with'].includes(r.relation_type)) errors.push(`Unknown relation type ${r.relation_type}`);
    if (r.source_concept_id === r.target_concept_id) errors.push(`Self relationship ${r.source_concept_id}`);
    const key=[r.source_concept_id,r.target_concept_id].sort().join('::');
    if(pairs.has(key)) errors.push(`Duplicate relationship ${key}`);
    pairs.add(key);
    if (!r.editorial_rationale?.trim()) errors.push(`Missing rationale for ${key}`);
  }
  return errors;
}

export function readConceptPages(root) {
  const base=join(root,'src/content/docs');
  const items=[];
  for(const entry of readdirSync(base,{withFileTypes:true})) {
    if(!entry.isDirectory()) continue;
    for(const file of readdirSync(join(base,entry.name))) {
      if(!file.endsWith('.mdx')) continue;
      const full=join(base,entry.name,file);
      const body=readFileSync(full,'utf8');
      const match=body.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
      if(!match) throw new Error(`Missing frontmatter in ${full}`);
      let meta;
      try { meta=JSON.parse(match[1]); } catch(err) { throw new Error(`${full}: expected JSON-formatted YAML frontmatter: ${err.message}`); }
      items.push({ meta, body:body.slice(match[0].length), file:relative(base,full).replaceAll('\\','/') });
    }
  }
  return items;
}

export function validateConceptPage(page, catalog) {
  const e=[], m=page.meta ?? {};
  const row=catalog.concepts.find(c=>c.concept_id===m.conceptId);
  if (!row) e.push(`unknown conceptId ${m.conceptId}`);
  for(const f of ['title','description','conceptId','category','kind','editorialStatus']) if(typeof m[f]!=='string' || !m[f].trim()) e.push(`missing field ${f}`);
  if(m.contentType!=='concept') e.push('contentType must be concept');
  if(row && (row.category_id!==m.category || page.file!==`${row.category_id}/${row.slug}.mdx`)) e.push('category/slug mismatch');
  if(m.kind!=='concept'&&m.kind!=='organization') e.push('invalid kind');
  if(!['draft','reviewed','published'].includes(m.editorialStatus)) e.push('invalid editorialStatus');
  if(!Array.isArray(m.aliases)) e.push('aliases must be a list');
  if(!Array.isArray(m.sources) || m.sources.length===0) e.push('at least one source is required');
  else for(const s of m.sources) if(typeof s.title!=='string'|| !/^https:\/\//.test(s.url??'') || !['primary','secondary','vendor','draft'].includes(s.role)) e.push(`invalid source on ${m.conceptId}`);
  if(!Array.isArray(m.related)) e.push('related must be an array');
  else for(const r of m.related) {
    if(!catalog.concepts.some(c=>c.concept_id===r.conceptId)) e.push(`unknown related concept ${r.conceptId}`);
    if(r.conceptId===m.conceptId) e.push('self relation');
    if(!['related_to','contrasts_with'].includes(r.relation)) e.push(`invalid relation ${r.relation}`);
  }
  if(m.reviewedAt!==undefined) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(m.reviewedAt)|| Number.isNaN(Date.parse(m.reviewedAt)) || m.reviewedAt>new Date().toISOString().slice(0,10)) e.push('invalid reviewedAt date');
  }
  if(m.editorialStatus==='published' && (!m.reviewedAt || !m.reviewer || m.reviewer==='unassigned')) e.push('published article requires reviewedAt and identified reviewer');
  if(m.editorialStatus==='draft' && m.reviewedAt) e.push('draft article cannot claim reviewedAt');
  const sectionNames=['Precise definition','Why it exists','Mental model','Mechanics and guarantees','Worked example','Failure modes','Trade-offs','Related concepts','Testing and verification','References'];
  for(const name of sectionNames) if(!page.body.toLowerCase().includes(`## ${name.toLowerCase()}`)) e.push(`missing section ${name}`);
  return e;
}

export function auditSite(root) {
  const c=loadCatalog(root);
  const errors=validateCatalog(c);
  const pages=readConceptPages(root);
  const all=new Set();
  for(const p of pages) {
    if(all.has(p.meta.conceptId)) errors.push(`duplicate authored page ${p.meta.conceptId}`);
    all.add(p.meta.conceptId);
    errors.push(...validateConceptPage(p,c).map(e=>`${p.file}: ${e}`));
  }
  const cats=new Set(c.concepts.map(x=>x.category_id));
  for(const cat of cats) if(!existsSync(join(root,'src/content/docs',`${cat}.md`))) errors.push(`Missing category overview ${cat}`);
  const expected = ['programming.idiomatic-programming','concurrency.atomic-operation','distributed.idempotency'];
  for(const id of expected) if(!all.has(id)) errors.push(`Missing pilot ${id}`);
  for(const id of all) if(!c.concepts.some(row=>row.concept_id===id && row.m1_seed==='yes')) errors.push(`Scope violation: non-M1 seed article ${id}`);
  if(!existsSync(join(root,'src/content/docs/index.mdx'))) errors.push('Missing homepage');
  if(!existsSync(join(root,'src/content/docs/concept-index.md'))) errors.push('Missing A-Z index');
  return errors;
}
