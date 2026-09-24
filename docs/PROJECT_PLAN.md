# PROJECT_PLAN.md

> Jev Atlas 开发进度与验收台账。基线：`jev-directory-prd-v1.0.md`（2026-09-20）。本文件是开发状态的唯一台账；产品细则以 PRD 为准，执行规则见 `AGENT.md`（仓库使用时建议命名为 `AGENTS.md`）。

## 1. 当前状态与使用规则

- 建档日期：2026-09-20。最近更新：2026-09-24（Cloudflare Workers Builds、正式域名、HTTPS 与 www 301 已上线并完成 P0 发布验收，见 EV-012；视觉与 SEO 门禁见 EV-011/010）。
- 当前阶段：M1～M4 的 P0 公开发布全部验收；正式沿用 Astro + TypeScript + Tailwind CSS + JSON。下一阶段为独立跟踪的 M5 P0.1 收费前商业能力，需用户决定价格/收款并提供生产 D1/密钥后才可启用。
- 已有交付：可复现工程、内容 Schema、10 条真实发布项目、en/zh 共 47 页、搜索/联系交互、采集/审核/生成流水线、完整响应式 UI、GitHub Actions 与 Cloudflare Workers Builds；`https://jevtypesafe.dev/` 正式 HTTPS 可访问，`www` 301 保留路径/查询参数，发布版本标记为 `v0.1.0`。
- 先完成 M1–M4 的 P0；M5 单独跟踪，首次收费前必须完成。P1 不在本期分母内。
- 每个任务只用：待开始、进行中、待验收、已验收、受阻。原则上同时只有一个主任务进行中。
- 有实现但验证未跑，状态为待验收；遇到外部阻塞只阻塞关联任务，继续无依赖工作。
- 已验收必须引用证据记录，写明验证者；代理可验收客观技术条件，不得冒充用户完成视觉或业务确认。
- 需求变更保留原 ID 与变更记录，不通过删任务、降低门槛或修改分母美化进度。新增任务顺延 ID。

## 2. 进度仪表盘

| 指标 | 当前值 | 计算口径 |
| --- | --- | --- |
| P0 任务验收率 | 25/25（100%） | M1～M4 全部验收（EV-001～EV-012） |
| P0.1 任务验收率 | 0/8（0%） | 单独计算，不混入目录上线进度 |
| P0 验收通过率 | 17/17（100%） | AC-01～AC-16 与 AC-22/P0 全部通过（EV-002/003/006/008/009/010/011/012） |
| P0.1 验收通过率 | 0/6（0%） | AC-17～AC-21 加 AC-22 的 P0.1 记录 |
| P0 上线准备 | 8/8 门槛通过；已上线 | 正式 Worker、main 构建、HTTPS、www 301、SEO、凭证扫描、恢复和发布记录均有证据 |
| 商业上线准备 | 0/5 门槛通过；未就绪 | 第 7 节 G1-01～G1-05 |
| 阻塞性缺陷 | 无 | P0 外部接入已解除；M5 输入不影响当前公开目录 |

任务验收率等权，不能代表剩余工期。每次交接同时更新任务、AC 和门槛；不得单独手填一个综合“完成百分比”。AC-22 两阶段分别留证。

以上计数以 EV-006 的终态复验为准。SP-01 是额外技术调查，不加入 P0/P0.1 任务分母；其结论为保留 Astro，不能据此提前通过线上 M4/M5。

## 3. 任务与依赖

所有交付物及路径均为计划要求，不表示已经存在。依赖是验收前置条件；可先做独立实现，但不能提前通过依赖未满足的验收。

### M1 · P0 · 数据与骨架

| ID | 工作 | 前置 | 可验收交付 | 覆盖 | 状态 | 证据 |
| --- | --- | --- | --- | --- | --- | --- |
| M1-01 | 工程初始化 | — | 固定 Node/npm 与依赖版本；Astro、TypeScript、Tailwind、lockfile、基础脚本和静态构建可复现 | 工程基础 | 已验收 | EV-001：validate/check/test/build/e2e 全绿 |
| M1-02 | 内容 Schema 与发布边界 | M1-01 | Zod 校验字段、状态、URL 和公共字段白名单；分类词表及独立 fixtures 目录 | AC-05、AC-06、AC-16 | 已验收 | EV-001：67 单测含 schema/内容边界；fixtures 在 tests/fixtures |
| M1-03 | 首批真实种子 | M1-02 | 核查种子仓库、许可及出处；实际条目可构建；不足数量如实记录 | AC-06、AC-15 | 已验收 | EV-001 + reports/research/seed-verification.md：3 条真实种子（目标 20–50 未达，如实记录） |
| M1-04 | 双语路由与共享布局 | M1-01、M1-02 | 英文默认、/zh/；稳定 slug；导航、页脚、语言字典、真实 404 骨架 | AC-03、AC-10、AC-11 | 已验收 | EV-002：无 JS 浏览器实测（目录/分类/详情/语言切换）、404 e2e、hreflang/canonical 抽查 |
| M1-05 | 设计令牌与基础组件 | M1-04 | 近黑、粉灰绿、细边框；列表、徽标、按钮、输入、焦点和空状态 | AC-01、AC-02 | 已验收 | EV-001/002/006/008：截图、响应式、axe、44px 触控及用户 2026-09-23 最终视觉确认 |

### M2 · P0 · 目录体验

