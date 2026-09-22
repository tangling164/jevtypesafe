export const validProject = {
  id: "project-1",
  slug: "project-one",
  name: "Project One",
  owner: "Example Org",
  primary_category: "developer",
  secondary_categories: ["review"],
  tags: ["coding-agent", "quality"],
  ecosystem: "jev_integration",
  source_status: "open_source",
  repo_url: "https://github.com/example/project-one",
  demo_url: null,
  website_url: "https://example.com/project-one",
  repository_id: "github:123",
  license: {
    spdx: "MIT",
    url: "https://github.com/example/project-one/blob/main/LICENSE",
    checked_at: "2026-09-20T00:00:00.000Z",
    method: "github_api",
  },
  requirements: {
    api_key: false,
    additional_model: true,
    local_install: true,
    hardware: null,
  },
  locales: {
    en: {
      summary: "A compact project summary.",
      problem: "Helps developers review code.",
      requirements_text: "Install locally.",
      generation: { status: "reviewed", source_refs: ["source-1"] },
    },
    zh: {
      summary: "简短的项目摘要。",
      problem: "帮助开发者审核代码。",
      requirements_text: "需本地安装。",
      generation: { status: "reviewed", source_refs: ["source-1"] },
    },
  },
  sources: [
    {
      url: "https://github.com/example/project-one",
      type: "repository",
      revision: "abc123",
      fetched_at: "2026-09-20T00:00:00.000Z",
    },
  ],
  stars: 42,
  repo_updated_at: "2026-09-19T00:00:00.000Z",
  first_published_at: "2026-09-20T00:00:00.000Z",
  checked_at: "2026-09-20T00:00:00.000Z",
  archived: false,
  verification: "source_checked",
  runtime_evidence: null,
  status: "published",
  source_hash: "sha256:secret-input-hash",
  generation: {
    provider: "example",
    model: "example-model",
    prompt_version: "v1",
    generated_at: "2026-09-20T00:00:00.000Z",
  },
  private_notes: "must never be public",
};

export function project(overrides: Record<string, unknown> = {}) {
  return structuredClone({ ...validProject, ...overrides });
}
