# M1-03 seed repository verification

- Checked at: `2026-09-20T03:52:48.864Z` (UTC; `2026-09-20T11:52:48.864+08:00` Asia/Shanghai)
- Scope: public GitHub repository metadata, README, and LICENSE for the three PRD seed candidates.
- Method: read-only GitHub REST API and `raw.githubusercontent.com`; no upstream code, install command, demo, benchmark, or test was run.
- Interpretation: README statements below are author-published claims, not runtime verification. Stars and repository timestamps are a point-in-time observation.

## `tamaratran/fast-jev-compaction`

### Structured facts

```yaml
repository_id: "1374005005"
repo_url: https://github.com/tamaratran/fast-jev-compaction
default_branch: main
fixed_commit: e3f262a7f4d42bd8dd32ced30d26176f7cb545b0
stars: 4357
created_at: 2026-09-17T05:57:20Z
repo_updated_at: 2026-09-20T03:49:23Z
pushed_at: 2026-09-18T04:45:31Z
archived: false
license_spdx: MIT
license_path: LICENSE
license_blob_sha: b77bf2ab726c6e7cb5a81a9d3b7dc38266ebfd3d
ecosystem: jev_integration
source_status: open_source
verification: source_checked
```

Fixed sources:

- [Repository API metadata](https://api.github.com/repos/tamaratran/fast-jev-compaction)
- [Fixed commit](https://github.com/tamaratran/fast-jev-compaction/commit/e3f262a7f4d42bd8dd32ced30d26176f7cb545b0)
- [README at fixed commit](https://github.com/tamaratran/fast-jev-compaction/blob/e3f262a7f4d42bd8dd32ced30d26176f7cb545b0/README.md)
- [LICENSE at fixed commit](https://github.com/tamaratran/fast-jev-compaction/blob/e3f262a7f4d42bd8dd32ced30d26176f7cb545b0/LICENSE)
- [License API](https://api.github.com/repos/tamaratran/fast-jev-compaction/license)

LICENSE original identification: `MIT License`; `Copyright (c) 2025`. GitHub identifies SPDX `MIT`.

README-supported description: an npm library and Claude Code function-hook plugin that sends the conversation state and paired questions to Jev, uses Jev probabilities to keep, truncate, or remove tool calls/results, and otherwise preserves retained content verbatim. The Claude Code hook replaces built-in compaction when reduction is sufficient and falls back to built-in summary on errors or insufficient reduction.

Jev role: direct Jev integration. Jev scores whether each eligible tool call and result should remain; `jev-latest` is the documented default model and `https://api.typesafe.ai/v1/systemone` the documented default endpoint.

Use conditions supported by README:

- npm library: install `fast-jev-compaction`; live Jev access uses a TypeSafe API key, defaulting to `TYPESAFE_API_KEY`.
- Claude Code plugin: function hooks are described as early access and require Claude Code `2.1.274+` plus `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1`; restart or reload plugins after installation.
- A custom `JevAsker` transport can be supplied instead of the default client.
- The repository says Jev failures, malformed responses, a missing key, or an unfittable history throw; the caller/hook owns fallback behavior.
- No specific OS or hardware requirement is stated for the core npm library. The animated demo is separately labeled macOS-only.

Unknown / do not infer: TypeSafe account eligibility, current API price, API SLA, compatible Node.js versions, and whether the plugin works in the user's environment were not established by the fixed README. No performance or reduction claim was independently tested.

## `supercorp-ai/supercov`

### Structured facts

```yaml
repository_id: "1343957927"
repo_url: https://github.com/supercorp-ai/supercov
website_url: https://supercov.com
default_branch: main
fixed_commit: 0f1a6a3364137a94606563fc173a0dbf1cef855e
stars: 61
created_at: 2026-08-23T16:12:35Z
repo_updated_at: 2026-09-20T03:19:42Z
pushed_at: 2026-09-19T19:38:14Z
archived: false
license_spdx: MIT
license_path: LICENSE
license_blob_sha: 90ca923c76c74a470ddf1b914149c19ed5b0e7b7
ecosystem: jev_integration
source_status: open_source
verification: source_checked
```

Fixed sources:

- [Repository API metadata](https://api.github.com/repos/supercorp-ai/supercov)
- [Fixed commit](https://github.com/supercorp-ai/supercov/commit/0f1a6a3364137a94606563fc173a0dbf1cef855e)
- [README at fixed commit](https://github.com/supercorp-ai/supercov/blob/0f1a6a3364137a94606563fc173a0dbf1cef855e/README.md)
- [LICENSE at fixed commit](https://github.com/supercorp-ai/supercov/blob/0f1a6a3364137a94606563fc173a0dbf1cef855e/LICENSE)
- [License API](https://api.github.com/repos/supercorp-ai/supercov/license)

LICENSE original identification: `MIT License`; `Copyright (c) 2026 Supercov contributors`. GitHub identifies SPDX `MIT`.

README-supported description: a local CLI that gives coding agents code-quality scores and test-coverage evidence, exposes gaps as bounded queries, records runs, and compares results. It says coverage runs use the project's existing test command and write under `.supercov/`.

Jev role: optional/direct integration for the `quality` workflow. The README says Supercov asks Jev yes/no questions about source files and computes the score locally. Coverage measurement is presented as separate and does not require an account.

Use conditions supported by README:

- Quality scoring requires a TypeSafe AI API key (`TYPESAFE_API_KEY`) and incurs Jev reading cost; the quoted cost is an author claim and was not independently verified.
- Coverage needs no Supercov account, configuration file, custom reporter, or hosted service; package tools may still contact registries for installation.
- Supported source languages are JavaScript, TypeScript, Rust, Python, Ruby, Go, Java, and Kotlin; Zig, PHP, and C are marked coming soon.
- Platform floor stated in README: Windows 10+, macOS 11+, or Linux glibc 2.28+/musl; architectures arm64/x64. Toolchain floors vary: Node.js 22+ for `npx`, CPython 3.12+, Ruby 3.3+ (3.4+ for full measurement), Go 1.22+, JDK 17+, and Rust 1.95 for source installation/support described there.
- Install path depends on ecosystem (`npx`, PyPI wheel, RubyGem, `cargo binstall`/`cargo install`, Go module, Homebrew, or release binary).

Unknown / do not infer: current registry package integrity, actual cross-platform behavior, score quality, coverage accuracy, privacy behavior, pricing, and performance were not independently tested. README examples and claimed support remain source-checked author statements.

## `vinnylarouge/jevlike`

### Structured facts

```yaml
repository_id: "1372867305"
repo_url: https://github.com/vinnylarouge/jevlike
website_url: null
default_branch: main
fixed_commit: 94f5fd1b0b11d52bbdfdf4e0ee6aa96b568f8452
stars: 1002
created_at: 2026-09-16T10:26:01Z
repo_updated_at: 2026-09-20T03:01:44Z
pushed_at: 2026-09-16T18:12:53Z
archived: false
license_spdx: MIT
license_path: LICENSE
license_blob_sha: 66f4d5a20da46b7b94181d992cc57c2c936ae757
ecosystem: jev_like
source_status: open_source
verification: source_checked
```

Fixed sources:

- [Repository API metadata](https://api.github.com/repos/vinnylarouge/jevlike)
- [Fixed commit](https://github.com/vinnylarouge/jevlike/commit/94f5fd1b0b11d52bbdfdf4e0ee6aa96b568f8452)
- [README at fixed commit](https://github.com/vinnylarouge/jevlike/blob/94f5fd1b0b11d52bbdfdf4e0ee6aa96b568f8452/README.md)
- [LICENSE at fixed commit](https://github.com/vinnylarouge/jevlike/blob/94f5fd1b0b11d52bbdfdf4e0ee6aa96b568f8452/LICENSE)
- [License API](https://api.github.com/repos/vinnylarouge/jevlike/license)

LICENSE original identification: `MIT License`; `Copyright (c) 2026 Minimal Labs`. GitHub identifies SPDX `MIT`. README adds that downloaded datasets and pretrained models retain their own terms; MIT therefore must not be generalized to those external assets.

README-supported description: a research starter for training a small model that takes text plus a changing list of text options and returns one probability per option in a single pass. It includes a byte-encoder path, an optional frozen Hugging Face encoder path, JSONL training/evaluation/prediction tooling, and game examples/checkpoints.

Jev role: explicitly Jev-like, not a Jev integration. The README calls Jev TypeSafe's commercial model for this task shape, says TypeSafe has not published Jev's design, and describes this repository as an independent starter with the same input/output shape. It expressly says it is not a copy of Jev and does not claim equal quality or reproduction of TypeSafe's private training method.

Use conditions supported by README:

- Core quickstart uses `uv`, a local virtual environment, editable installation with development extras, local JSONL data, and the supplied CLI commands.
- Default encoder trains byte embeddings from scratch; the optional transformers extra names a compatible Hugging Face encoder and may download large model weights. A saved checkpoint references the encoder name and requires later access to that same model.
- Training supports CPU, Apple MPS, and NVIDIA CUDA through the device option; exact minimum hardware, Python version, memory, and storage requirements are not stated in the README.
- User datasets must contain context/options/zero-based label JSONL; each row needs at least two options. Related records should remain in one split to reduce leakage.
- External datasets and pretrained models keep their own terms.

Unknown / do not infer: GitHub repository description is `null`; use the fixed README, not a fabricated API description. Exact Python/uv/dependency versions, minimum RAM/VRAM, model fitness, performance, and reported experiment results were not independently verified. The demo videos and checkpoints were not run.

## Access failures and caveats

- No requested GitHub metadata, README, fixed commit, or LICENSE access failed during this check.
- GitHub's unauthenticated API is rate-limited; all requested endpoints returned successfully in this pass.
- The three fixed commit links make descriptive and license evidence reproducible. Point-in-time fields (`stars`, `updated_at`, `pushed_at`, `archived`) intentionally cite the live repository API and may change after the check time.
- GitHub license detection and the checked LICENSE texts agree on SPDX `MIT` for all three repositories. This verifies repository licensing metadata/text only; it is not a legal opinion and does not extend a repository license to separately governed datasets, pretrained models, websites, media, or dependencies.