| ID | 工作 | 前置 | 可验收交付 | 覆盖 | 状态 | 证据 |
| --- | --- | --- | --- | --- | --- | --- |
| M2-01 | 首页与真实计数 | M1-03、M1-05 | 首页 12 项；真实去重数量；独立站声明；未售广告仅合作入口 | AC-01、AC-03、AC-15 | 已验收 | EV-002：真实计数（10 项目）、独立站声明、无 JS 可读（e2e）、合作入口（COMMERCIAL_MODE=off） |
| M2-02 | 目录、分类与静态分页 | M1-03、M1-04 | 每页 24 项；隐藏空分类；无 JS 可访问所有发布项目 | AC-03 | 已验收 | EV-002：无 JS 上下文浏览目录/分类/详情 e2e 通过 |
| M2-03 | 搜索筛选和排序 | M2-02 | 跨维度 AND、同维度 OR；未知值正确；URL 状态和返回恢复；全库搜索索引 | AC-04 | 已验收 | EV-002：e2e 覆盖筛选组合、语言切换保持状态、返回/前进恢复、索引失败重试与坏行降级 |
| M2-04 | 项目详情与语言切换 | M1-03、M1-04 | 源码/演示/条件/出处/检查时间；缺译不伪装中文；同项目切换 | AC-06、AC-10 | 已验收 | EV-002：详情全要素 e2e、同项目切换 /projects/supercov/ ↔ /zh/…；缺译逻辑单测+构建验证 |
| M2-05 | 提交、赞助、关于和隐私页 | M1-04 | 英中页面；mailto 与复制；询价；真实状态；无伪发送或支付成功 | AC-12 | 已验收 | EV-002：e2e 覆盖提交校验、纠错预填、复制成功/降级、无假成功；正式邮箱待 B-03 后复验 |
| M2-06 | SEO 与发布清单 | M2-02、M2-04、M2-05 | 统一 manifest 生成 canonical/hreflang/sitemap；搜索 noindex、真实 404、预览隔离 | AC-11 | 已验收 | EV-002：seo.spec 核对每路由 canonical/hreflang 与 JSON-LD（CollectionPage/ItemList/BreadcrumbList）一致；生产索引留 M4-03 |
| M2-07 | 响应式与可访问性检查 | M2-01、M2-02、M2-03、M2-04、M2-05 | 375px 与桌面截图；无整体溢出；键盘、标签、对比、触控和 reduced-motion 检查 | AC-01、AC-02 | 已验收 | EV-002/006/008：axe WCAG AA、44px 触控、全页视口、键盘/reduced-motion、双语截图；用户 2026-09-23 确认 UI 完成 |

### M3 · P0 · 内容流水线

| ID | 工作 | 前置 | 可验收交付 | 覆盖 | 状态 | 证据 |
| --- | --- | --- | --- | --- | --- | --- |
| M3-01 | 来源适配与受限抓取 | M1-02 | 固定来源快照；超时/重试/限流；公共 URL、重定向、响应大小检查；不执行上游代码 | AC-07 | 已验收 | EV-002：22 项 fetch 单测（公网/重定向/429 退避/MIME/大小/并发/整体超时）+ 真实采集 1328 候选；本轮修复 DNS/请求阶段超时约束 |
| M3-02 | 归一化、去重与许可审核 | M3-01 | repository ID 去重；保留源引用；源码可见/开源/Jev-like 明确分类 | AC-05、AC-06 | 已验收 | EV-002：cli-pipeline 单测 + 真实运行（141 仓库候选 → 9 快照去重进队列；fork/tombstone 排除） |
| M3-03 | 增量差异与人工覆盖 | M3-02 | hash、overrides、tombstones、diff 和审核队列；Stars 变化不重译 | AC-08 | 已验收 | EV-002：substantiveHash 排除 stars/fetched、overrides 优先与 tombstones 单测、content-diff 报告；首轮真实增量轮次待下次 enrich 复验 |
| M3-04 | 摘要与翻译适配器 | M3-03 | 供应商可配；Schema 校验、来源约束、dry-run、预算上限、缓存与缺 Key 降级 | AC-08、AC-09 | 已验收 | EV-002：generation 单测（缓存 unchanged、预算、dry-run、source_refs 约束、fail-closed）；真实供应商待 B-04 |
| M3-05 | 来源故障与快照保护 | M3-01、M3-03、M3-04 | 429/空数组/结构错误/异常下降均保留已发布快照；缺 AI 可构建 | AC-07、AC-09、AC-13 | 已验收 | EV-002：chooseSnapshot 单测（空/下降>20% 保留）+ translate dry-run 真实运行（0 generated、9 queued、站照常构建） |
| M3-06 | Actions 与跨平台操作 | M3-05 | 定时/手动生成更新分支及差异；自身运行验证；Windows Node 入口；日志无密钥 | AC-13、AC-16 | 已验收 | EV-009：main 与 tag 两次 Quality checks 全绿；手动 content review 真实运行全绿，完成有界采集、自验证、artifact、分支与 PR #1；首次运行暴露并修复仓库 PR 权限设置 |
| M3-07 | 合格候选导入与审核 | M3-02、M3-03、M3-04 | 核查来源许可及每条出处；发布合格数据；报告拒绝/待核原因及真实数量 | AC-06、AC-15 | 已验收 | EV-002：发布 7 条（3→10，固定 commit 出处与许可）、待核 2 条（原因记录）、1149/138/1 分流数量真实；reports/research/m3-07-review-2026-09-20.md |

### M4 · P0 · 公开发布

