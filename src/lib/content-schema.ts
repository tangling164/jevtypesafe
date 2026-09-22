import { z } from "zod";
import { isPublicHttpUrl } from "./public-url";

export const CATEGORY_IDS = ["data", "routing", "filtering", "review", "developer", "experiments"] as const;
export const TAG_IDS = [
  "classification",
  "coding-agent",
  "content-review",
  "data-processing",
  "evaluation",
  "filtering",
  "quality",
  "research",
  "routing",
  "search",
  "tooling",
  "workflow",
] as const;
export const OPEN_SOURCE_LICENSES = ["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC"] as const;

const isoDateTime = z.string().datetime({ offset: true });
export const PublicUrlSchema = z.string().url().refine(isPublicHttpUrl, "URL must be a public HTTP(S) URL");
const nullableUrl = PublicUrlSchema.nullable();
const category = z.enum(CATEGORY_IDS);

const LocaleSchema = z.object({
  summary: z.string().trim().min(1),
  problem: z.string().trim().min(1),
  requirements_text: z.string().trim().min(1),
  generation: z.object({
    status: z.enum(["reviewed", "pending"]),
    source_refs: z.array(z.string().trim().min(1)),
  }),
});

const LicenseSchema = z.object({
  spdx: z.string().trim().min(1),
  url: PublicUrlSchema,
  checked_at: isoDateTime,
  method: z.string().trim().min(1),
});

export const ProjectSchema = z
  .object({
    id: z.string().trim().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().trim().min(1),
    owner: z.string().trim().min(1).nullable(),
    primary_category: category,
    secondary_categories: z.array(category).max(2).default([]),
    tags: z.array(z.enum(TAG_IDS)).max(5),
    ecosystem: z.enum(["jev", "jev_integration", "jev_like", "unknown"]),
    source_status: z.enum(["open_source", "source_available", "demo_only", "unknown"]),
    repo_url: nullableUrl,
    demo_url: nullableUrl,
    website_url: nullableUrl,
    repository_id: z.string().trim().min(1).nullable(),
    license: LicenseSchema.nullable(),
    requirements: z.object({
      api_key: z.boolean().nullable(),
      additional_model: z.boolean().nullable(),
      local_install: z.boolean().nullable(),
      hardware: z.string().trim().min(1).nullable(),
    }),
    locales: z.object({ en: LocaleSchema, zh: LocaleSchema.nullable() }),
    sources: z
      .array(
        z.object({
          url: PublicUrlSchema,
          type: z.enum(["repository", "readme", "license", "website", "post"]),
          revision: z.string().trim().min(1).nullable(),
          fetched_at: isoDateTime,
        }),
      )
      .min(1),
    stars: z.number().int().nonnegative().nullable(),
    repo_updated_at: isoDateTime.nullable(),
    first_published_at: isoDateTime.nullable(),
    checked_at: isoDateTime,
    archived: z.boolean().nullable(),
    verification: z.enum(["source_checked", "runtime_tested"]),
    runtime_evidence: nullableUrl,
    status: z.enum(["draft", "review", "published", "unlisted"]),
    source_hash: z.string().trim().min(1).nullable(),
    generation: z
      .object({
        provider: z.string().trim().min(1),
        model: z.string().trim().min(1),
        prompt_version: z.string().trim().min(1),
        generated_at: isoDateTime,
      })
      .nullable(),
  })
  .superRefine((value, context) => {
    if (new Set([value.primary_category, ...value.secondary_categories]).size !== 1 + value.secondary_categories.length) {
      context.addIssue({ code: "custom", path: ["secondary_categories"], message: "Categories must be unique" });
    }
    if (new Set(value.tags).size !== value.tags.length) {
      context.addIssue({ code: "custom", path: ["tags"], message: "Tags must be unique" });
    }
    if (value.source_status === "open_source") {
      if (!value.repo_url || !value.license || !OPEN_SOURCE_LICENSES.includes(value.license.spdx as never)) {
        context.addIssue({ code: "custom", path: ["license"], message: "Open source requires a repository and allowlisted license" });
      }
    }
    if (value.source_status === "demo_only" && (!value.demo_url || value.repo_url)) {
      context.addIssue({ code: "custom", path: ["source_status"], message: "Demo only requires a demo and forbids a repository" });
    }
    if (value.verification === "runtime_tested" && !value.runtime_evidence) {
      context.addIssue({ code: "custom", path: ["runtime_evidence"], message: "Runtime tested requires public evidence" });
    }
    if (
      value.status === "published" &&
      (value.locales.en.generation.status !== "reviewed" || value.locales.en.generation.source_refs.length === 0)
    ) {
      context.addIssue({ code: "custom", path: ["locales", "en"], message: "Published English content must be reviewed and sourced" });
    }
  });

export type Project = z.infer<typeof ProjectSchema>;

export type PublicProject = Pick<
  Project,
  | "id" | "slug" | "name" | "owner" | "primary_category" | "secondary_categories" | "tags"
  | "ecosystem" | "source_status" | "repo_url" | "demo_url" | "website_url" | "license"
  | "requirements" | "sources" | "stars" | "repo_updated_at" | "first_published_at" | "checked_at"
  | "archived" | "verification" | "runtime_evidence"
> & { locales: { en: Omit<Project["locales"]["en"], "generation">; zh: Omit<NonNullable<Project["locales"]["zh"]>, "generation"> | null } };

function publicLocale(locale: Project["locales"]["en"]) {
  return { summary: locale.summary, problem: locale.problem, requirements_text: locale.requirements_text };
}

export function toPublicProject(project: Project): PublicProject {
  return {
    id: project.id, slug: project.slug, name: project.name, owner: project.owner,
    primary_category: project.primary_category, secondary_categories: project.secondary_categories, tags: project.tags,
    ecosystem: project.ecosystem, source_status: project.source_status, repo_url: project.repo_url,
    demo_url: project.demo_url, website_url: project.website_url, license: project.license,
    requirements: project.requirements,
    locales: {
      en: publicLocale(project.locales.en),
      zh: project.locales.zh?.generation.status === "reviewed" ? publicLocale(project.locales.zh) : null,
    },
    sources: project.sources, stars: project.stars, repo_updated_at: project.repo_updated_at,
    first_published_at: project.first_published_at, checked_at: project.checked_at, archived: project.archived,
    verification: project.verification, runtime_evidence: project.runtime_evidence,
  };
}
