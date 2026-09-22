import type { Locale } from '../i18n';
import type { PublicProject } from './content-schema';

export type Category = { id: PublicProject['primary_category']; en: string; zh: string };
export type Route = {
  path: string; locale: Locale; kind: 'home' | 'directory' | 'category' | 'project' | 'search' | 'submit' | 'sponsor' | 'about' | 'privacy';
  indexable: boolean; counterpart: string | null; projects: PublicProject[];
  project?: PublicProject; category?: Category; page: number; pages: number; total: number; lastmod?: string;
};
export function pagePath(locale: Locale, path = '') { return `${locale === 'zh' ? '/zh/' : '/'}${path}`; }
export function paginate<T>(records: T[], size = 24): T[][] {
  if (!Number.isInteger(size) || size < 1) throw new Error('Invalid page size');
  return records.length ? Array.from({ length: Math.ceil(records.length / size) }, (_, index) => records.slice(index * size, (index + 1) * size)) : [[]];
}
export function projectPath(project: PublicProject, locale: Locale) {
  return pagePath(locale === 'zh' && !project.locales.zh ? 'en' : locale, `projects/${project.slug}/`);
}
export function paginationPath(route:Pick<Route,'path'>,page:number){
  const base=route.path.replace(/page\/\d+\/$/,'');
  return page===1?base:`${base}page/${page}/`;
}
export function buildManifest(projects: PublicProject[], categories: Category[]): Route[] {
  const sorted = [...projects].sort((a,b) => (b.first_published_at ?? '').localeCompare(a.first_published_at ?? '') || a.id.localeCompare(b.id));
  const routes: Route[] = [];
  for (const locale of ['en', 'zh'] as const) {
    const add = (path: string, kind: Route['kind'], values: Partial<Route> = {}) => routes.push({ path: pagePath(locale, path), locale, kind, indexable: kind !== 'search', counterpart: null, projects: [], page: 1, pages: 1, total: 0, ...values });
    add('', 'home', { projects: sorted.slice(0,12), total: sorted.length });
    for (const kind of ['search','submit','sponsor','about','privacy'] as const) add(`${kind}/`,kind);
    const lists = [{ path: 'projects/', kind: 'directory' as const, records: sorted, category: undefined }, ...categories.filter((c) => sorted.some((p) => p.primary_category === c.id || p.secondary_categories.includes(c.id))).map((category) => ({ path: `categories/${category.id}/`, kind: 'category' as const, records: sorted.filter((p) => p.primary_category === category.id || p.secondary_categories.includes(category.id)), category }))];
    for (const list of lists) {
      const pages = paginate(list.records);
      pages.forEach((records, index) => add(index ? `${list.path}page/${index + 1}/` : list.path, list.kind, { projects: records, category: list.category, page: index+1, pages: pages.length, total: list.records.length }));
    }
    for (const project of sorted) {
      if (locale === 'zh' && !project.locales.zh) continue;
      // checked_at is a source check, not a material content revision. Omit lastmod
      // until the publishing pipeline records a dedicated content revision date.
      add(`projects/${project.slug}/`, 'project', {project, total: 1});
    }
  }
  const paths = new Set(routes.map((route) => route.path));
  for (const route of routes) {
    const counterpart = route.locale === 'zh' ? route.path.replace(/^\/zh\//, '/') : `/zh${route.path}`;
    route.counterpart = paths.has(counterpart) ? counterpart : null;
  }
  return routes;
}