| ID | 工作 | 前置 | 可验收交付 | 覆盖 | 状态 | 证据 |
| --- | --- | --- | --- | --- | --- | --- |
| M4-01 | 质量、容量与凭证检查 | M2-06、M2-07、M3-07 | check/test/build；1500 条独立容量 fixture；JS/索引体积与性能记录；dist/Git 凭证检查 | AC-16 | 已验收 | EV-003/009：validate/check/test(82)/build(47 页)/e2e(40) 全绿；容量 1500 条（索引 gzip 18KB、JS 5.8KB、P95 9.3ms）；Lighthouse 移动 99/100/100；源码 234、dist 59、完整远端历史 10 提交扫描 findings 空 |
| M4-02 | Cloudflare 静态配置与预览 | M4-01 | Static Assets、真实 404；普通 HTML 静态分发；预览 noindex；不配置全站 SSR | AC-13、AC-22 | 已验收 | EV-006：Wrangler 本地 `/`/`/zh/` 200、缺页 404、缓存/安全头正确；dry-run 读取 104 assets、无 bindings；无 main/SSR/Worker bundle |
| M4-03 | 正式配置与基础分析 | M4-02 | 核实 SITE_URL、邮箱；有 token 才加载分析；生产索引配置正确 | AC-11、AC-12 | 已验收 | EV-006/010：生产首页 index、搜索 noindex、robots Allow、canonical/sitemap 为 jevtypesafe.dev；新增生产构建门禁逐页核对 44 个可索引 URL、hreflang、sitemap 和分享元数据；support@ 已配置；分析 token 门控构建验证，真实 token 暂不配置 |
| M4-04 | 域名与正式分支部署 | M4-03 | Vercel 核实域名/备份 DNS；Cloudflare NS、HTTPS、www 301 保留参数；main 部署验证 | AC-13、AC-14、AC-22 | 已验收 | EV-012：Workers Builds 连接 main；正式 Worker 版本上线；根域名 HTTPS 200、www 301 保留路径/查询、深层页 200、缺页 404；MX/TXT 保留 |
| M4-05 | 文档与恢复演练 | M3-06、M4-02 | README、.env.example、运营手册；恢复已知快照及代码版本并记录结果 | AC-07、AC-13 | 已验收 | EV-006/009：detached `95c6b1c` 独立恢复通过；文档齐全；M3-06 真实 Actions 全绿；已推送已知正常候选 tag `v0.1.0-rc.1` |
| M4-06 | P0 发布验收 | M4-04、M4-05 | 核对全部 P0 AC、质量目标及发布门槛；记录线上 URL、版本、遗留项和验收人 | AC-01～AC-16、AC-22 | 已验收 | EV-012：P0 25/25 任务、17/17 AC、8/8 G0 门槛闭环；正式 URL `https://jevtypesafe.dev/`，版本 `v0.1.0` |

### M5 · P0.1 · 收费前商业能力

