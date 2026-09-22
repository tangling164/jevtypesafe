import {cp,mkdir,mkdtemp,readdir,readFile,symlink,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawn} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {project} from '../tests/fixtures/project';
import {searchProjects,parseSearch} from '../src/lib/search';

// Build in an isolated copy: synthetic projects never enter content/ or dist/ here.
const root=process.cwd();
const sandbox=await mkdtemp(join(tmpdir(),'jev-capacity-'));
for(const name of ['src','content','public','astro.config.ts','tsconfig.json','package.json'])await cp(join(root,name),join(sandbox,name),{recursive:true});
await symlink(join(root,'node_modules'),join(sandbox,'node_modules'),process.platform==='win32'?'junction':'dir');
const count=1500;
// Existing real snapshots remain in the copy; use a separate empty content tree
// selected by replacing the copied directory with a newly named fixture root.
const fixtureContent=join(sandbox,'fixture-content');
await mkdir(join(fixtureContent,'projects'),{recursive:true});
await mkdir(join(fixtureContent,'overrides'));
for(const name of ['categories.json','site.json','tombstones.json'])await cp(join(root,'content',name),join(fixtureContent,name));
for(let index=0;index<count;index++){
  const record=project({id:`synthetic-${index}`,repository_id:String(index+1),slug:`synthetic-${index}`,name:`Synthetic ${index}`});
  // One deliberate missing translation exercises the English fallback route.
  if(index===0)(record.locales as {zh:unknown}).zh=null;
  await writeFile(join(fixtureContent,'projects',`${index}.json`),JSON.stringify(record));
}
const loaderPath=join(sandbox,'src','lib','content.ts');
const loader=await readFile(loaderPath,'utf8');
const rootPattern=/join\(root, ['"]content['"]\)/;
assert(rootPattern.test(loader),'Fixture isolation expected loader path');
await writeFile(loaderPath,loader.replace(rootPattern,'join(root, "fixture-content")'));
const configPath=join(sandbox,'astro.config.ts');
const configText=await readFile(configPath,'utf8');
assert(/vite:\s*\{/.test(configText));
await writeFile(configPath,configText.replace(/vite:\s*\{/,'vite: { cacheDir: "./.vite-fixture",'));
const started=performance.now();
const astroPackage=JSON.parse(await readFile(join(root,'node_modules','astro','package.json'),'utf8'));
const astroBin=typeof astroPackage.bin==='string'?astroPackage.bin:astroPackage.bin.astro;
let log='';
const exitCode=await new Promise<number|null>((resolveExit,reject)=>{
  const child=spawn(process.execPath,[join(root,'node_modules','astro',astroBin),'build'],{cwd:sandbox,env:{...process.env,DEPLOY_ENV:'production',CONTACT_EMAIL:'',PUBLIC_WEB_ANALYTICS_TOKEN:'',SUMMARY_API_KEY:'',GH_READ_TOKEN:''},windowsHide:true});
  child.stdout.on('data',chunk=>log+=String(chunk));child.stderr.on('data',chunk=>log+=String(chunk));child.on('error',reject);child.on('exit',resolveExit);
});
await mkdir('reports/acceptance',{recursive:true});await writeFile('reports/acceptance/capacity-build.log',log);
assert.equal(exitCode,0,log.slice(-2000));
const output=join(sandbox,'dist');
const enFile=(await readdir(join(output,'search-index'))).find(name=>name.startsWith('en.'))!;
const zhFile=(await readdir(join(output,'search-index'))).find(name=>name.startsWith('zh.'))!;
const en=await readFile(join(output,'search-index',enFile));const zh=await readFile(join(output,'search-index',zhFile));
const index=JSON.parse(en.toString());assert.equal(index.projects.length,count);
assert(gzipSync(en).length<=250*1024);assert(gzipSync(zh).length<=250*1024);
const times:number[]=[];
for(let run=0;run<100;run++){const start=performance.now();searchProjects(index.projects,parseSearch('?q=synthetic&sort=stars'));times.push(performance.now()-start);}
times.sort((a,b)=>a-b);
const home=await readFile(join(output,'index.html'),'utf8');assert(home.includes('content="index,follow"'));
const last=await readFile(join(output,'projects','page','63','index.html'),'utf8');assert(last.includes('Synthetic'));
assert(!(await readFile(join(output,'sitemap.xml'),'utf8')).includes('/zh/projects/synthetic-0/'));
assert((await readFile(join(output,'zh','projects','index.html'),'utf8')).includes('中文译文尚未就绪'));
const page2=await readFile(join(output,'projects','page','2','index.html'),'utf8');assert(page2.includes('rel="next" href="/projects/page/3/"'));
const scriptFiles=(await readdir(join(output,'_astro'))).filter(name=>name.endsWith('.js'));
const js=await Promise.all(scriptFiles.map(async name=>({name,gzipBytes:gzipSync(await readFile(join(output,'_astro',name))).length})));
assert(js.reduce((sum,item)=>sum+item.gzipBytes,0)<=80*1024);
const report={timestamp:new Date().toISOString(),executor:process.env.EVIDENCE_EXECUTOR??'local',environment:{node:process.version,platform:process.platform},sandbox,syntheticProjects:count,buildMs:performance.now()-started,indexGzipBytes:{en:gzipSync(en).length,zh:gzipSync(zh).length},allJavascriptGzipBytes:js.reduce((sum,item)=>sum+item.gzipBytes,0),searchPureFunctionP95Ms:times[94],productionIndexing:true,pagesPerDirectory:63,missingTranslationOmitted:true,limitation:'Node timing excludes browser debounce/render and is not a mobile device or Lighthouse measurement.'};
await writeFile('reports/acceptance/capacity.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
