# EV-002 · M2 浏览器验收闭环与 M3 内容流水线首批导入

- 执行者：ZCode 代理（GLM-5.3）；Codex 产出部分（e2e 套件、容量/Lighthouse/扫描、README、content-update 工作流、M3 流水线与脚本）经本轮复验后一并计入。
- 日期：2026-09-20（UTC+8 晚）
- 环境：Windows 11、Node v24.14.1、npm 11.11.0；分支 codex/m1-foundation 无提交（以工作区差异为准）。
- 覆盖任务：M2-07（收尾）、M1-04/M1-05、M2-01～M2-06（验收闭环）、M3-01～M3-05、M3-07；M3-06 实现完成待真实 Actions 运行。

## 本轮变更（ZCode）

1. **修复 `publicFetchText` 整体超时缺陷**（src/lib/ingest/public-fetch.ts）：DNS 解析与请求阶段原先不受 `timeoutMs` 约束（仅 socket 空闲超时，注入式请求完全无约束）。新增 `withDeadline` 使两阶段各受硬上限；`fetch.test.ts` 恢复通过。属 M3-01 交付边界（PRD 8.4 单次访问超时）。
2. **M3-07 首批候选导入与审核**：审阅 var/ingest 审核队列 9 个仓库（固定 commit 的 README/LICENSE/元数据），发布 7 条（noflow-runtime、jev-code、jev-codex-plugin、your-signal、is-malicious、typesafe-mcp、feelings；jev-code 无 LICENSE 标 source_available 不标开源），待核 2 条（awesome-jev-typesafe 聚合清单非构建项目；Werkfaden README 未见 Jev 关联证据）。发布文件沿用流水线 stableId 与 source_hash，摘要为对照固定 commit README 的人工事实概括（provider `zcode`/model `manual`），中文同步人工撰写标 reviewed。审核记录见 `reports/research/m3-07-review-2026-09-20.md`。
3. **e2e 数量断言改为数据驱动**（tests/e2e/directory.spec.ts、accessibility.spec.ts）：原硬编码项目数 3 在内容扩充后破裂；改为从 `content/projects` 读取真实发布数据推导期望（总数/like/integration/developer×integration），测试随内容自适应。

## Codex 产出（本轮复验）

- e2e 新增：axe WCAG AA（9 代表页）、44px 触控、全页面视口适配+单 H1、无 JS 目录/分类/详情/语言切换、搜索筛选+返回恢复+语言切换保持状态、索引失败重试与坏行降级、复制成功/降级、键盘 skip+reduced-motion、manifest 元数据与 JSON-LD 核对（seo.spec）。
- `src/lib/seo.ts` JSON-LD（CollectionPage/ItemList/BreadcrumbList，PRD 10.2）。
- 容量验证：1500 合成项目独立沙箱构建 23.3s；每语言搜索索引 gzip ≈18KB（目标 ≤250KB）；自有 JS gzip 5.8KB（目标 ≤80KB）；搜索纯函数 P95 4ms；生产索引与缺译剔除验证通过（reports/acceptance/capacity.json）。
- Lighthouse（容量样本、移动仿真）：Performance 100 / Accessibility 100 / SEO 100（目标 ≥90；reports/acceptance/lighthouse-capacity-mobile.json）。
- 公开产物扫描（scan:public）：dist 55 文件 + 源码 120 文件，findings 为空（AC-16 本地口径）。
- M3 流水线：source-adapter/public-fetch/repository/pipeline/generation + ingest/enrich/translate/content-diff 脚本 + `.github/workflows/content-update.yml`（每日 03:17 UTC + 手动；有界批量；工作流内自跑 validate/check/test/build/scan；产物 artifact + 更新分支 + PR）。translate 供应商 fail-closed（无占位付费调用）。
- README.md（Windows/CI 运行说明、配置、内容操作）。

## 命令与结果（全部实际执行）

| 命令 | 结果 |
| --- | --- |
| `npm run validate:data` | 通过：10 published projects（3→10）、6 categories |
| `npm run check` | 0 errors / 0 warnings |
| `npm run test` | 81/81（10 文件；含 fetch 22、cli-pipeline 4、generation、seo） |
| `npm run build` | 47 页（en/zh、目录、分类、10 详情、404） |
| `npx playwright test` | 30/30（desktop+mobile；数量断言数据驱动后复验） |
| `npm run content:diff` | 9 proposed changes（发布前状态）→ 审核后入 content/ |
| `npm run translate -- --dry-run` | 0 generated、9 queued（供应商未配置，fail-closed 正确） |
| `npm run scan:public` | findings: [] |

## 关键抽查

- sitemap：en/zh 详情页各 10 + 目录/分类/信息页；搜索页不在 sitemap；lastmod 来自 checked_at。
- 无 LICENSE 的 jev-code 显示 Source available·license pending，未标开源；Jev-like 种子未标官方。
- 搜索恢复/语言切换保持查询参数（e2e 断言 category=developer 跨语言保留）。

## 未验证 / 限制

- M3-06 工作流未在真实 GitHub Actions 运行（B-01 待接入）；逻辑与权限已具备。
- AC-01 视觉验收：代理检查（axe/截图/视觉模型）全部通过，按规范保留用户确认。
- AC-11 生产索引、AC-13/AC-14 部署与域名、AC-22 线上资源路径未验证（M4 范围）。
- 摘要/翻译真实 AI 供应商未配置（B-04）；本轮 7 条为人工撰写，流程与缓存规则有单测。
- 1149 条非仓库上游来源待人工分流（记录于审核报告）。
