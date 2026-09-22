export interface SourceMetadata {
  sourceUrl: string;
  commit: string;
  fetchedAt: string;
}
export interface Candidate {
  upstreamId: string;
  title: string;
  category: string;
  description: string;
  projectUrl: string;
  source: SourceMetadata;
}

function requiredString(
  record: Record<string, unknown>,
  field: string,
): string {
  const value = record[field];
  if (typeof value !== 'string' || value.trim() === '')
    throw new Error(
      `Upstream schema changed: ${field} must be a non-empty string`,
    );
  return value;
}

export function adaptEveryAiCandidates(
  input: unknown,
  source: SourceMetadata,
): Candidate[] {
  if (!Array.isArray(input))
    throw new Error('Upstream schema changed: expected an array');
  if (input.length === 0) throw new Error('Upstream candidate list is empty');
  return input.map((value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
      throw new Error('Upstream schema changed: candidate must be an object');
    const record = value as Record<string, unknown>;
    const projectUrl = requiredString(record, 'sourceUrl');
    const parsed = new URL(projectUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')
      throw new Error('Upstream schema changed: sourceUrl must use HTTP(S)');
    return {
      upstreamId: requiredString(record, 'id'),
      title: requiredString(record, 'title'),
      category: requiredString(record, 'category'),
      description: requiredString(record, 'description'),
      projectUrl: parsed.href,
      source,
    };
  });
}

export function chooseSnapshot<T>(
  previous: readonly T[],
  current: readonly T[] | null,
): {
  accepted: boolean;
  reason: 'fetch_failed' | 'count_drop' | null;
  candidates: readonly T[];
} {
  if (current === null || current.length===0)
    return { accepted: false, reason: 'fetch_failed', candidates: previous };
  if (previous.length > 0 && current.length < previous.length * 0.8)
    return { accepted: false, reason: 'count_drop', candidates: previous };
  return { accepted: true, reason: null, candidates: current };
}
