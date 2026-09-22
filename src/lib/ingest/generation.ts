import { z } from "zod";
import { isPublicHttpUrl } from "../public-url";

const GeneratedTextSchema = z.object({
  summary: z.string().trim().min(1),
  problem: z.string().trim().min(1),
  requirements_text: z.string().trim().min(1),
  source_refs: z.array(z.string().refine(isPublicHttpUrl)).min(1),
});

export type GeneratedText = z.infer<typeof GeneratedTextSchema>;
export interface GenerationJob { id: string; sourceHash: string; input: string; sourceRefs: string[] }
export interface SummaryProvider {
  name: string;
  model: string;
  /** Conservative per-request ceiling from the chosen provider's actual prices. */
  estimateMaxCostUsd(input: {text:string; maxOutputCharacters:number}): number;
  generate(input: { text: string; sourceRefs: string[]; apiKey: string; maxOutputCharacters: number }): Promise<unknown>;
}
export interface PreviousGeneration { sourceHash: string; output: GeneratedText }
export interface GenerationOptions {
  provider: SummaryProvider | null;
  apiKey: string | null;
  budget: number;
  dryRun?: boolean;
  limits?: Partial<{ maxJobs: number; maxInputCharacters: number; maxOutputCharacters: number }>;
  previous?: Record<string, PreviousGeneration>;
}
export interface CompletedGeneration {
  id: string;
  sourceHash: string;
  output: GeneratedText;
  reviewStatus: "pending";
  provenance: { provider: string; model: string; generatedAt: string };
}

const DEFAULT_LIMITS = { maxJobs: 20, maxInputCharacters: 20_000, maxOutputCharacters: 4_000 };

export async function runGeneration(jobs: readonly GenerationJob[], options: GenerationOptions) {
  const limits = { ...DEFAULT_LIMITS, ...options.limits };
  for(const value of Object.values(limits)) z.number().int().positive().parse(value);
  z.number().finite().nonnegative().parse(options.budget);
  const completed: CompletedGeneration[] = [];
  const queued: Array<GenerationJob & { reason: string }> = [];
  const unchanged: string[] = [];
  const estimate = { jobs: jobs.length, inputCharacters: jobs.reduce((sum, item) => sum + item.input.length, 0) };
  let remainingBudget = Math.max(0, options.budget);

  for (const [index, job] of jobs.entries()) {
    const previous = options.previous?.[job.id];
    if (previous?.sourceHash === job.sourceHash) {
      unchanged.push(job.id);
      continue;
    }
    let reason: string | null = null;
    let maximumCost=NaN;
    try{maximumCost=options.provider?.estimateMaxCostUsd({text:job.input,maxOutputCharacters:limits.maxOutputCharacters})??NaN;}catch{/* An unavailable price must never permit a paid request. */}
    if (!options.provider) reason = "provider_not_configured";
    else if (!options.apiKey) reason = "api_key_missing";
    else if (options.dryRun) reason = "dry_run";
    else if (index >= limits.maxJobs) reason = "batch_limit";
    else if (job.input.length > limits.maxInputCharacters) reason = "input_limit";
    else if (!Number.isFinite(maximumCost)||maximumCost<=0) reason = "pricing_not_configured";
    else if (remainingBudget < maximumCost) reason = "budget_exhausted";
    if (reason) {
      queued.push({ ...job, reason });
      continue;
    }
    try {
      remainingBudget -= maximumCost;
      const raw = await options.provider!.generate({
        text: job.input,
        sourceRefs: job.sourceRefs,
        apiKey: options.apiKey!,
        maxOutputCharacters: limits.maxOutputCharacters,
      });
      const serialized = JSON.stringify(raw);
      if (serialized.length > limits.maxOutputCharacters) throw new Error("Output exceeds configured limit");
      const output = GeneratedTextSchema.parse(raw);
      if (output.source_refs.some((reference) => !job.sourceRefs.includes(reference))) {
        throw new Error("Generated source_refs must come from the job sources");
      }
      completed.push({
        id: job.id,
        sourceHash: job.sourceHash,
        output,
        reviewStatus: "pending",
        provenance: { provider: options.provider!.name, model: options.provider!.model, generatedAt: new Date().toISOString() },
      });
    } catch {
      queued.push({ ...job, reason: "generation_error" });
    }
  }
  return { completed, queued, unchanged, estimate, remainingBudget };
}
