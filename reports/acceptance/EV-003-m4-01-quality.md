# EV-003 · M4-01 质量、容量与凭证检查

- 执行者：ZCode 代理（GLM-5.3）
- 日期：2026-09-22（UTC+8 上午）
- 环境：Windows 11、Node v24.14.1、npm 11.11.0；分支 codex/m1-foundation 无提交（以工作区差异为准）；本轮输入：用户确认域名 `jevtypesafe.dev` 与联系邮箱 `support@jevtypesafe.dev`。
- 覆盖任务：M4-01（AC-16）；附带完成 CONTACT_EMAIL 配置（B-03 解除，M4-03 邮箱部分）。

## 本轮变更

1. `content/site.json`：`contact_email` null → `support@jevtypesafe.dev`（用户 2026-09-22 确认）。构建产物中提交/赞助页「打开邮件应用」按钮启用，状态文案为「本站尚未收到提交，请在邮件应用中发送」，不出现「已发送」类假成功；「联系邮箱尚未配置」占位消失。`.env.example` 保持占位符不填真实值。
2. `scripts/scan-public.ts`、`scripts/verify-capacity.ts`：证据 `executor` 字段由硬编码 'Codex' 改为 `EVIDENCE_EXECUTOR` 环境变量（默认 local），如实反映执行者。
3. 域名统一为 `https://jevtypesafe.dev`（变更 CH-01，2026-09-22 已实施并复验）。

## 命令与结果（全部实际执行）

| 命令 | 结果 |
| --- | --- |
| `npm run validate:data` | 通过：10 published projects、6 categories |
| `npm run check` | 0 errors / 0 warnings |
| `npm run test` | 81/81（10 文件） |
| `npm run build` | 47 页；submit 页 `data-email="support@jevtypesafe.dev"` |
| `npx playwright test` | 30/30（desktop+mobile，邮箱启用后无回归） |
| `EVIDENCE_EXECUTOR=ZCode npm run verify:capacity` | 通过（内置断言全过）：1500 合成项目隔离沙箱生产模式构建 36.4s |
| `npm run verify:lighthouse` | 通过（内置断言 ≥90）：移动端 Performance 99 / Accessibility 100 / SEO 100 |
| `EVIDENCE_EXECUTOR=ZCode npm run scan:public` | findings: []（源文件 121 + dist 55） |

## PRD 第 17.1 性能目标对照

| 目标 | 结果 | 证据 |
| --- | --- | --- |
| 自有首屏 JS gzip ≤80KB | 5,787 B（约 7%） | capacity.json |
| 每语言搜索索引 gzip ≤250KB | en 18,208 B / zh 18,278 B（约 7%） | capacity.json |
| 1,500 条双语容量样本 | 1500 合成项目构建 36.4s，63 页/目录，fixtures 与生产内容隔离（临时沙箱，不进 content/ 或 dist/） | capacity.json、capacity-build.log |
| 搜索反馈 200ms | 搜索纯函数 P95 9.3ms（100 次 q+sort 全库）；输入防抖 150ms，合计约 160ms < 200ms。Node 计时，不含浏览器渲染/低端设备差异 | capacity.json（limitation 如实注明） |
| 移动端 Lighthouse P/A/SEO ≥90 | 99 / 100 / 100（1500 条容量样本、localhost 实验室口径，不代表线上用户指标；本次 Performance 99、上次 100，实验室分数波动如实记录） | lighthouse-capacity-mobile.json、lighthouse.log |
| 首页与前 12 项无 JS 可读 | e2e 禁 JS 实测通过（EV-002） | — |
| 内容抓取失败/AI 不可用不影响浏览 | M3-05 证据（EV-002） | — |

## 凭证隔离（AC-16）

- `scan:public`：GitHub/模型 API Key、私钥模式、非公开字段（source_hash、SUMMARY_API_KEY、synthetic fixture 等）在 dist 55 文件与 Git 工作区 121 文件中 0 命中。
- `history: no_commits`——仓库尚无提交，Git 历史检查暂不适用；**首次提交与 G0-07 发布门槛时需复扫**。
- 公开联系邮箱 `support@jevtypesafe.dev` 属 PRD 9.1 公开配置白名单，非凭证。

## 未验证 / 限制

- Lighthouse 为 localhost 实验室测量（benchmarkIndex 877.5），不替代线上指标。
- Git 历史扫描待首次提交后执行。
- M4-02（Cloudflare 静态配置与预览）、M4-03（生产索引/分析 token）未开始；PUBLIC_WEB_ANALYTICS_TOKEN 仍空（B-06）。
