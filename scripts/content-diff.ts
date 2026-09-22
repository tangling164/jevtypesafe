import {z} from 'zod';
import {ProjectSchema} from '../src/lib/content-schema';
import {argument,jsonDirectory,optionalJson,writeJson} from './lib/io';

const published=(await jsonDirectory('content/projects')).map(value=>ProjectSchema.parse(value));
const review=z.object({review:z.array(z.object({project:ProjectSchema,reasons:z.array(z.string())})),unresolved:z.array(z.object({url:z.string(),reason:z.string()})).default([])}).parse(await optionalJson(argument('--input')??'var/ingest/repository-review.json',{review:[],unresolved:[]}));
const diff=review.review.map(({project,reasons})=>{
  const before=published.find(item=>item.id===project.id);
  const fields=Object.keys(project).filter(key=>JSON.stringify(before?.[key as keyof typeof project])!==JSON.stringify(project[key as keyof typeof project]));
  return {id:project.id,slug:project.slug,kind:before?'update':'new',fields,reasons,publication:'review_required'};
});
const source=z.object({candidates:z.array(z.unknown())}).parse(await optionalJson('var/ingest/candidates.json',{candidates:[]}));
await writeJson('reports/content-diff.json',{changes:diff,unresolved:review.unresolved,sourceCandidateCount:source.candidates.length,publishedCount:published.filter(p=>p.status==='published').length,automaticPublication:false});
console.log(`${diff.length} proposed changes; ${review.unresolved.length} unresolved sources. Report written without publishing.`);
