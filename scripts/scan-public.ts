import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

async function walk(directory:string):Promise<string[]>{const entries=await readdir(directory,{withFileTypes:true});const nested=await Promise.all(entries.map(e=>e.isDirectory()?walk(join(directory,e.name)):Promise.resolve([join(directory,e.name)])));return nested.flat();}
const files=(execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'})).split('\0').filter(Boolean);
const dist=await walk('dist');
const patterns:[string,RegExp][]=[['private-key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],['github-token',/\b(?:ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{24,}\b/],['model-api-key',/\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/]];
const findings:Array<{file:string;rule:string}>=[];
for(const file of [...new Set([...files,...dist])]){
  if(/\.(png|jpe?g|woff2?|zip|webp)$/.test(file))continue;
  const text=await readFile(file,'utf8');
  for(const [rule,pattern] of patterns)if(pattern.test(text))findings.push({file,rule});
  if(file.startsWith('dist') && /(?:private_notes|source_hash|SUMMARY_API_KEY|SPONSOR_EVENT_SECRET|synthetic-\d+|must never be public)/.test(text))findings.push({file,rule:'non-public-field-or-fixture'});
}
let history='no_commits';try{execFileSync('git',['rev-parse','--verify','HEAD'],{stdio:'ignore'});history='working-tree-only_history-not-scanned';}catch{/* Initial repository. */}
const result={timestamp:new Date().toISOString(),executor:process.env.EVIDENCE_EXECUTOR??'local',sourceFiles:files.length,distFiles:dist.length,history,findings,limitation:'Heuristic token and field checks; no claim of exhaustive secret detection.'};
await mkdir('reports/acceptance',{recursive:true});await writeFile('reports/acceptance/public-scan.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(findings.length)process.exitCode=1;
