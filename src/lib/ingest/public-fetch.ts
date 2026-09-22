import { lookup as dnsLookup } from 'node:dns/promises';
import http, { type IncomingHttpHeaders, type RequestOptions } from 'node:http';
import https from 'node:https';
import { isIP } from 'node:net';

export interface RawResponse {
  status: number;
  headers: Record<string, string | undefined>;
  body: Uint8Array;
}

export interface RequestContext {
  headers: Record<string, string>;
  timeoutMs: number;
  maxBytes: number;
}

export interface PublicFetchOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  maxRetries?: number;
  allowedMimeTypes?: string[];
  resolve?: (hostname: string) => Promise<string[]>;
  request?: (url: URL, options: RequestContext) => Promise<RawResponse>;
  sleep?: (milliseconds: number) => Promise<void>;
}

const IPV4_BLOCKS: ReadonlyArray<readonly [number, number]> = [
  [0x00000000, 8],
  [0x0a000000, 8],
  [0x64400000, 10],
  [0x7f000000, 8],
  [0xa9fe0000, 16],
  [0xac100000, 12],
  [0xc0000000, 24],
  [0xc0000200, 24],
  [0xc0586300, 24],
  [0xc0a80000, 16],
  [0xc6120000, 15],
  [0xc6336400, 24],
  [0xcb007100, 24],
  [0xe0000000, 4],
  [0xf0000000, 4],
];

function ipv4Number(address: string): number | null {
  const parts = address.split('.').map(Number);
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  )
    return null;
  return (
    (((parts[0]! << 24) >>> 0) +
      (parts[1]! << 16) +
      (parts[2]! << 8) +
      parts[3]!) >>>
    0
  );
}

function ipv6Number(address: string): bigint | null {
  const zone = address.split('%')[0]!;
  const mapped = zone.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) {
    const v4 = ipv4Number(mapped[1]!);
    return v4 === null ? null : (0xffffn << 32n) | BigInt(v4);
  }
  const halves = zone.split('::');
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(':') : [];
  const right = halves[1] ? halves[1].split(':') : [];
  const missing = 8 - left.length - right.length;
  if (missing < 0 || (halves.length === 1 && missing !== 0)) return null;
  const groups = [
    ...left,
    ...Array.from({ length: missing }, () => '0'),
    ...right,
  ];
  if (
    groups.length !== 8 ||
    groups.some((group) => !/^[0-9a-f]{1,4}$/i.test(group))
  )
    return null;
  return groups.reduce(
    (value, group) => (value << 16n) | BigInt(`0x${group}`),
    0n,
  );
}

function inPrefix(
  value: bigint,
  network: bigint,
  bits: number,
  width: number,
): boolean {
  const shift = BigInt(width - bits);
  return value >> shift === network >> shift;
}

export function isPublicAddress(address: string): boolean {
  const family = isIP(address.split('%')[0]!);
  if (family === 4) {
    const value = ipv4Number(address)!;
    return !IPV4_BLOCKS.some(
      ([network, bits]) => value >>> (32 - bits) === network >>> (32 - bits),
    );
  }
  if (family !== 6) return false;
  const value = ipv6Number(address);
  if (value === null) return false;
  if (value >> 32n === 0xffffn)
    return isPublicAddress(
      String(Number(value & 0xffffffffn) >>> 24) +
        '.' +
        String(Number((value >> 16n) & 255n)) +
        '.' +
        String(Number((value >> 8n) & 255n)) +
        '.' +
        String(Number(value & 255n)),
    );
  const blocked: ReadonlyArray<readonly [bigint, number]> = [
    [0n, 128],
    [1n, 128],
    [0xfc00n << 112n, 7],
    [0xfe80n << 112n, 10],
    [0xff00n << 112n, 8],
    [0x20010db8n << 96n, 32],
  ];
  return !blocked.some(([network, bits]) =>
    inPrefix(value, network, bits, 128),
  );
}

async function resolvePublic(hostname: string): Promise<string[]> {
  const results = await dnsLookup(hostname, { all: true, verbatim: true });
  return results.map(({ address }) => address);
}

function normalizedHeaders(
  headers: IncomingHttpHeaders,
): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      key.toLowerCase(),
      Array.isArray(value) ? value.join(', ') : value,
    ]),
  );
}

