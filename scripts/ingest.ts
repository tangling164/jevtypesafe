import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import {
  adaptEveryAiCandidates,
  chooseSnapshot,
  type Candidate,
} from '../src/lib/ingest/source-adapter';
import { publicFetchText } from '../src/lib/ingest/public-fetch';
import {argument} from './lib/io';

const SOURCE_REPO = process.env.SOURCE_REPO ?? 'everyai-com/jev-directory';
if(!/^[\w.-]+\/[\w.-]+$/.test(SOURCE_REPO))throw new Error('Invalid SOURCE_REPO');
let SOURCE_COMMIT = process.env.SOURCE_REF ?? '26389c8627279a5942965e866a7f9133feba6033';
let SOURCE_URL = `https://raw.githubusercontent.com/${SOURCE_REPO}/${SOURCE_COMMIT}/data/use-case-candidates.json`;
const SOURCE_REPOSITORY = `https://github.com/${SOURCE_REPO}`;
let SOURCE_LICENSE = `https://github.com/${SOURCE_REPO}/blob/${SOURCE_COMMIT}/LICENSE`;
const OUTPUT_DIRECTORY = join(process.cwd(), 'var', 'ingest');
const SNAPSHOT_PATH = join(OUTPUT_DIRECTORY, 'candidates.json');
const REPORT_PATH = join(OUTPUT_DIRECTORY, 'review.json');

interface StoredSnapshot {
  source: {
    repository: string;
    url: string;
    commit: string;
    licenseSpdx: 'MIT';
    licenseUrl: string;
    fetchedAt: string;
  };
  candidates: Candidate[];
}

async function readPrevious(): Promise<StoredSnapshot | null> {
  try {
    return JSON.parse(await readFile(SNAPSHOT_PATH, 'utf8')) as StoredSnapshot;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

async function writeJsonAtomic(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporary, path);
}

async function main(): Promise<void> {
  const startedAt = new Date().toISOString();
  const previous = await readPrevious();
  let current: Candidate[] | null = null;
  let errorMessage: string | null = null;
  try {
    const input=argument('--input');
    if(!/^[a-f0-9]{40}$/.test(SOURCE_COMMIT)){
      if(input)throw new Error('Offline source import requires a fixed SOURCE_REF commit');
      const headers:Record<string,string>={'User-Agent':'jev-builds-directory',Accept:'application/vnd.github+json'};
      if(process.env.GH_READ_TOKEN)headers.Authorization=`Bearer ${process.env.GH_READ_TOKEN}`;
      const metadata=JSON.parse((await publicFetchText(`https://api.github.com/repos/${SOURCE_REPO}/commits/${encodeURIComponent(SOURCE_COMMIT)}`,{headers})).text);
      if(typeof metadata.sha!=='string'||!/^[a-f0-9]{40}$/.test(metadata.sha))throw new Error('Invalid upstream commit metadata');
      SOURCE_COMMIT=metadata.sha;SOURCE_URL=`https://raw.githubusercontent.com/${SOURCE_REPO}/${SOURCE_COMMIT}/data/use-case-candidates.json`;SOURCE_LICENSE=`https://github.com/${SOURCE_REPO}/blob/${SOURCE_COMMIT}/LICENSE`;
    }
    const response = input ? {text:await readFile(input,'utf8')} : await publicFetchText(SOURCE_URL, {
      allowedMimeTypes: ['application/json', 'text/plain'],
      maxBytes: 4 * 1024 * 1024,
    });
    current = adaptEveryAiCandidates(JSON.parse(response.text) as unknown, {
      sourceUrl: SOURCE_URL,
      commit: SOURCE_COMMIT,
      fetchedAt: startedAt,
    });
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error);
  }

  let baselineCount=previous?.candidates.length??0;
  try{const priorReport=JSON.parse(await readFile('reports/content-diff.json','utf8'));if(Number.isSafeInteger(priorReport.sourceCandidateCount)&&priorReport.sourceCandidateCount>baselineCount)baselineCount=priorReport.sourceCandidateCount;}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
  const decision = current && baselineCount>0 && current.length<baselineCount*0.8
    ? {accepted:false,reason:'count_drop',candidates:previous?.candidates??[]} : chooseSnapshot(previous?.candidates ?? [], current);
  if (decision.accepted && current) {
    await writeJsonAtomic(SNAPSHOT_PATH, {
      source: {
        repository: SOURCE_REPOSITORY,
        url: SOURCE_URL,
        commit: SOURCE_COMMIT,
        licenseSpdx: 'MIT',
        licenseUrl: SOURCE_LICENSE,
        fetchedAt: startedAt,
      },
      candidates: current,
    } satisfies StoredSnapshot);
  }
  await writeJsonAtomic(REPORT_PATH, {
    checkedAt: new Date().toISOString(),
    source: {
      repository: SOURCE_REPOSITORY,
      url: SOURCE_URL,
      commit: SOURCE_COMMIT,
      licenseSpdx: 'MIT',
      licenseUrl: SOURCE_LICENSE,
    },
    accepted: decision.accepted,
    reason: decision.reason,
    error: errorMessage,
    previousCount: previous?.candidates.length ?? 0,
    fetchedCount: current?.length ?? null,
    retainedCount: decision.candidates.length,
    publication: 'review_required',
  });
  if (!decision.accepted) {
    console.error(
      `Ingest retained the previous snapshot: ${errorMessage ?? decision.reason}`,
    );
    process.exitCode = 1;
    return;
  }
  console.log(
    `Wrote ${decision.candidates.length} review candidates to ${SNAPSHOT_PATH}`,
  );
}

await main();
