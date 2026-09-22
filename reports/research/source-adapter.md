# M3-01 source adapter research

Checked `2026-09-20` using public GitHub API/raw endpoints. No upstream code was executed.

## Fixed source

- Repository: [`everyai-com/jev-directory`](https://github.com/everyai-com/jev-directory)
- Fixed commit: [`26389c8627279a5942965e866a7f9133feba6033`](https://github.com/everyai-com/jev-directory/commit/26389c8627279a5942965e866a7f9133feba6033), committed `2026-09-19T22:49:42Z`
- Input: [`data/use-case-candidates.json` at the fixed commit](https://github.com/everyai-com/jev-directory/blob/26389c8627279a5942965e866a7f9133feba6033/data/use-case-candidates.json)
- License: GitHub License API reported SPDX `MIT`; fixed text is [`LICENSE` at the same commit](https://github.com/everyai-com/jev-directory/blob/26389c8627279a5942965e866a7f9133feba6033/LICENSE), blob `2b323eb6c1f155052f7f03eb14210eae6d83cb21`.

The observed upstream document is a JSON array. Each inspected entry uses `id`, `status`, `title`, `category`, `description`, `prompt`, `handle`, `sourceUrl`, `note`, `submittedAt`, and `reviewedAt`. The adapter requires only `id`, `title`, `category`, `description`, and `sourceUrl`, then emits the whitelist `upstreamId`, `title`, `category`, `description`, `projectUrl`, and a fixed source reference. It deliberately excludes `prompt`, submitter handle, note, and review workflow fields. Upstream descriptions remain untrusted author/source claims and are candidates for review, not published facts.

## Failure and retention behavior

- Non-array data, empty arrays, missing required fields, invalid candidate objects, and non-HTTP(S) `sourceUrl` values fail adaptation.
- Fetch, parse, or schema failures retain the last successful candidate snapshot and write a review report with the error.
- A candidate count below 80% of the last successful count is rejected as an anomalous drop. Exactly 80% is accepted, matching the PRD's “greater than 20%” threshold.
- The CLI writes only `var/ingest/candidates.json` and `var/ingest/review.json`; it does not write `content/projects`, summarize with AI, or publish records.
- The source is pinned to a commit so schema and content changes require an explicit adapter update. Updating the pin should repeat this structure and license check.

## Network boundary

The fetcher accepts only HTTP(S), rejects URL credentials, resolves DNS before a request, and validates every resolved address against loopback, private, link-local, metadata-adjacent, documentation, multicast, reserved, and IPv4-mapped IPv6 ranges. The built-in Node request path also installs a validating `lookup` function at connection time, so a DNS answer that changes after preflight is checked again before socket connection. Every redirect repeats URL and DNS validation; redirects are capped at five, and authorization/cookie/API-key headers are removed when the origin changes.

Defaults are a 15-second timeout, 2 MiB response ceiling (the pinned source CLI explicitly permits 4 MiB), two retries after the initial attempt for HTTP 429/5xx, a 30-second maximum `Retry-After`, and concurrency three through the shared bounded mapper. Successful bodies require an allowlisted MIME type and valid UTF-8 decoding.

## Verification scope

Unit coverage exercises blocked IPv4/IPv6 targets (including `169.254.169.254` and IPv4-mapped loopback), public addresses, cross-origin credential removal, bounded 429 retry, MIME/size rejection, concurrency three, real-shape field whitelisting, schema/empty rejection, and snapshot retention. Runtime project claims from the upstream candidate file were not tested.

The fixed JSON and GitHub metadata were successfully read during research with the environment's public HTTP tooling. A later end-to-end `npx tsx scripts/ingest.ts` attempt through Node's direct HTTPS client timed out at the configured 15-second boundary in this environment; the CLI correctly produced a failure review and retained the previous (empty) snapshot. Therefore the live Node fetch path is not recorded as a successful source refresh in this check.
