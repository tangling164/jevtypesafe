import {mkdir,readFile,readdir,rename,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
export const argument=(name:string)=>{const index=process.argv.indexOf(name);return index<0?undefined:process.argv[index+1];};
export const readJson=async(path:string):Promise<unknown>=>JSON.parse(await readFile(path,'utf8'));
export async function optionalJson(path:string,fallback:unknown):Promise<unknown>{try{return await readJson(path);}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return fallback;throw error;}}
export async function jsonDirectory(path:string){return Promise.all((await readdir(path)).filter(name=>name.endsWith('.json')).sort().map(name=>readJson(join(path,name))));}
export async function writeJson(path:string,value:unknown){await mkdir(dirname(path),{recursive:true});const temp=`${path}.${process.pid}.tmp`;await writeFile(temp,JSON.stringify(value,null,2)+'\n');await rename(temp,path);}
