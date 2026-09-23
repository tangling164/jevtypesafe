import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';

async function walk(directory:string):Promise<string[]>{const entries=await readdir(directory,{withFileTypes:true});const nested=await Promise.all(entries.map(e=>e.isDirectory()?walk(join(directory,e.name)):Promise.resolve([join(directory,e.name)])));return nested.flat();}
const files=(execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'})).split('\0').filter(Boolean);
const dist=await walk('dist');
const patterns:[string,RegExp][]=[['private-key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],['github-token',/\b(?:ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{24,}\b/],['model-api-key',/\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/]];
const historyPatterns:[string,string][]=[['private-key','-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----'],['github-token','(ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{24,}'],['model-api-key','sk-(proj-)?[A-Za-z0-9_-]{24,}']];
const findings:Array<{file:string;rule:string}>=[];
const binaryAsset=/\.(png|jpe?g|woff2?|zip|webp)$/;
for(const file of [...new Set([...files,...dist])]){
  if(binaryAsset.test(file))continue;
  const text=await readFile(file,'utf8');
  for(const [rule,pattern] of patterns)if(pattern.test(text))findings.push({file,rule});
  if(file.startsWith('dist') && /(?:private_notes|source_hash|SUMMARY_API_KEY|SPONSOR_EVENT_SECRET|synthetic-\d+|must never be public)/.test(text))findings.push({file,rule:'non-public-field-or-fixture'});
}
const commits=execFileSync('git',['rev-list','--all'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
let historyMatches=0;
for(const commit of commits){
  for(const [rule,pattern] of historyPatterns){
    const scan=spawnSync('git',['grep','-I','-l','-E','-e',pattern,commit,'--'],{encoding:'utf8',maxBuffer:16*1024*1024});
    if(scan.status===1)continue;
    if(scan.status!==0)throw new Error(`Git history scan failed for ${commit.slice(0,12)} (${rule}): ${scan.stderr.trim()}`);
    for(const line of scan.stdout.trim().split(/\r?\n/).filter(Boolean)){
      const file=line.startsWith(`${commit}:`)?line.slice(commit.length+1):line;
      findings.push({file:`history:${commit.slice(0,12)}:${file}`,rule});
      historyMatches++;
    }
  }
}
const history=commits.length?'scanned':'no_commits';
const result={timestamp:new Date().toISOString(),executor:process.env.EVIDENCE_EXECUTOR??'local',sourceFiles:files.length,distFiles:dist.length,history,historyCommits:commits.length,historyMatches,findings,limitation:'Heuristic token and field checks; Git history scan ignores binary assets.'};
await mkdir('reports/acceptance',{recursive:true});await writeFile('reports/acceptance/public-scan.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(findings.length)process.exitCode=1;
