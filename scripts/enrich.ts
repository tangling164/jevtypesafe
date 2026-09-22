import {join} from 'node:path';
import {z} from 'zod';
import {ProjectSchema} from '../src/lib/content-schema';
import {parseRepositorySnapshot,prepareReview,repositoryTarget,type RepositorySnapshot} from '../src/lib/ingest/repository';
import {publicFetchText,mapWithConcurrency} from '../src/lib/ingest/public-fetch';
import {argument,jsonDirectory,optionalJson,readJson,writeJson} from './lib/io';

const directory='var/ingest';
const existing=(await jsonDirectory('content/projects')).map(record=>ProjectSchema.parse(record));
const overrides=z.array(z.record(z.string(),z.unknown())).parse(await jsonDirectory('content/overrides'));
const tombstones=z.array(z.object({id:z.string()})).parse(await readJson('content/tombstones.json'));
const snapshotFile=argument('--snapshots');
const unresolved:Array<{url:string;reason:string}>=[];
let snapshots:RepositorySnapshot[]=[];
if(snapshotFile){
  const raw=await readJson(snapshotFile);
  snapshots=z.array(z.unknown()).parse(raw).map(parseRepositorySnapshot);
}else{
  const candidates=z.object({candidates:z.array(z.object({projectUrl:z.string()}))}).parse(await optionalJson(argument('--input')??join(directory,'candidates.json'),{candidates:[]}));
  const targets=new Map<string,string[]>();
  for(const candidate of candidates.candidates){const target=repositoryTarget(candidate.projectUrl);if(target){targets.set(target,[...(targets.get(target)??[]),candidate.projectUrl]);}else{unresolved.push({url:candidate.projectUrl,reason:'non_repository_source_requires_review'});}}
  const limit=z.coerce.number().int().min(1).max(50).parse(process.env.INGEST_BATCH_LIMIT??10);
  const offset=z.coerce.number().int().min(0).parse(argument('--offset')??0);
  const requests=[...targets.entries()];
  const headers:Record<string,string>={Accept:'application/vnd.github+json','User-Agent':'jev-builds-directory'};
  if(process.env.GH_READ_TOKEN)headers.Authorization=`Bearer ${process.env.GH_READ_TOKEN}`;
  const api=async(path:string,accept='application/vnd.github+json')=>{const response=await publicFetchText(`https://api.github.com/repos/${path}`,{headers:{...headers,Accept:accept},maxBytes:500_000,allowedMimeTypes:['application/json','text/plain','application/vnd.github.raw+json']});return response.text;};
  const outcomes=await mapWithConcurrency(requests.slice(offset,offset+limit),3,async([target,sources])=>{
    try{
      const metadata=JSON.parse(await api(target));
      const commit=z.object({sha:z.string().regex(/^[a-f0-9]{40}$/)}).parse(JSON.parse(await api(`${target}/commits/${encodeURIComponent(metadata.default_branch)}`))).sha;
      const readme=await api(`${target}/readme?ref=${commit}`,'application/vnd.github.raw+json');
      let license=null;let license_text='';
      try{const details=JSON.parse(await api(`${target}/license?ref=${commit}`));if(details.encoding==='base64'){license_text=Buffer.from(details.content,'base64').toString('utf8');license={spdx_id:details.license?.spdx_id??'NOASSERTION',path:details.path};}}catch{unresolved.push({url:metadata.html_url,reason:'license_unavailable_kept_for_review'});}
      return parseRepositorySnapshot({...metadata,commit,readme,license,license_text,sources});
    }catch{unresolved.push({url:`https://github.com/${target}`,reason:'repository_fetch_or_schema_failed'});return null;}
  });
  snapshots=outcomes.filter((value):value is RepositorySnapshot=>value!==null);
  for(const [target] of [...requests.slice(0,offset),...requests.slice(offset+limit)])unresolved.push({url:`https://github.com/${target}`,reason:'outside_selected_batch'});
}
const result=prepareReview(snapshots,existing,overrides,tombstones);
const previousReview=z.object({review:z.array(z.object({project:ProjectSchema,reasons:z.array(z.string())})).default([])}).parse(await optionalJson(join(directory,'repository-review.json'),{}));
const reviewMap=new Map([...previousReview.review,...result.review].map(item=>[item.project.id,item]));
for(const tombstone of tombstones)reviewMap.delete(tombstone.id);
const JobSchema=z.object({id:z.string(),sourceHash:z.string(),input:z.string(),sourceRefs:z.array(z.url())});
const previousJobs=z.array(JobSchema).parse(await optionalJson(join(directory,'generation-jobs.json'),[]));
const jobsMap=new Map([...previousJobs,...result.jobs].map(job=>[job.id,job]));
for(const tombstone of tombstones)jobsMap.delete(tombstone.id);
await writeJson(join(directory,'repository-review.json'),{...result,review:[...reviewMap.values()],unresolved,publication:'review_required'});
await writeJson(join(directory,'generation-jobs.json'),[...jobsMap.values()]);
console.log(`Prepared ${result.review.length} repository reviews, ${result.jobs.length} generation jobs, ${unresolved.length} unresolved sources. Published content unchanged.`);
