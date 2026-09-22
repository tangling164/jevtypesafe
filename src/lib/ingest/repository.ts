import {z} from 'zod';
import {ProjectSchema,PublicUrlSchema,type Project} from '../content-schema';
import {mapLicense,mergeRepositories,applyPublicationPolicy,substantiveHash} from './pipeline';
import type {GenerationJob} from './generation';

const SnapshotSchema=z.object({
  id:z.number().int().positive(),name:z.string().min(1),full_name:z.string().regex(/^[\w.-]+\/[\w.-]+$/),html_url:PublicUrlSchema,
  owner:z.object({login:z.string().min(1)}),description:z.string().nullable(),stargazers_count:z.number().int().nonnegative(),
  updated_at:z.iso.datetime(),archived:z.boolean(),fork:z.boolean(),
  license:z.object({spdx_id:z.string(),path:z.string().optional()}).nullable(),
  license_text:z.string().max(200_000).default(''),
  readme:z.string().max(200_000),commit:z.string().regex(/^[a-f0-9]{40}$/),
  sources:z.array(PublicUrlSchema).default([]),
}).refine(value=>repositoryTarget(value.html_url)?.toLowerCase()===value.full_name.toLowerCase(),'GitHub identity mismatch');
export type RepositorySnapshot=z.infer<typeof SnapshotSchema>;
export function parseRepositorySnapshot(input:unknown){return SnapshotSchema.parse(input);}
export function repositoryTarget(raw:string):string|null{
  try{
    const url=new URL(raw);
    if(url.protocol!=='https:'||url.hostname!=='github.com'||url.username||url.password||url.port)return null;
    const parts=url.pathname.split('/').filter(Boolean);
    if(parts.length<2||!parts.slice(0,2).every(part=>/^[\w.-]+$/.test(part)))return null;
    return `${parts[0]}/${parts[1]!.replace(/\.git$/,'')}`;
  }catch{return null;}
}

export function prepareReview(snapshots:RepositorySnapshot[],existing:Project[],overrides:Record<string,unknown>[],tombstones:{id:string}[],now=new Date().toISOString()){
  const merged=mergeRepositories(snapshots.map(s=>({repositoryId:String(s.id),repoUrl:s.html_url,name:s.name,sources:[...s.sources,s.html_url].map(url=>({url,type:'repository' as const,revision:s.commit,fetched_at:now})),snapshot:s})),existing);
  const review:Array<{project:Project;reasons:string[]}> = [];
  const jobs:GenerationJob[]=[];
  const excluded:Array<{id:string;reason:string}>=[];
  for(const mergedRepo of merged){
    const s=mergedRepo.snapshot as RepositorySnapshot;
    if(tombstones.some(item=>item.id===mergedRepo.stableId)){excluded.push({id:mergedRepo.stableId,reason:'tombstone'});continue;}
    if(s.fork){excluded.push({id:mergedRepo.stableId,reason:'fork_requires_manual_exception'});continue;}
    const old=existing.find(item=>item.repository_id===String(s.id));
    const readmeUrl=`${s.html_url}/blob/${s.commit}/README.md`;
    const verifiedLicense=s.license && s.license_text && s.license.path ? s.license : null;
    const license=verifiedLicense?{spdx:verifiedLicense.spdx_id,url:`${s.html_url}/blob/${s.commit}/${verifiedLicense.path}`,checked_at:now,method:'github_license_at_commit'}:null;
    const sources=[...mergedRepo.sources,{url:readmeUrl,type:'readme' as const,revision:s.commit,fetched_at:now},...(license?[{url:license.url,type:'license' as const,revision:s.commit,fetched_at:now}]:[])];
    const sourceHash=substantiveHash({readme:s.readme,description:s.description,license:s.license?.spdx_id??null});
    const draft=old??{
      id:mergedRepo.stableId,slug:mergedRepo.slug,name:s.name,owner:s.owner.login,primary_category:'experiments',secondary_categories:[],tags:[],ecosystem:'unknown',
      repo_url:s.html_url,demo_url:null,website_url:null,repository_id:String(s.id),requirements:{api_key:null,additional_model:null,local_install:null,hardware:null},
      locales:{en:{summary:s.description||s.name,problem:'Pending source review.',requirements_text:'Not stated.',generation:{status:'pending',source_refs:[readmeUrl]}},zh:null},
      first_published_at:null,verification:'source_checked',runtime_evidence:null,status:'review',generation:null,
    };
    const proposed=ProjectSchema.parse({...draft,repo_url:s.html_url,license,source_status:mapLicense(license?.spdx),stars:s.stargazers_count,repo_updated_at:s.updated_at,archived:s.archived,checked_at:now,sources,source_hash:sourceHash});
    const [overridden]=applyPublicationPolicy([proposed],overrides,tombstones);
    if(!overridden)continue;
    const reasons=[...mergedRepo.reviewReasons];
    if(!old)reasons.push('new_project_requires_classification_and_review');
    if(old && old.license?.spdx!==license?.spdx)reasons.push('license_changed');
    if(old?.source_hash!==sourceHash)reasons.push('substantive_input_changed');
    review.push({project:ProjectSchema.parse(overridden),reasons});
    if(old?.source_hash!==sourceHash)jobs.push({id:proposed.id,sourceHash,input:s.readme,sourceRefs:[readmeUrl]});
  }
  return {review,jobs,excluded};
}
