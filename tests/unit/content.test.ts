import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadContent } from "../../src/lib/content";
import { project } from "../fixtures/project";

function fixtureRoot(projects: unknown[], options: { overrides?: unknown[]; tombstones?: unknown[] } = {}) {
  const root = mkdtempSync(join(tmpdir(), "jev-content-"));
  mkdirSync(join(root, "content", "projects"), { recursive: true });
  mkdirSync(join(root, "content", "overrides"), { recursive: true });
  projects.forEach((value, index) =>
    writeFileSync(join(root, "content", "projects", `${index}.json`), JSON.stringify(value)),
  );
  (options.overrides ?? []).forEach((value, index) =>
    writeFileSync(join(root, "content", "overrides", `${index}.json`), JSON.stringify(value)),
  );
  writeFileSync(
    join(root, "content", "categories.json"),
    JSON.stringify([
      { id: "data", en: "Data & Classification", zh: "数据与分类", description: { en: "Projects that structure and classify data for downstream workflows.", zh: "用于整理、分类数据并支持后续工作流处理与使用的项目说明。" } },
      { id: "review", en: "Review & Validation", zh: "审核与校验", description: { en: "Projects that review and validate content against defined evidence.", zh: "按照明确证据、规则或选项审核和校验内容与决策的项目说明。" } },
      { id: "developer", en: "Developer Tools", zh: "开发工具", description: { en: "Tools and integrations that help developers use Jev in software.", zh: "帮助开发者在软件项目中测试、连接和使用 Jev 的工具与集成说明。" } },
    ]),
  );
  writeFileSync(
    join(root, "content", "site.json"),
    JSON.stringify({ name: "Test", site_url: "https://example.com", contact_email: null, commercial_mode: "off" }),
  );
  writeFileSync(join(root, "content", "tombstones.json"), JSON.stringify(options.tombstones ?? []));
  return root;
}

describe("loadContent", () => {
  it("publishes only published, non-tombstoned records and suppresses private fields", () => {
    const draft = project({ id: "draft", slug: "draft", repository_id: "github:124", status: "draft" });
    const removed = project({ id: "removed", slug: "removed", repository_id: "github:125" });
    const root = fixtureRoot([project(), draft, removed], {
      tombstones: [{ id: "removed", reason: "author request", removed_at: "2026-09-20T00:00:00.000Z" }],
    });

    const loaded = loadContent(root);
    expect(loaded.projects.map(({ id }) => id)).toEqual(["project-1"]);
    expect(loaded.projects[0]).not.toHaveProperty("source_hash");
    expect(loaded).toMatchObject({ site: { name: "Test", commercial_mode: "off" } });
  });

  it("applies overrides before validation and tombstones take final precedence", () => {
    const root = fixtureRoot([project({ status: "draft" })], {
      overrides: [{ id: "project-1", status: "published", stars: 99 }],
      tombstones: [{ id: "project-1", reason: "removed", removed_at: "2026-09-20T00:00:00.000Z" }],
    });
    expect(loadContent(root).projects).toEqual([]);
  });

  it("forbids overriding stable identity fields", () => {
    const idRoot = fixtureRoot([project()], {
      overrides: [{ project_id: "project-1", changes: { id: "changed" } }],
    });
    expect(() => loadContent(idRoot)).toThrow(/override/i);

    const repositoryRoot = fixtureRoot([project()], {
      overrides: [{ id: "project-1", repository_id: "changed" }],
    });
    expect(() => loadContent(repositoryRoot)).toThrow(/override/i);
  });

  it("rejects duplicate ids, slugs, and repository ids", () => {
    expect(() => loadContent(fixtureRoot([project(), project({ name: "Duplicate" })]))).toThrow(/duplicate id/i);
    expect(() =>
      loadContent(fixtureRoot([project(), project({ id: "two", repository_id: "github:2" })])),
    ).toThrow(/duplicate slug/i);
    expect(() =>
      loadContent(fixtureRoot([project(), project({ id: "two", slug: "two" })])),
    ).toThrow(/duplicate repository_id/i);
  });

  it("rejects categories that are not declared by categories.json", () => {
    const root = fixtureRoot([project({ primary_category: "routing" })]);
    expect(() => loadContent(root)).toThrow(/unknown category/i);
  });

  it("fails when a required content directory is missing", () => {
    const root = mkdtempSync(join(tmpdir(), "jev-content-missing-"));
    expect(() => loadContent(root)).toThrow();
  });
});