| ID | 工作 | 前置 | 可验收交付 | 覆盖 | 状态 | 证据 |
| --- | --- | --- | --- | --- | --- | --- |
| M5-01 | 赞助 API 与数据库边界 | M4-06 | 仅 /api/sponsors/* 进入 Worker；D1 migrations；生产/预览库及密钥分离 | AC-20、AC-22 | 待开始 | — |
| M5-02 | 排期与运营命令 | M5-01 | 最多 3 slot、30 天 UTC 半开区间；重叠拒绝、未付款不激活、暂停/取消审计 | AC-17 | 待开始 | — |
| M5-03 | 活动获取与服务器到期 | M5-02 | serverNow、短签名、no-store；恢复标签页刷新；到期不靠重建；关闭时无付费卡片 | AC-18、AC-20 | 待开始 | — |
| M5-04 | 曝光点击事件与去重 | M5-03 | 可见面积至少 50% 且前台持续 1 秒；event_id 幂等；按 pageview/campaign 去重；批次限制 | AC-19 | 待开始 | — |
| M5-05 | 报表与计量说明 | M5-04 | CSV 对账；匹配曝光的 CTR；中英非独立人数；漏记/过滤/故障说明；保留与清理规则 | AC-21 | 待开始 | — |
| M5-06 | 故障、到期与恢复验证 | M5-05 | API/D1 失效不阻断出站；边界时钟/切回标签/重复上报/预览隔离；备份恢复演练 | AC-17～AC-22 | 待开始 | — |
| M5-07 | 销售条件与运营交付 | M5-05 | 落实真实价格、收款渠道、付款确认、排期、报告和补偿约定；私人资料不入公开数据 | 商业门槛 | 待开始 | — |
| M5-08 | 商业发布验收 | M5-06、M5-07 | 复核 P0 无回归；AC-17～AC-22 与销售条件通过后启用商业模式 | AC-17～AC-22 | 待开始 | — |

## 4. PRD 验收追踪

### 补充技术调查（独立于 P0/P0.1 分母）

| ID | 工作 | 状态 | 实际结论与证据 | 下一步 |
| --- | --- | --- | --- | --- |
| SP-01 | Grove 版本/许可/初始化、双语与扩展字段、目录搜索和 Cloudflare 静态部署兼容性验证 | 已验收 | EV-005：原生/适配版各 17 页静态构建；原生 4 组、适配 6 组检查完成。原生 8 字段丢失、业务 facet 拒绝、无 /zh/；适配版有限场景通过。Windows init 失败、dry-run 进程未正常退出如实记录 | 用户已决定不采用 Grove；保留报告与许可证证据，正式沿用 Astro + JSON，并以 Open App Scout 仅作布局参考 |

### 原 PRD 验收状态

通过标准以 PRD 第 18 节完整原文为准，下列短名便于追踪。AC 只有在相应场景实际验证且证据有效时才能通过。证据对应的代码或内容发生相关变化时，标为待复验。

| AC | 场景 | 主要任务 | 状态 | 证据 |
| --- | --- | --- | --- | --- |
| AC-01 | 首页风格 | M2-01、M2-07 | 通过 | EV-006/007/008/011：搜索优先 Hero、真实状态面板、编号分类与技术索引、导航、科技图标和 Jev Atlas 品牌完成；用户批准“精密基础设施 / 技术出版物”方向，响应式/e2e 通过 |
| AC-02 | 375px 手机使用 | M2-07 | 通过 | EV-006/011：375/768/1440 共 18 组视觉测量无溢出、单 H1、无小于 44px 的独立控件；axe WCAG AA 与 reduced-motion 复验通过 |
| AC-03 | 无 JS 静态浏览 | M2-01、M2-02 | 通过 | EV-006/011：禁 JS 上下文可从首页进入目录、分类与详情；重构后桌面/移动完整复验通过 |
| AC-04 | 搜索与状态恢复 | M2-03 | 通过 | EV-006/011：服务端目录与客户端搜索统一技术索引行；筛选、语言切换、返回/前进和失败重试完整复验通过 |
| AC-05 | 项目去重 | M3-02 | 通过 | EV-002：repository ID 合并单测 + 真实采集（141 仓库候选 → 9 去重快照；多来源合并保留引用） |
| AC-06 | 许可证及生态分类 | M3-02、M3-07 | 通过 | EV-002：Schema 强制白名单；jev-code 无 LICENSE 标 source_available；jev-like 种子未标官方 Jev |
| AC-07 | 源故障保留快照 | M3-05 | 通过 | EV-002：429/空数组/结构错误/下降>20% 单测均保留上一快照 |
| AC-08 | 增量与覆盖 | M3-03、M3-04 | 通过 | EV-002：stars-only 不触发重译（hash 排除）、overrides 优先、tombstones 阻止回归单测 |
| AC-09 | AI 缺失/预算降级 | M3-04、M3-05 | 通过 | EV-002：缺 Key/预算耗尽/dry-run 单测保留队列；真实 dry-run 0 generated、9 queued、全站照常构建 |
| AC-10 | 语言切换/缺译 | M2-04 | 通过 | EV-002 + EV-006：同项目切换和双语新布局回归通过；缺译不生成假中文详情 |
| AC-11 | SEO/真实 404 | M2-06、M4-03 | 通过 | EV-006/010/011：重构后生产构建仍为 47 页、44 页 index、3 页 noindex；robots、canonical、hreflang、sitemap、独立描述、Open Graph/Twitter Card 与真实 404 均通过 |
| AC-12 | 提交与联系 | M2-05、M4-03 | 通过 | EV-006：support@jevtypesafe.dev 构建配置存在；mailto/复制/无假成功完整 e2e 复验通过，邮箱实际收信仍由用户侧确认 |
| AC-13 | 部署/离线快照构建 | M3-05、M4-04、M4-05 | 通过 | EV-006/012：无外部 Key 从快照构建；main 推送触发 Workers Builds，完整质量门禁与生产发布成功 |
| AC-14 | 正式域名 | M4-04 | 通过 | EV-012：`https://jevtypesafe.dev/` 200；`www` 301 到 apex 并保留 `/test-path?probe=1`；证书有效、无拼写错绑 |
| AC-15 | 真实初始内容 | M3-07 | 通过 | EV-002：10 条全部有出处（固定 commit）与许可状态；数量从数据生成；待核/拒绝原因如实记录 |
| AC-16 | 凭证隔离 | M4-01 | 通过 | EV-009：GitHub 全历史门控与本地复验扫描源码 234、dist 59 文件及 10 个可达提交，historyMatches=0、findings 空；回归测试验证能发现仅存在于已删除提交中的令牌且不输出令牌值 |
| AC-17 | 赞助排期 | M5-02、M5-06 | 未验证 | — |
| AC-18 | 服务器到期 | M5-03、M5-06 | 未验证 | — |
| AC-19 | 事件计量 | M5-04、M5-06 | 未验证 | — |
| AC-20 | 商业故障降级 | M5-06 | 未验证 | — |
| AC-21 | CSV 对账 | M5-05 | 未验证 | — |
| AC-22 / P0 | 静态资源路径 | M4-02、M4-04 | 通过 | EV-006/012：本地与真实 Cloudflare 均为 Static Assets；普通 HTML/404/robots/sitemap 直接静态分发，无 bindings 或 Worker bundle |
| AC-22 / P0.1 | 仅赞助 API 动态执行 | M5-01、M5-06 | 未验证 | — |

## 5. 证据与缺陷台账

证据正文可放 `reports/acceptance/`，本文件只维护索引；截图和日志不放 `public/`，日志脱敏。每条记录必须包括实际日期、执行者、commit（无提交时记录工作区差异标识）、环境、命令或操作、预期/实际结果、证据路径和覆盖 AC。禁止把准备运行的命令写成测试结果。

| 证据 ID | 任务/AC | 版本与环境 | 执行与实际结果 | 文件/截图/日志 | 验证者/日期 |
| --- | --- | --- | --- | --- | --- |
| EV-001 | M1-01～M1-05、M2-01～M2-06（实现+部分场景） | Node v24.14.1 / npm 11.11.0 / Windows 11；分支 codex/m1-foundation 未提交（以工作区差异为准） | validate:data 通过（3 项目 6 分类）；check 0 错误；test 67/67；build 31 页；playwright 10/10（desktop+mobile）；canonical/hreflang/sitemap/404/noindex 抽查通过；375px 无溢出断言+截图+代理视觉检查通过。修复 contact 头部清理、e2e matcher、?project= 客户端初始化；新增 [...path].astro 页面层等（详见证据文件） | reports/acceptance/EV-001-m1-baseline.md 及 screenshots/ | ZCode 代理 / 2026-09-20 |
| EV-002 | M1-04/05、M2-01～M2-07 验收闭环；M3-01～M3-05、M3-07；M3-06 实现 | 同上环境；Codex 产出（e2e 套件、容量/Lighthouse/扫描、README、工作流、流水线）经复验计入 | validate:data 10 项目；check 0 错误；test 81/81；build 47 页；e2e 30/30（axe/44px/无 JS/搜索恢复/复制/键盘/reduced-motion/JSON-LD 核对）；容量 1500 条 23.3s、索引 gzip 18KB、JS 5.8KB；Lighthouse 移动 P/A/SEO=100/100/100；scan findings 空；发布 7 条真实候选（3→10）+ 2 待核（原因记录）；修复 publicFetchText 整体超时；e2e 数量断言改为数据驱动 | reports/acceptance/EV-002-m3-content.md、capacity.json、lighthouse-capacity-mobile.json、public-scan.json；reports/research/m3-07-review-2026-09-20.md | ZCode 代理（含 Codex 产出复验）/ 2026-09-20 |
| EV-003 | M4-01（AC-16）；B-03 邮箱配置 | Node v24.14.1 / npm 11.11.0 / Windows 11；工作区未提交 | 配置 contact_email=support@jevtypesafe.dev（按钮启用、无假成功文案、e2e 30/30 无回归）；validate/check/test(81)/build(47)；容量复跑 1500 条 36.4s（索引 gzip 18KB、JS 5.8KB、P95 9.3ms）；Lighthouse 移动 99/100/100；scan:public 源 121 + dist 55 findings 空（history=no_commits 待首次提交后复扫）；PRD 17.1 目标逐项对照见证据文件 | reports/acceptance/EV-003-m4-01-quality.md、capacity.json、lighthouse-capacity-mobile.json、public-scan.json | ZCode 代理 / 2026-09-22 |

| EV-004 | M1-05/M2-01/M2-07 UI 优化；AC-01/02 与既有行为回归 | 同上环境；基于 a68a040，codex/m1-foundation | 沿用 GLM-5.3 基线；桌面侧栏/手机滑动分类、搜索前置、紧凑列表与内页样式；check 0 errors、test 81/81、build 47 页、最终 e2e 30/30、7 页×4 宽度无整体溢出；手机键盘分类检查通过；一次 Wrangler 临时目录锁冲突隔离后复跑成功 | reports/acceptance/EV-004-ui-review.md；reports/ui-review/ 前后截图、capture.mjs、measurements.json | Codex / 2026-09-22 |
| EV-005 | SP-01；不计原站 M4/M5 通过 | 原站基线 95c6b1c；Windows、Node 24.14.1、Grove 0.11.0、Astro 7.3.3；外部隔离工程 | 原生/适配构建各 17 页、check 0 errors（7 hints）；4 组原生检查含限制复现、6 组适配检查通过；本地 assets-first / API / 404 通过；12 个已有脏文件 hash 未变。初始化失败、内存失败重跑、dry-run 挂起均留证；未部署 | reports/acceptance/EV-005-grove-compatibility.md；reports/grove-validation/ 工程 ZIP、日志、截图与 SHA256 清单 | Codex / 2026-09-22 |
| EV-006 | Open App Scout 结构 UI/动效；M4-02/03；M4-05 本地恢复 | 基线 95c6b1c + 未提交工作区；Windows、Node 24.14.1、Astro 7.3.3、Wrangler 4.135.0、Playwright 1.63.0 | check 0 errors；test 81/81；build 47 页；e2e 40/40；7 路由×4 宽度无溢出；Wrangler `/`/`/zh/` 200、404 正确、104 assets/无 bindings；生产索引/分析门控通过；detached baseline 恢复构建通过；公开扫描 202 源文件 + 55 dist 文件 findings 空。未部署，dry-run 输出成功后 Windows 进程未自行退出 | reports/acceptance/EV-006-open-app-scout-ui-m4-local.md；reports/taste-review/；reports/m4-*.json；reports/m4-static-dry-run/；reports/acceptance/public-scan.json | Codex / 2026-09-22 |
| EV-008 | CH-05；AC-01/02/03 技术验证 | HEAD a8dd5ce + 未提交实现及既有 UI 工作区；Windows、Node 24.14.1、Astro 7.3.3、Playwright 1.63.0 | Jev Atlas 名称/当前文案同步；首页 Hero 外间距 0px；dev toolbar=0；check 0 errors/0 warnings（8 hints）；test 81/81；build 47 页；并行 e2e 38/40，同一无 JS 用例双端超时后单 worker 完整复跑 40/40；中英×375/1440 四组专项验证通过 | reports/acceptance/EV-008-jev-atlas-header.md；reports/jev-atlas-header/ | Codex / 2026-09-23 |
| EV-009 | M3-06、M4-01、M4-05 / AC-13、AC-16；M4-04 发布前置 | `fdb986a` / `v0.1.0-rc.1` + workflow fix `8aa65b3`；Windows + GitHub Ubuntu runner，Node 24.14.1、npm 11.11.0 | check/test(82)/build(47)/e2e(40)；源码 234、dist 59、完整远端历史 10 提交扫描 findings 空；main/tag/PR Quality checks 全绿；content review 完成有界采集、自验证、artifact、分支及 PR #1；未部署 Cloudflare | reports/acceptance/EV-009-release-readiness.md；reports/acceptance/public-scan.json；GitHub runs 35869769200/35870617975/35870723324/35870919523/35872076269；PR #1 | Codex / 2026-09-23 |
| EV-010 | M4-03 / AC-11；M4-04 发布前置 | `bb30dd1`；Windows + GitHub Ubuntu runner，Node 24.14.1、Astro 7.3.3、Playwright 1.63.0 | 独立页面/分类描述与 1200×630 分享图；生产构建/部署防误索引门禁；test 88/88、check 0 errors、build 47 页、e2e 42/42；生产 44 index + 3 noindex + sitemap 44；公开扫描 findings 空；GitHub Quality checks `35877569914` 全绿；未部署 Cloudflare | reports/acceptance/EV-010-seo-release-gate.md；public/images/jev-atlas-social.png；reports/acceptance/public-scan.json；GitHub run 35877569914 | Codex / 2026-09-23 |
| EV-011 | M1-05、M2-01～M2-07 视觉质量复验；AC-01～04、AC-11 回归 | 重构至 `e30d80a`，验收推送 `821d6a8`；分支 `codex/precision-infrastructure-redesign` + `main`；Windows + GitHub Ubuntu runner，Node 24.14.1、Astro 7.3.3、Playwright 1.63.0 | 精密基础设施/技术出版物视觉系统；IBM Plex 自托管字体；首页真实状态索引、统一项目行、详情事实表和编号内页；test 88/88、check 0 errors、build 47、e2e 46/46；生产 44 index + 3 noindex；18 组视觉测量无溢出/单 H1/无小控件；公开扫描 264 源文件 + 116 dist + 20 commits，findings 空；GitHub Quality checks `35945161910` 全绿；未部署 | reports/acceptance/EV-011-precision-infrastructure-redesign.md；reports/precision-redesign/；reports/acceptance/public-scan.json；GitHub run 35945161910 | Codex / 2026-09-24 |
| EV-012 | M4-04/M4-06；AC-13/14/22；G0-01～08 | `a011a3f` + `v0.1.0`；Windows + Cloudflare Ubuntu build，Node 24.14.1、npm 11.11.0、Wrangler 4.135.0 | Workers Builds Git 集成；check 0 errors、test 88/88、47 页生产构建、公开扫描空；验收版本 `173587e1`，独立 main 自动晋级版本 `b1612a18`；apex/zh/详情 200、真实 404、robots/sitemap 200；www 301 保留路径/查询；MX/TXT 保留 | reports/acceptance/EV-012-cloudflare-production-deployment.md；Cloudflare builds `f433305a`/`32f5d303`；GitHub runs 35966893387/35967436989/35970605136 | Codex / 2026-09-24 |

建议编号 EV-001 起。一个证据可覆盖多项 AC，但必须列出各场景结果。UI 至少记录 375px 与桌面；构建通过不能替代视觉验收。生产域名验证必须记录真实 URL/状态码，不能只引用本地截图。

缺陷编号 BUG-001 起，状态：待处理/修复中/待复验/关闭。严重度：阻塞（核心流程不可用、泄密、数据丢失或收费交付错误）、高（必需功能明显不符）、一般（非阻塞小问题）。关闭必须有复验结果；需求缺口也要登记，不能仅称“后续优化”。

| 缺陷 ID | 严重度/阶段 | 复现与影响 | 关联任务/AC | 负责人 | 状态/复验证据 |
| --- | --- | --- | --- | --- | --- |
| — | — | 尚未检查，不代表无缺陷 | — | — | — |

## 6. 外部输入与阻塞

以下是待落实事项，尚不代表当前工程受阻。不要在此写入密钥、付款资料或私人通信。

| ID | 待落实项 | 需要时间 | 当前状态/负责人 | 缺失时可继续 |
| --- | --- | --- | --- | --- |
| B-01 | GitHub 仓库和 Cloudflare 项目访问 | M3-06/M4-04 实际接入 | 已解除：GitHub main/Actions/tag 与 Cloudflare OAuth、Workers Builds、API token、生产部署均验证 | 后续 main 推送自动部署；本地 OAuth 凭证仅用于维护 |
| B-02 | Vercel 控制台域名与 DNS 访问 | M4-04 正式绑定 | 已解除：Cloudflare NS 已生效；apex Custom Domain、HTTPS 与 www 301 已验证；仅移除两条旧 Vercel apex A 记录 | MX/TXT/DKIM/SPF 仍在；Vercel 继续保留域名注册/续费 |
| B-03 | 真实可收信 CONTACT_EMAIL | M4-03 及公开发布 | 已确认（2026-09-22 用户提供：support@jevtypesafe.dev；已配置 site.json 并验证构建产物） | 邮箱已在提交/赞助页启用；正式收信能力待用户在邮箱侧确认 |
| B-04 | 摘要供应商、模型、Key 与预算 | 真实 AI 批处理前 | 待选择 / 用户 | 适配器、受控测试、已有快照构建、待处理队列 |
| B-05 | GitHub 读取授权或限流额度 | 大批量采集前 | 按需要接入 / 用户与 Codex | 小批公开源及固定快照；报告限流情况 |
| B-06 | 基础分析站点 token | 上线后需要访问统计时 | 当前明确维持未配置；M4-03 已验证有 token 才加载、无 token 不加载 | 不阻塞目录发布；不产生或宣称访问统计 |
| B-07 | 价格、收款渠道、付款确认和补偿规则 | M5-07/首次销售前 | 未确定 / 用户 | 询价页和本地商业模块；不得虚构价格或付款 |
| B-08 | 生产/预览 D1 与签名密钥 | M5 实际部署前 | 尚未到阶段 / 用户与 Codex | 本地迁移、合成活动测试；不显示真实付费活动 |

实际受阻时补充：受影响任务、具体错误、已尝试方法、可继续工作、解除条件、下一次处理时机。仅在必要输入确实阻止下一步时向用户集中提问，不索取无关凭证。

## 7. 发布门槛

所有门槛初始“未验证”。任务完成或预览可打开不等于正式上线；通过必须引用证据，未达标项不能静默豁免。

| ID | P0 公开上线门槛 | 初始状态 |
| --- | --- | --- |
| G0-01 | P0 任务验收、17 项 AC 通过；必需缺口与阻塞/高缺陷关闭 | 通过（EV-012） |
| G0-02 | 真实发布内容有出处和许可状态；测试 fixtures 不进入产物；不凑 20–50 条 | 通过（EV-002/003） |
| G0-03 | 双语、无 JS、搜索、移动端和 SEO 实测；性能/可访问性目标有记录 | 通过（EV-003/006/010/011） |
| G0-04 | 采集与 AI 故障保留快照；验证离线构建和恢复 | 通过（EV-002/006） |
| G0-05 | 静态 Cloudflare 部署、main 发布链路和实际域名 HTTPS/www 正常 | 通过（EV-012） |
| G0-06 | 正式邮箱、独立站/隐私声明、分析配置和生产索引状态就绪 | 通过（EV-006/010/012；Analytics token 依设计维持关闭） |
| G0-07 | dist 与 Git 无密钥/私人资料；运行预算依据复核；无意外付费依赖 | 通过（EV-003/009/012） |
| G0-08 | README/运营手册/环境示例齐全；记录发布版本、URL、时间和维护人 | 通过（EV-006/009/012；`v0.1.0`） |

| ID | 首次收费门槛（额外于 P0） | 初始状态 |
| --- | --- | --- |
| G1-01 | M5 验收及 6 项商业 AC 通过，P0 无回归 | 未验证 |
| G1-02 | 生产排期、签名、数据库隔离、到期、暂停和备份恢复可用 | 未验证 |
| G1-03 | 曝光/点击/CTR/CSV 对账，漏记过滤及故障口径明确 | 未验证 |
| G1-04 | 用户确定价格/渠道/排期/补偿/报告安排；付款确认流程可执行 | 未验证 |
| G1-05 | 明确 Sponsored、最多 3 位；启用流程和版本记录齐全 | 未验证 |

性能目标见 PRD 第 17 节：自有首屏 JS gzip ≤80KB、每语言搜索索引目标 ≤250KB、1500 条容量样本、搜索反馈目标 200ms；移动端 Lighthouse 三项目标 ≥90。记录设备、环境、测量方式及偏差，不能拿某次分数代替真实体验。目标未达需修复或由用户明确接受记录的偏差，不能宣称已达标。

## 8. 范围及决策变更

| ID | 日期 | 原约定 → 新约定 | 原因/影响的任务、AC、成本 | 决定依据 | 状态 |
| --- | --- | --- | --- | --- | --- |
| CH-01 | 2026-09-22 | 站点域名错误拼写统一为 `https://jevtypesafe.dev`（PRD、AGENTS.md、README、site.json、config、astro.config、.env.example、seo.spec 共 10 处；本次同时清理文档中的错误拼写历史引用） | B-02 解除拼写待核实状态；影响 AC-14（正式域名）与 M4-03/M4-04 的 SITE_URL 基准；无成本影响 | 用户 2026-09-22 明确确认正确域名为 jevtypesafe.dev | 已实施 |
| CH-02 | 2026-09-22 | 新增 Grove 技术验证；直接采用门槛未通过，保留既有 Astro + JSON 架构；Open App Scout 仅作为后续布局参考，暂不迁移 | SP-01 / EV-005；不修改原业务范围、验收标准或 P0 分母；无部署或持续费用 | 用户要求先验证、关键能力不通过则保留 Astro；原生字段丢失及双语/筛选限制已实测 | 技术调查完成；正式采用 Grove 未批准 |
| CH-03 | 2026-09-22 | 正式否决 Grove 迁移，继续 Astro + TypeScript + Tailwind CSS + JSON；以 Open App Scout 为主要布局和视觉结构参考，增加原生渐进入场、滚动揭示、悬停反馈和 reduced-motion 降级 | M1-05、M2-01～M2-07、M4-02/03；不引入 React、数据库或全站 SSR；不复制参考站品牌、Logo、文案、项目数据、图片或源码 | 用户明确要求继续原技术方案，并要求使用 Taste Skill 优化布局与动画 | 已实施并由 EV-006 完整复验；AC-01 待用户最终视觉确认 |
| CH-05 | 2026-09-23 | 公开站名由 Jev Builds Directory / Jev / builds 统一为 `Jev Atlas`；首页 main 顶部间距归零、Hero 内容上移；关闭 Astro dev toolbar | AC-01/02/03；不改变域名、架构、内容范围或部署成本 | 用户确认采用 Jev Atlas，并要求同步其他文案、消除约 90px 间隙及移除 Settings/Audit 等框架按钮 | 已实施并由 EV-008 技术验证；用户随后确认 UI 调整完成 |

实现细节可由 Codex 在既定范围内决定。改技术架构、增加付费服务、改变商业模式、加入会员系统或降低验收门槛，须记录用户决定再实施。任务拆分需保留旧 ID 到新 ID 的映射，同时更新进度分母，不追溯美化历史。

## 9. 本次交接与下一步

- 本次完成：EV-012；Cloudflare Workers Builds 已连接 GitHub `main`，正式静态 Worker、根域名、HTTPS、真实 404 与 www 301 全部上线，M4-04/M4-06、17 项 P0 AC 和 8 项 G0 门槛闭环。
- 当前代码分支/版本：`codex/precision-infrastructure-redesign` 与 `origin/main`；正式发布 tag `v0.1.0` 指向验收提交 `a011a3f`；该提交由 main 自动发布为 Worker 版本 `b1612a18-9d0d-47a7-a2e8-1e2eecf8d930`，正式 URL `https://jevtypesafe.dev/`。其后的 main 变更仅校正本发布记录。
- 本轮实际检查：Cloudflare Ubuntu 使用 Node 24.14.1/npm 11.11.0；check 0 errors、unit 88/88、47 页生产构建、公开扫描空；apex/zh/详情/robots/sitemap 均 200，缺页 404，www 301 保留 `/test-path?probe=1`；Static Assets 无 bindings/Worker bundle。
- 当前限制：Cloudflare Web Analytics token 依设计维持关闭；搜索引擎站长平台尚未提交 sitemap；support@ 实际收信仍由用户邮箱侧确认。这些不阻塞 P0 目录上线。P0.1 商业能力仍需 M5 与用户的价格/收款/D1/密钥输入。
- 查看本轮交付：`reports/acceptance/EV-012-cloudflare-production-deployment.md`、`reports/acceptance/public-scan.json`；视觉/SEO/发布候选链路见 EV-011/010/009。
- 下一步：如进入收费准备，执行 M5-01；在此之前可由用户选择是否接入 Cloudflare Web Analytics，并在 Google/Bing 站长平台提交 `https://jevtypesafe.dev/sitemap.xml`。

每次工作结束替换上面的当前交接摘要，并在下表追加简短历史。无需为每次会话新建一份进度文档。

| 日期 | 工作范围 | 完成/证据 | 剩余与下一步 |
| --- | --- | --- | --- |
| 2026-09-20 | 文档初始化 | PRD 对齐，开发任务全部待开始 | M1-01 |
| 2026-09-20 | M1 全部实现 + M2 页面层；基线修复与全量验证 | EV-001；M1-01/02/03 已验收，M1-04/05 与 M2-01～M2-06 待验收 | M2-07 系统化验证收尾，然后 M3-01 |
| 2026-09-20 | M2 浏览器验收闭环（Codex e2e/容量/Lighthouse）+ M3 流水线 + M3-07 首批导入（发布 3→10） | EV-002；P0 任务 18/25、AC 12/17；M1/M2 全部与 M3-01～05/07 已验收，M3-06 待真实 Actions | M4-01；AC-01 待用户视觉确认 |
| 2026-09-22 | 域名统一 jevtypesafe.dev（CH-01）；M4-01 质量容量凭证检查；邮箱配置（B-03 解除） | EV-003；P0 任务 19/25、AC 12/17；容量/Lighthouse/扫描全部达标 | M4-02（Cloudflare 配置与预览）；建议建立首次 git 提交 |
| 2026-09-22 | 在 GLM-5.3 基线上完成精致深色目录 UI 优化 | EV-004；81 单测、30 e2e、28 响应式检查通过；前后截图留证 | AC-01 待最终视觉确认；下一工程任务 M4-02 |
| 2026-09-22 | Grove 0.11.0 隔离兼容性验证，保留 Taste 未提交工作 | SP-01 / EV-005；原生字段和双语限制复现，自定义适配版有限场景通过；静态 assets 与 API 本地路由通过；未迁移/部署 | 建议保留 Astro 并参考 UI；正式方向确认后恢复 UI 回归及 M4-02 |
| 2026-09-22 | Open App Scout 结构 UI/动效重构；M4-02/03 本地发布验证；M4-05 恢复演练 | CH-03 / EV-006；81 单测、40 e2e、47 页构建、28 响应式检查；Static Assets/生产索引/分析门控/独立恢复通过 | AC-01 待视觉确认；B-01/B-02 解除后完成 M3-06、M4-04/05/06 |
| 2026-09-23 | Jev Atlas 政名、首页 Hero 上移、关闭 Astro 开发工具栏 | CH-05 / EV-008；47 页构建、81 单测；中英×375/1440 Hero 外间距 0px、dev toolbar=0；单 worker e2e 40/40；用户确认 UI 完成，AC-01 通过 | 推进 M3-06 与 M4-04；线上接入待核 |
| 2026-09-23 | 提交 UI 候选并补齐 Git 历史凭证扫描 | EV-009；82 单测、47 页构建；源码 233、dist 59、Git 历史 6 提交扫描 findings 空；AC-16 历史扫描缺口关闭 | 推送 GitHub main 并核验真实 Actions；Cloudflare/Vercel 接入后推进 M4-04/05/06 |
| 2026-09-23 | GitHub main、真实 Actions、内容审核 PR 与候选 tag | EV-009；main/tag/PR Quality checks 和 content review 全绿；全远端历史 10 提交扫描空；自动创建 PR #1；`v0.1.0-rc.1` 已推送；M3-06/M4-05 已验收，P0 任务 23/25 | Cloudflare/Vercel/DNS 接入后完成 M4-04 与 M4-06 |
| 2026-09-23 | 上线前 SEO 优化与生产发布门禁 | EV-010；独立双语描述、全站社交分享元数据与 1200×630 分享图；test 88/88、e2e 42/42、生产 44 index + 3 noindex + sitemap 44；`bb30dd1` / Actions `35877569914` 全绿 | Cloudflare/Vercel/DNS 接入后完成 M4-04 与 M4-06 |
| 2026-09-24 | 精密基础设施 / 技术出版物全站视觉重构 | EV-011；IBM Plex、自适应真实状态首页、编号项目索引、内页事实表；test 88/88、e2e 46/46、18 组视觉测量通过、生产 44 index + 3 noindex、公开扫描空；`821d6a8` 已进 main，Actions `35945161910` 全绿 | Cloudflare/Vercel/DNS 接入后完成 M4-04 与 M4-06 |
| 2026-09-24 | Cloudflare 自动部署、正式域名与 P0 发布验收 | EV-012；Workers Builds/main、生产版本、apex HTTPS、www 301 保留参数、真实 404、robots/sitemap、MX/TXT 保留均验证；P0 25/25、AC 17/17、G0 8/8 | P0 已上线；可选 Analytics/站长平台，商业能力从 M5-01 开始 |

### CH-04 · 2026-09-23 · 导航与生成图标（第二版完成并获用户确认）
按用户要求统一分类对齐并移除箭头、将语言切换改为图标、去掉顶部说明栏；使用内置 image_gen 生成站点标识和语言图标，应用 logo/favicon/touch icon。EV-007 记录构建、类型检查、e2e 超时与复跑、双语响应式专项验证。用户于后续轮次确认 UI 调整完成，AC-01 通过；P0 分母及线上门槛不变。图像工具未返回可核验的底层模型版本。

第二版：用户不接受首版 Logo 与语言图标。语言按钮改为通用地球 SVG（22px）；内置 image_gen 重新生成青蓝色几何 J/V 科技标识，应用 `jev-mark-tech.png` 和带 tech 名称的 favicon/touch icon，避免旧图标缓存。生成原图与精确提示词在 `reports/brand-assets/`。本轮 build 47 页通过；check 0 errors/0 warnings、8 hints；`node reports/header-review-v2.mjs` 中英×375/1440 四组通过，验证新 Logo/地球 SVG、资源 200、菜单与切换、无溢出和对齐，截图及数据在 `reports/header-review-v2/`。后续 EV-008 完成全量复验并获用户视觉确认；未部署。
