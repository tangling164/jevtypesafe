import {z} from 'zod';
import {runGeneration} from '../src/lib/ingest/generation';
import {argument,optionalJson,writeJson} from './lib/io';

// Provider, credentials and exact pricing have not been selected. Fail closed:
// preserve jobs, never guess a protocol or spend money with a placeholder adapter.
const JobSchema=z.object({id:z.string().min(1),sourceHash:z.string().min(1),input:z.string(),sourceRefs:z.array(z.url()).min(1)});
const jobs=z.array(JobSchema).parse(await optionalJson(argument('--input')??'var/ingest/generation-jobs.json',[]));
const budget=z.coerce.number().finite().nonnegative().parse(process.env.AI_BUDGET_USD??0);
const results=await runGeneration(jobs,{provider:null,apiKey:process.env.SUMMARY_API_KEY??null,budget,dryRun:process.argv.includes('--dry-run'),limits:{maxJobs:z.coerce.number().int().min(1).max(50).parse(process.env.INGEST_BATCH_LIMIT??10)}});
await writeJson('var/ingest/generation-results.json',results);
console.log(`${results.completed.length} generated, ${results.queued.length} queued. Provider/pricing must be configured before any paid calls; published snapshots unchanged.`);
