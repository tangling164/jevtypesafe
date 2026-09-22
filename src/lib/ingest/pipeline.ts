import { createHash } from "node:crypto";
import { OPEN_SOURCE_LICENSES } from "../content-schema";

export interface PipelineSource {
  url: string;
  type: "repository" | "readme" | "license" | "website" | "post";
  revision: string | null;
  fetched_at: string;
}

export interface RepositoryCandidate {
  repositoryId: string;
  repoUrl: string;
  name: string;
  sources: PipelineSource[];
  slug?: string;
  [key: string]: unknown;
}

export interface ExistingRepository {
  id: string;
  slug: string;
  repository_id: string | null;
  repo_url: string | null;
}

export interface MergedRepository extends RepositoryCandidate {
  stableId: string;
  slug: string;
  reviewReasons: string[];
}

export function mapLicense(spdx: string | null | undefined): "open_source" | "source_available" {
  return spdx && OPEN_SOURCE_LICENSES.includes(spdx as (typeof OPEN_SOURCE_LICENSES)[number])
    ? "open_source"
    : "source_available";
}

function slugify(value: string): string {
  const slug = value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "project";
}

function stableId(repositoryId: string): string {
  return `github-${repositoryId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

export function mergeRepositories(
  candidates: readonly RepositoryCandidate[],
  existing: readonly ExistingRepository[] = [],
): MergedRepository[] {
  const existingByRepository = new Map(existing.filter((item) => item.repository_id).map((item) => [item.repository_id!, item]));
  const merged = new Map<string, RepositoryCandidate>();
  for (const candidate of candidates) {
    const previous = merged.get(candidate.repositoryId);
    if (!previous) {
      merged.set(candidate.repositoryId, { ...candidate, sources: [...candidate.sources] });
      continue;
    }
    const uniqueSources = new Map(
      [...previous.sources, ...candidate.sources].map((item) => [`${item.type}\0${item.url}\0${item.revision ?? ""}`, item]),
    );
    merged.set(candidate.repositoryId, { ...previous, ...candidate, sources: [...uniqueSources.values()] });
  }
  return [...merged.values()].map((candidate) => {
    const old = existingByRepository.get(candidate.repositoryId);
    const renamed = Boolean(old?.repo_url && normalizeRepositoryUrl(old.repo_url) !== normalizeRepositoryUrl(candidate.repoUrl));
    return {
      ...candidate,
      stableId: old?.id ?? stableId(candidate.repositoryId),
      slug: old?.slug ?? candidate.slug ?? slugify(candidate.name),
      reviewReasons: renamed ? ["repository_renamed_redirect_required"] : [],
    };
  });
}

function normalizeRepositoryUrl(value: string): string {
  const url = new URL(value);
  url.search = "";
  url.hash = "";
  return url.href.replace(/\.git\/?$/, "").replace(/\/$/, "").toLowerCase();
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key !== "stars" && key !== "fetchedAt" && key !== "fetched_at")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nested]) => [key, canonicalize(nested)]),
  );
}

export function substantiveHash(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex")}`;
}

export function applyPublicationPolicy<T extends { id: string; repository_id?: string | null }>(
  records: readonly T[],
  overrides: readonly Record<string, unknown>[],
  tombstones: readonly { id: string }[],
): T[] {
  const removed = new Set(tombstones.map(({ id }) => id));
  return records
    .filter(({ id }) => !removed.has(id))
    .map((record) => {
      let result=structuredClone(record);
      for(const override of overrides){
        const nested=override.project_id!==undefined;
        if((nested?override.project_id:override.id)!==record.id)continue;
        const changes=nested?override.changes:Object.fromEntries(Object.entries(override).filter(([key])=>key!=='id'));
        if(!changes||typeof changes!=='object'||Array.isArray(changes))throw new Error('Invalid override changes');
        if('id' in changes||'repository_id' in changes)throw new Error('Override cannot change identity');
        result={...result,...changes};
      }
      return result;
    });
}
