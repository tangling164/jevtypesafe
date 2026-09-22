export type SearchRecord = {
  id: string; slug: string; name: string; owner: string | null; summary: string; category: string;
  tags: string[]; ecosystem: string; source_status: string; local_install: boolean | null;
  demo_url: string | null; stars: number | null; first_published_at: string | null; repo_updated_at: string | null; href: string;
};
export type SearchState = { q: string; category: string[]; ecosystem: string[]; source: string[]; usage: string[]; sort: string; page: number };
export const searchOptions = {
  category: ['data','routing','filtering','review','developer','experiments'],
  ecosystem: ['jev','jev_integration','jev_like','unknown'],
  source: ['open_source','source_available','demo_only','unknown'],
  usage: ['online','local'],
  sort: ['newest','updated','stars','name'],
};
export function decodeSearchIndex(input: unknown, locale: string): SearchRecord[] {
  if(!input || typeof input!=='object') throw new Error('Invalid search index');
  const index=input as Record<string,unknown>;
  if(index.schema_version!==1 || index.locale!==locale || !Array.isArray(index.projects)) throw new Error('Invalid search index version or locale');
  const nullableText=(value:unknown)=>value===null||typeof value==='string';
  const ids=new Set<string>();
  for(const value of index.projects){
    if(!value||typeof value!=='object')throw new Error('Invalid search record');
    const p=value as Record<string,unknown>;
    if(!['id','slug','name','summary','href'].every(key=>typeof p[key]==='string' && p[key].length>0) ||
      !nullableText(p.owner)||!nullableText(p.first_published_at)||!nullableText(p.repo_updated_at)||!nullableText(p.demo_url)||
      !Array.isArray(p.tags)||!p.tags.every(tag=>typeof tag==='string')||
      !searchOptions.category.includes(p.category as string)||!searchOptions.ecosystem.includes(p.ecosystem as string)||!searchOptions.source.includes(p.source_status as string)||
      !(p.local_install===null||typeof p.local_install==='boolean')||
      !(p.stars===null||(typeof p.stars==='number'&&Number.isSafeInteger(p.stars)&&p.stars>=0))||
      !/^\/(?:zh\/)?projects\/[a-z0-9-]+\/$/.test(p.href as string)||ids.has(p.id as string))throw new Error('Invalid search record');
    ids.add(p.id as string);
  }
  return index.projects as SearchRecord[];
}
export const normalize = (text: string) => text.normalize('NFKC').toLocaleLowerCase('en').trim().replace(/\s+/g,' ');
export function parseSearch(input: string | URLSearchParams): SearchState {
  const params = typeof input === 'string' ? new URLSearchParams(input) : input;
  const multi = (key: 'category'|'ecosystem'|'source'|'usage') => [...new Set(params.getAll(key).filter(value => searchOptions[key].includes(value)))];
  const page = Number(params.get('page'));
  return {q:(params.get('q') ?? '').slice(0,200), category:multi('category'), ecosystem:multi('ecosystem'), source:multi('source'), usage:multi('usage'), sort:searchOptions.sort.includes(params.get('sort') ?? '') ? params.get('sort')! : 'newest',page: Number.isSafeInteger(page) && page>0 ? page : 1};
}
export function serializeSearch(state: SearchState): string {
  const params = new URLSearchParams();
  if (state.q) params.set('q',state.q);
  for (const key of ['category','ecosystem','source','usage'] as const) for (const value of state[key]) params.append(key,value);
  if (state.sort !== 'newest') params.set('sort',state.sort);
  if (state.page>1) params.set('page',String(state.page));
  return params.toString();
}
export function searchProjects(records: SearchRecord[], state: SearchState): SearchRecord[] {
  const q = normalize(state.q);
  const matches = (values: string[], value: string) => !values.length || values.includes(value);
  return records.filter(p => (!q || normalize([p.name,p.owner,p.summary,...p.tags].join(' ')).includes(q)) && matches(state.category,p.category) && matches(state.ecosystem,p.ecosystem) && matches(state.source,p.source_status) && (!state.usage.length || state.usage.some(value => value === 'online' ? !!p.demo_url : p.local_install === true))).sort((a,b) => {
    if(q) { const exact = Number(normalize(b.name)===q)-Number(normalize(a.name)===q); if(exact) return exact; }
    if(state.sort==='stars') return (b.stars ?? -1)-(a.stars ?? -1) || a.id.localeCompare(b.id);
    if(state.sort==='name') return a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
    const key=state.sort==='updated'?'repo_updated_at':'first_published_at';
    return (b[key]??'').localeCompare(a[key]??'') || a.id.localeCompare(b.id);
  });
}
