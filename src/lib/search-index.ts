import {createHash} from 'node:crypto';
import {content} from './site';
import {projectPath} from './routes';
import type {Locale} from '../i18n';
import type {SearchRecord} from './search';

export function createSearchIndex(locale: Locale) {
  const projects:SearchRecord[]=content.projects.map(p=>({id:p.id,slug:p.slug,name:p.name,owner:p.owner,summary:(p.locales[locale]??p.locales.en).summary,category:p.primary_category,tags:p.tags,ecosystem:p.ecosystem,source_status:p.source_status,local_install:p.requirements.local_install,demo_url:p.demo_url,stars:p.stars,first_published_at:p.first_published_at,repo_updated_at:p.repo_updated_at,href:projectPath(p,locale)}));
  const body=JSON.stringify({schema_version:1,locale,projects});
  const hash=createHash('sha256').update(body).digest('hex').slice(0,16);
  return {file:`${locale}.${hash}`,url:`/search-index/${locale}.${hash}.json`,body};
}
