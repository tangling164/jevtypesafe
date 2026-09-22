import { describe, expect, it } from "vitest";
import { ProjectSchema, toPublicProject } from "../../src/lib/content-schema";
import { project } from "../fixtures/project";

describe("ProjectSchema", () => {
  it("accepts a complete valid project and strips unknown fields", () => {
    const parsed = ProjectSchema.parse(project());
    expect(parsed.id).toBe("project-1");
    expect(parsed).not.toHaveProperty("private_notes");
  });

  it.each([
    ["javascript URL", { repo_url: "javascript:alert(1)" }],
    ["credentialed URL", { website_url: "https://user:pass@example.com" }],
    ["localhost URL", { demo_url: "http://localhost:3000" }],
    ["private IPv4 URL", { demo_url: "http://192.168.1.3/demo" }],
    ["reserved IPv4 URL", { demo_url: "http://203.0.113.4/demo" }],
  ])("rejects a %s", (_name, change) => {
    expect(() => ProjectSchema.parse(project(change))).toThrow();
  });

  it("rejects invalid dates", () => {
    expect(() => ProjectSchema.parse(project({ checked_at: "last Tuesday" }))).toThrow();
  });

  it("rejects spoofed open-source licenses", () => {
    expect(() =>
      ProjectSchema.parse(
        project({
          license: {
            spdx: "GPL-3.0",
            url: "https://example.com/LICENSE",
            checked_at: "2026-09-20T00:00:00.000Z",
            method: "manual",
          },
        }),
      ),
    ).toThrow();
  });

  it("requires a demo and forbids a repository for demo-only projects", () => {
    expect(() =>
      ProjectSchema.parse(project({ source_status: "demo_only", demo_url: null, repo_url: null, license: null })),
    ).toThrow();
    expect(() =>
      ProjectSchema.parse(project({ source_status: "demo_only", demo_url: "https://example.com/demo", license: null })),
    ).toThrow();
  });

  it("requires runtime evidence for runtime-tested projects", () => {
    expect(() => ProjectSchema.parse(project({ verification: "runtime_tested" }))).toThrow();
  });

  it("requires reviewed sourced English for published projects", () => {
    const value = project();
    value.locales.en.generation = { status: "pending", source_refs: [] };
    expect(() => ProjectSchema.parse(value)).toThrow();
  });

  it("enforces category and tag limits and vocabularies", () => {
    expect(() => ProjectSchema.parse(project({ primary_category: "made-up" }))).toThrow();
    expect(() => ProjectSchema.parse(project({ tags: ["made-up"] }))).toThrow();
    expect(() => ProjectSchema.parse(project({ secondary_categories: ["data", "routing", "review"] }))).toThrow();
  });
});

describe("toPublicProject", () => {
  it("uses a public allowlist and omits pending Chinese content and provenance", () => {
    const value = project();
    value.locales.zh!.generation.status = "pending";
    const publicProject = toPublicProject(ProjectSchema.parse(value));

    expect(publicProject.locales.zh).toBeNull();
    expect(publicProject).not.toHaveProperty("source_hash");
    expect(publicProject).not.toHaveProperty("generation");
    expect(publicProject).not.toHaveProperty("private_notes");
    expect(publicProject.locales.en).not.toHaveProperty("generation");
  });
});