function nodeRequest(url: URL, context: RequestContext): Promise<RawResponse> {
  const client = url.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const options: RequestOptions = {
      headers: context.headers,
      timeout: context.timeoutMs,
      lookup(hostname, options, callback) {
        void dnsLookup(hostname, { all: true, verbatim: true }).then(
          (addresses) => {
            const publicAddresses = addresses.filter(({ address }) =>
              isPublicAddress(address),
            );
            if (
              publicAddresses.length !== addresses.length ||
              publicAddresses.length === 0
            )
              return callback(
                new Error('DNS resolved to a non-public address'),
                '',
                4,
              );
            publicAddresses.sort((left, right) => left.family - right.family);
            if (options.all) {
              callback(null, publicAddresses);
              return;
            }
            const selected =
              publicAddresses.find(({ family }) => family === 4) ??
              publicAddresses[0]!;
            callback(null, selected.address, selected.family);
          },
          (error: Error) => callback(error, '', 4),
        );
      },
    };
    const request = client.request(url, options, (response) => {
      const chunks: Buffer[] = [];
      let size = 0;
      response.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > context.maxBytes)
          request.destroy(
            new Error(`Response size exceeds ${context.maxBytes} bytes`),
          );
        else chunks.push(chunk);
      });
      response.on('end', () =>
        resolve({
          status: response.statusCode ?? 0,
          headers: normalizedHeaders(response.headers),
          body: Buffer.concat(chunks),
        }),
      );
    });
    request.on('timeout', () =>
      request.destroy(
        new Error(`Request timed out after ${context.timeoutMs}ms`),
      ),
    );
    request.on('error', reject);
    request.end();
  });
}

const sleepDefault = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

function withDeadline<T>(work: Promise<T>, milliseconds: number, phase: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${phase} timed out after ${milliseconds}ms`)),
      milliseconds,
    );
    timer.unref?.();
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function retryDelay(value: string | undefined, attempt: number): number {
  if (value) {
    const seconds = Number(value);
    if (Number.isFinite(seconds))
      return Math.min(30_000, Math.max(0, seconds * 1000));
    const date = Date.parse(value);
    if (Number.isFinite(date))
      return Math.min(30_000, Math.max(0, date - Date.now()));
  }
  return Math.min(30_000, 500 * 2 ** attempt);
}

const CREDENTIAL_HEADERS = new Set([
  'authorization',
  'proxy-authorization',
  'cookie',
  'x-api-key',
  'x-github-token',
]);

export async function publicFetchText(
  input: string | URL,
  options: PublicFetchOptions = {},
): Promise<{ text: string; url: string; status: number; contentType: string }> {
  const timeoutMs = options.timeoutMs ?? 15_000;
  const maxBytes = options.maxBytes ?? 2 * 1024 * 1024;
  const maxRedirects = options.maxRedirects ?? 5;
  const maxRetries = options.maxRetries ?? 2;
  const allowed = options.allowedMimeTypes ?? [
    'application/json',
    'text/plain',
    'text/markdown',
  ];
  const resolveHost = options.resolve ?? resolvePublic;
  const request = options.request ?? nodeRequest;
  const sleep = options.sleep ?? sleepDefault;
  let url = new URL(input);
  let headers = Object.fromEntries(
    Object.entries(options.headers ?? {}).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ]),
  );
  let redirects = 0;
  for (;;) {
    if (url.protocol !== 'https:' && url.protocol !== 'http:')
      throw new Error('Only public HTTP(S) URLs are allowed');
    if (url.username || url.password)
      throw new Error('URL credentials are not allowed');
    const addresses = await withDeadline(
      resolveHost(url.hostname),
      timeoutMs,
      'DNS resolution',
    );
    if (
      addresses.length === 0 ||
      addresses.some((address) => !isPublicAddress(address))
    )
      throw new Error(`Host ${url.hostname} resolved to a non-public address`);
    let response: RawResponse | undefined;
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      response = await withDeadline(
        request(url, { headers, timeoutMs, maxBytes }),
        timeoutMs,
        'Request',
      );
      if (response.status !== 429 && response.status < 500) break;
      if (attempt === maxRetries)
        throw new Error(
          `Upstream returned ${response.status} after ${attempt + 1} attempts`,
        );
      await sleep(retryDelay(response.headers['retry-after'], attempt));
    }
    if (!response) throw new Error('No response');
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.location;
      if (!location) throw new Error('Redirect response is missing Location');
      if (redirects >= maxRedirects) throw new Error('Too many redirects');
      const next = new URL(location, url);
      if (next.origin !== url.origin)
        headers = Object.fromEntries(
          Object.entries(headers).filter(
            ([key]) => !CREDENTIAL_HEADERS.has(key),
          ),
        );
      url = next;
      redirects += 1;
      continue;
    }
    if (response.status < 200 || response.status >= 300)
      throw new Error(`Upstream returned ${response.status}`);
    if (response.body.byteLength > maxBytes)
      throw new Error(`Response size exceeds ${maxBytes} bytes`);
    const contentType = (response.headers['content-type'] ?? '')
      .split(';', 1)[0]!
      .trim()
      .toLowerCase();
    if (!allowed.includes(contentType))
      throw new Error(`Unexpected content-type: ${contentType || 'missing'}`);
    return {
      text: new TextDecoder('utf-8', { fatal: true }).decode(response.body),
      url: url.href,
      status: response.status,
      contentType,
    };
  }
}

export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error('Concurrency must be a positive integer');
  const results = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      for (;;) {
        const index = next++;
        if (index >= items.length) return;
        results[index] = await mapper(items[index]!, index);
      }
    }),
  );
  return results;
}
