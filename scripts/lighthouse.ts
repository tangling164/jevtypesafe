import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {extname,join,resolve,sep} from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const capacity=JSON.parse(await readFile('reports/acceptance/capacity.json','utf8'));
const root=resolve(capacity.sandbox,'dist');
const mime:Record<string,string>={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
  try{
    const path=new URL(req.url??'/','http://localhost').pathname;
    const file=resolve(root,`.${path.endsWith('/')?`${path}index.html`:path}`);
    if(!file.startsWith(root+sep))throw Error('path');
    const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]??'application/octet-stream');res.end(bytes);
  }catch{res.writeHead(404);res.end('Not found');}
});
await new Promise<void>(done=>server.listen(0,'127.0.0.1',done));
const address=server.address();assert(address&&typeof address!=='string');
const url=`http://127.0.0.1:${address.port}/`;
try{
  const pkg=JSON.parse(await readFile('node_modules/lighthouse/package.json','utf8'));
  const bin=typeof pkg.bin==='string'?pkg.bin:pkg.bin.lighthouse;
  const report=resolve('reports/acceptance/lighthouse-capacity-mobile.json');
  let log='';
  const code=await new Promise<number|null>((done,reject)=>{
    const child=spawn(process.execPath,[resolve('node_modules/lighthouse',bin),url,'--output=json',`--output-path=${report}`,'--only-categories=performance,accessibility,seo','--chrome-flags=--headless --no-sandbox','--quiet'],{env:{...process.env,CHROME_PATH:chromium.executablePath()},windowsHide:true});
    child.stdout.on('data',data=>log+=String(data));child.stderr.on('data',data=>log+=String(data));child.on('error',reject);child.on('exit',done);
  });
  await mkdir('reports/acceptance',{recursive:true});await writeFile('reports/acceptance/lighthouse.log',log);
  assert.equal(code,0,log.slice(-2000));
  const result=JSON.parse(await readFile(report,'utf8'));
  const scores=Object.fromEntries(Object.entries(result.categories as Record<string,{score:number}>).map(([key,value])=>[key,Math.round(value.score*100)]));
  console.log(JSON.stringify({scores,environment:result.environment,formFactor:result.configSettings.formFactor,scope:'1500 synthetic projects; isolated production-mode build; localhost lab, not live-user metrics'},null,2));
  assert(Object.values(scores).every(score=>score>=90),'Lighthouse target not met');
}finally{await new Promise<void>((done,reject)=>server.close(error=>error?reject(error):done()));}
