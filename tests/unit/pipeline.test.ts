import { describe, expect, it } from "vitest";
import { applyPublicationPolicy, mapLicense, mergeRepositories, substantiveHash } from "../../src/lib/ingest/pipeline";
import { project } from "../fixtures/project";

const source = (url: string) => ({ url, type: "post" as const, revision: null, fetched_at: "2026-09-20T00:00:00.000Z" });

describe("repository pipeline", () => {
  it('applies both supported override formats without changing identity',()=>{
    const records=[{id:'one',repository_id:'1',stars:1}];
    expect(applyPublicationPolicy(records,[{project_id:'one',changes:{stars:8}}],[])[0]?.stars).toBe(8);
    expect(()=>applyPublicationPolicy(records,[{project_id:'one',changes:{id:'two'}}],[])).toThrow();
  });
  it("merges duplicate repository IDs and keeps all distinct sources", () => {
    const merged = mergeRepositories([
      { repositoryId: "42", repoUrl: "https://github.com/example/old", name: "Old", sources: [source("https://example.com/a")] },
      { repositoryId: "42", repoUrl: "https://github.com/example/new", name: "New", sources: [source("https://example.com/b")] },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.sources.map(({ url }) => url)).toEqual(["https://example.com/a", "https://example.com/b"]);
  });

  it("uses repository identity for stable IDs and queues a redirect on rename", () => {
    const merged = mergeRepositories(
      [{ repositoryId: "42", repoUrl: "https://github.com/example/new", name: "New", sources: [] }],
      [{ id: "github-42", slug: "old-name", repository_id: "42", repo_url: "https://github.com/example/old" }],
    );
    expect(merged[0]).toMatchObject({ stableId: "github-42", slug: "old-name" });
    expect(merged[0]?.reviewReasons).toContain("repository_renamed_redirect_required");
  });

  it.each([
    ["MIT", "open_source"],
    ["Apache-2.0", "open_source"],
    ["NOASSERTION", "source_available"],
    ["GPL-3.0", "source_available"],
    [null, "source_available"],
  ])("maps license %s without falsely claiming open source", (spdx, expected) => {
    expect(mapLicense(spdx)).toBe(expected);
  });

  it("hashes substantive inputs but ignores stars and fetch timestamps", () => {
    const base = { repositoryId: "42", readme: "facts", summary: "summary", stars: 1, fetchedAt: "2026-09-20T00:00:00Z" };
    expect(substantiveHash(base)).toBe(substantiveHash({ ...base, stars: 999, fetchedAt: "2026-09-21T00:00:00Z" }));
    expect(substantiveHash(base)).not.toBe(substantiveHash({ ...base, summary: "changed" }));
  });

  it("applies overrides last and never restores tombstoned records", () => {
    const result = applyPublicationPolicy(
      [project({ id: "one", slug: "one", repository_id: "1", status: "review", stars: 1 })],
      [{ id: "one", stars: 9, status: "published" }],
      [{ id: "one" }],
    );
    expect(result).toEqual([]);
  });
});
