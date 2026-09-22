import { describe, expect, it } from 'vitest';
import {
  isPublicAddress,
  mapWithConcurrency,
  publicFetchText,
} from '../../src/lib/ingest/public-fetch';
import {
  adaptEveryAiCandidates,
  chooseSnapshot,
} from '../../src/lib/ingest/source-adapter';

describe('public fetch policy', () => {
  it('bounds DNS and the complete response duration, not just socket inactivity',async()=>{
    const slow=async()=>{await new Promise(done=>setTimeout(done,30));};
    await expect(publicFetchText('https://source.example/data.json',{timeoutMs:3,maxRetries:0,resolve:async()=>{await slow();return ['1.1.1.1'];},request:async()=>({status:200,headers:{'content-type':'application/json'},body:new TextEncoder().encode('{}')})})).rejects.toThrow(/timed out/i);
    await expect(publicFetchText('https://source.example/data.json',{timeoutMs:3,maxRetries:0,resolve:async()=>['1.1.1.1'],request:async()=>{await slow();return {status:200,headers:{'content-type':'application/json'},body:new TextEncoder().encode('{}')};}})).rejects.toThrow(/timed out/i);
  });
  it.each([
    '127.0.0.1',
    '10.0.0.1',
    '172.16.0.1',
    '192.168.1.1',
    '169.254.169.254',
    '0.0.0.0',
    '224.0.0.1',
    '::1',
    'fc00::1',
    'fe80::1',
    '::ffff:127.0.0.1',
  ])('rejects non-public address %s', (address) =>
    expect(isPublicAddress(address)).toBe(false),
  );

  it.each(['1.1.1.1', '8.8.8.8', '2606:4700:4700::1111'])(
    'accepts public address %s',
    (address) => expect(isPublicAddress(address)).toBe(true),
  );

  it('revalidates each redirect and does not forward credentials across origins', async () => {
    const calls: Array<{ url: string; headers: Record<string, string> }> = [];
    const result = await publicFetchText('https://source.example/data.json', {
      headers: {
        authorization: 'Bearer secret',
        'x-github-api-version': '2022-11-28',
      },
      resolve: async () => ['93.184.216.34'],
      request: async (url, options) => {
        calls.push({ url: url.href, headers: options.headers });
        if (calls.length === 1)
          return {
            status: 302,
            headers: { location: 'https://cdn.example/data.json' },
            body: new Uint8Array(),
          };
        return {
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: new TextEncoder().encode('[]'),
        };
      },
    });
    expect(result.text).toBe('[]');
    expect(calls).toHaveLength(2);
    expect(calls[0]?.headers.authorization).toBe('Bearer secret');
    expect(calls[1]?.headers.authorization).toBeUndefined();
  });

  it('retries 429 with bounded Retry-After and stops after two retries', async () => {
    let attempts = 0;
    const waits: number[] = [];
    await expect(
      publicFetchText('https://example.com/data.json', {
        resolve: async () => ['93.184.216.34'],
        sleep: async (ms) => void waits.push(ms),
        request: async () => {
          attempts += 1;
          return {
            status: 429,
            headers: { 'retry-after': '999999' },
            body: new Uint8Array(),
          };
        },
      }),
    ).rejects.toThrow(/429/);
    expect(attempts).toBe(3);
    expect(waits).toEqual([30_000, 30_000]);
  });

  it('rejects unexpected MIME types and oversized bodies', async () => {
    const resolve = async () => ['93.184.216.34'];
    await expect(
      publicFetchText('https://example.com/data.json', {
        resolve,
        request: async () => ({
          status: 200,
          headers: { 'content-type': 'text/html' },
          body: new TextEncoder().encode('ok'),
        }),
      }),
    ).rejects.toThrow(/content-type/i);
    await expect(
      publicFetchText('https://example.com/data.json', {
        maxBytes: 2,
        resolve,
        request: async () => ({
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: new TextEncoder().encode('[1]'),
        }),
      }),
    ).rejects.toThrow(/size/i);
  });

  it('limits concurrent work', async () => {
    let active = 0;
    let peak = 0;
    const values = await mapWithConcurrency(
      [1, 2, 3, 4, 5],
      3,
      async (value) => {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 2));
        active -= 1;
        return value * 2;
      },
    );
    expect(values).toEqual([2, 4, 6, 8, 10]);
    expect(peak).toBe(3);
  });
});

describe('everyai source adapter', () => {
  const metadata = {
    sourceUrl: 'https://example.test/data.json',
    commit: 'abc',
    fetchedAt: '2026-09-20T00:00:00Z',
  };

  it('maps the real upstream shape to a candidate whitelist', () => {
    const result = adaptEveryAiCandidates(
      [
        {
          id: 'x',
          status: 'approved',
          title: 'Example',
          category: 'Work',
          description: 'Claim',
          sourceUrl: 'https://github.com/acme/example',
          prompt: 'untrusted',
          handle: 'person',
          note: 'note',
          submittedAt: '2026-09-19T00:00:00Z',
          reviewedAt: '2026-09-20T00:00:00Z',
        },
      ],
      metadata,
    );
    expect(result).toEqual([
      {
        upstreamId: 'x',
        title: 'Example',
        category: 'Work',
        description: 'Claim',
        projectUrl: 'https://github.com/acme/example',
        source: metadata,
      },
    ]);
    expect(result[0]).not.toHaveProperty('prompt');
    expect(result[0]).not.toHaveProperty('handle');
  });

  it('rejects empty and changed schemas', () => {
    expect(chooseSnapshot([],[]).accepted).toBe(false);
    expect(() => adaptEveryAiCandidates([], metadata)).toThrow(/empty/i);
    expect(() => adaptEveryAiCandidates([{ id: 'x' }], metadata)).toThrow(
      /schema/i,
    );
  });

  it('keeps the last successful snapshot after failures or a greater-than-20-percent drop', () => {
    const previous = Array.from({ length: 10 }, (_, index) => ({
      upstreamId: String(index),
    }));
    expect(chooseSnapshot(previous, null)).toMatchObject({
      accepted: false,
      candidates: previous,
    });
    expect(chooseSnapshot(previous, previous.slice(0, 7))).toMatchObject({
      accepted: false,
      reason: 'count_drop',
      candidates: previous,
    });
    expect(chooseSnapshot(previous, previous.slice(0, 8))).toMatchObject({
      accepted: true,
      candidates: previous.slice(0, 8),
    });
  });
});
