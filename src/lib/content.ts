import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { CATEGORY_IDS, ProjectSchema, PublicUrlSchema, toPublicProject, type Project, type PublicProject } from "./content-schema";

const CategorySchema = z.object({ id: z.enum(CATEGORY_IDS), en: z.string().trim().min(1), zh: z.string().trim().min(1) });
const SiteSchema = z.object({
  name: z.string().trim().min(1),
  site_url: PublicUrlSchema,
  contact_email: z.email().nullable(),
  commercial_mode: z.enum(["off", "inquiry", "active"]),
});
const TombstoneSchema = z.object({ id: z.string().trim().min(1), reason: z.string().trim().min(1), removed_at: z.string().datetime({ offset: true }) });

export interface Content {
  projects: PublicProject[];
  categories: Array<z.infer<typeof CategorySchema>>;
  site: z.infer<typeof SiteSchema>;
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function jsonFiles(directory: string): string[] {
  if (!existsSync(directory)) throw new Error(`Required content directory is missing: ${directory}`);
  return readdirSync(directory).filter((name) => name.endsWith(".json")).sort().map((name) => join(directory, name));
}

function assertUnique(projects: Project[], key: "id" | "slug" | "repository_id") {
  const seen = new Set<string>();
  for (const project of projects) {
    const value = project[key];
    if (value === null) continue;
    if (seen.has(value)) throw new Error(`Duplicate ${key}: ${value}`);
    seen.add(value);
  }
}

function applyOverrides(records: unknown[], overrideFiles: string[]): unknown[] {
  const overrides = overrideFiles.map(readJson) as Array<Record<string, unknown>>;
  return records.map((record) => {
    if (!record || typeof record !== "object" || !("id" in record)) return record;
    const recordId = (record as { id: unknown }).id;
    return overrides.reduce((current, override) => {
      const nested = override.project_id !== undefined;
      const target = nested ? override.project_id : override.id;
      if (target !== recordId) return current;
      const changes = nested ? override.changes : Object.fromEntries(Object.entries(override).filter(([key]) => key !== "id"));
      if (!changes || typeof changes !== "object" || Array.isArray(changes)) throw new Error("Invalid override changes");
      if ("id" in changes || "repository_id" in changes) throw new Error("Override cannot change id or repository_id");
      return { ...(current as object), ...changes };
    }, record);
  });
}

export function loadContent(root = process.cwd()): Content {
  const directory = join(root, "content");
  const projectFiles = jsonFiles(join(directory, "projects"));
  const overrideFiles = jsonFiles(join(directory, "overrides"));
  const categories = z.array(CategorySchema).min(1).parse(readJson(join(directory, "categories.json")));
  const site = SiteSchema.parse(readJson(join(directory, "site.json")));
  const tombstones = z.array(TombstoneSchema).parse(readJson(join(directory, "tombstones.json")));
  const projects = applyOverrides(projectFiles.map(readJson), overrideFiles).map((value) => ProjectSchema.parse(value));

  assertUnique(projects, "id");
  assertUnique(projects, "slug");
  assertUnique(projects, "repository_id");
  const categoryIds = new Set(categories.map(({ id }) => id));
  for (const project of projects) {
    for (const category of [project.primary_category, ...project.secondary_categories]) {
      if (!categoryIds.has(category)) throw new Error(`Unknown category in ${project.id}: ${category}`);
    }
  }
  const removed = new Set(tombstones.map(({ id }) => id));
  return { projects: projects.filter((project) => project.status === "published" && !removed.has(project.id)).map(toPublicProject), categories, site };
}
