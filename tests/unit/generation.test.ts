import { describe, expect, it } from "vitest";
import { runGeneration, type GenerationJob, type SummaryProvider } from "../../src/lib/ingest/generation";

const job: GenerationJob = {
  id: "one",
  sourceHash: "sha256:one",
  input: "Public README facts",
  sourceRefs: ["https://example.com/readme"],
};

const provider = (generate: SummaryProvider["generate"]): SummaryProvider => ({ name: "fixture", model: "fixture-v1", estimateMaxCostUsd:()=>0.25, generate });

describe("runGeneration", () => {
  it('reserves dollar costs instead of treating dollars as a request count',async()=>{
    let calls=0;
    const result=await runGeneration([job,{...job,id:'two'}],{provider:provider(async()=>{calls++;return validOutput();}),apiKey:'key',budget:0.3});
    expect(calls).toBe(1);expect(result.queued[0]?.reason).toBe('budget_exhausted');
    expect(result.remainingBudget).toBeCloseTo(0.05);
  });
  it('does not call a provider with unknown prices or expose provider exception secrets',async()=>{
    const current=provider(async()=>{throw new Error('Authorization: secret-key-123');});
    const result=await runGeneration([job],{provider:current,apiKey:'key',budget:1});
    expect(JSON.stringify(result)).not.toContain('secret-key-123');
    const missing=await runGeneration([job],{provider:{...current,estimateMaxCostUsd:()=>NaN},apiKey:'key',budget:1});
    expect(missing.queued[0]?.reason).toBe('pricing_not_configured');
  });
  it.each([
    ["missing provider", { provider: null, apiKey: "key", budget: 1 }],
    ["missing key", { provider: provider(async () => validOutput()), apiKey: null, budget: 1 }],
    ["zero budget", { provider: provider(async () => validOutput()), apiKey: "key", budget: 0 }],
  ])("keeps jobs queued for %s", async (_name, options) => {
    const result = await runGeneration([job], options);
    expect(result.completed).toEqual([]);
    expect(result.queued).toEqual([expect.objectContaining({ id: "one" })]);
  });

  it("dry-run estimates bounded work without calling the provider", async () => {
    let calls = 0;
    const result = await runGeneration([job], {
      provider: provider(async () => { calls += 1; return validOutput(); }), apiKey: "key", budget: 2, dryRun: true,
    });
    expect(calls).toBe(0);
    expect(result.queued).toHaveLength(1);
    expect(result.estimate).toMatchObject({ jobs: 1, inputCharacters: job.input.length });
  });

  it("enforces batch, input, and output limits", async () => {
    const result = await runGeneration([job, { ...job, id: "two" }], {
      provider: provider(async () => validOutput()), apiKey: "key", budget: 2,
      limits: { maxJobs: 1, maxInputCharacters: 10, maxOutputCharacters: 1000 },
    });
    expect(result.completed).toEqual([]);
    expect(result.queued.map(({ id }) => id)).toEqual(["one", "two"]);
  });

  it("retains failed, malformed, or unsupported-source results for review", async () => {
    const badProviders = [
      provider(async () => { throw new Error("provider unavailable"); }),
      provider(async () => ({ summary: "", problem: "x", requirements_text: "x", source_refs: [] })),
      provider(async () => ({ ...validOutput(), source_refs: ["https://attacker.example/fake"] })),
    ];
    for (const current of badProviders) {
      const result = await runGeneration([job], { provider: current, apiKey: "key", budget: 1 });
      expect(result.completed).toEqual([]);
      expect(result.queued).toHaveLength(1);
    }
  });

  it("accepts schema-valid sourced output as pending review and avoids unchanged translations", async () => {
    let calls = 0;
    const result = await runGeneration([job], {
      provider: provider(async () => { calls += 1; return validOutput(); }), apiKey: "key", budget: 1,
      previous: { one: { sourceHash: "sha256:one", output: validOutput() } },
    });
    expect(calls).toBe(0);
    expect(result.unchanged).toEqual(["one"]);

    const changed = await runGeneration([{ ...job, sourceHash: "sha256:changed" }], {
      provider: provider(async () => validOutput()), apiKey: "key", budget: 1,
    });
    expect(changed.completed[0]).toMatchObject({ id: "one", reviewStatus: "pending" });
  });
});

function validOutput() {
  return {
    summary: "A factual summary.",
    problem: "A supported problem statement.",
    requirements_text: "Unknown requirements remain unknown.",
    source_refs: ["https://example.com/readme"],
  };
}
