# EV-005 · Grove 技术兼容性验证

验证者：Codex；日期：2026-09-22；范围：用户授权的隔离技术验证，不是整站开发、正式迁移或部署。

**建议本轮保留现有 Astro + JSON 架构，不正式迁入 Grove 的数据模型。** Grove 0.11.0 的静态构建和基本目录功能通过；独立稳定 ID、双语摘要、必需业务字段和业务筛选无法仅靠原生配置实现。自定义适配版通过了本次有限场景，但主要业务层仍需自行维护，尚不足以取代已有 M4-01 基线。

Grove 本身建立在 Astro 上，并不是另一个与 Astro 互斥的渲染框架。本次否决的是“直接接管本项目数据和页面的迁移方案”，不是认为 Grove 无法生成静态双语网站。

## 1. 交付物与仓库保护

- 原仓库：`D:\project\jevtypesafe`；分支 `codex/m1-foundation`；基线 `95c6b1cff744ffe037afb13015f97b24bec80400`。
- 根目录 `AGENTS.md` 指向 `docs/AGENTS.md`，PRD 和唯一进度台账实际在 `docs/`。未创建重复的根目录文档。
- 隔离工程：`D:\project\jevtypesafe-grove-validation-20260922\grove-probe`。未在原仓库安装 Grove，未修改原仓库 package.json / package-lock.json，未新建 GitHub 仓库、提交、推送或部署。
- 可移植工程：[probe-source.zip](../grove-validation/probe-source.zip)，含原生脚手架、自定义适配版、3 条虚构数据、固定依赖/lockfile、验证脚本和许可；解压后看 README。无 node_modules、上游 Git 克隆或生产内容。
- 原始日志、结构化结果和截图：[evidence/](../grove-validation/evidence/)。打包清单：[delivery-manifest.json](../grove-validation/delivery-manifest.json)。
- 开始时保留完整未提交差异和未跟踪文件：隔离目录 `evidence/working-changes.patch`、`preserved-working-changes.zip`；索引为 [initial-state.json](../grove-validation/evidence/initial-state.json)。备份未放进网站 public。
- 前序 Taste 工作的 12 个源码、测试及截图文件 SHA256 全部未变，见 [preserved-files-check.json](../grove-validation/evidence/preserved-files-check.json)。原有 PROJECT_PLAN 修改在其基础上更新，未还原或覆盖用户工作。
- 前序 UI/动画仍未完成本轮验收；本报告不能替代原站回归、视觉确认或上线验收。

## 2. 版本、来源、许可和初始化

核查时 npm latest：`@grove-dev/cli`、`@grove-dev/core`、`@grove-dev/astro` 均为 **0.11.0**；CLI 要求 Node ≥22.12.0，Astro integration peer 为 `^6.0.0 || ^7.0.0`。元数据及 integrity 保存在 evidence/npm-*.json；测试依赖固定到精确版本，而不是 latest 范围。

实测环境：Windows、Node **24.14.1**、npm **11.11.0**、Astro **7.3.3**、TypeScript **6.0.3**、Tailwind **4.3.3**、Wrangler **4.135.0**、Playwright **1.63.0**。上游生成的 TypeScript 配置为 `strict: false`，因此本次 check 成功不代表满足原站 strict-mode 约定。

| 来源 | 核查快照 / 许可 | 处理 |
| --- | --- | --- |
| [Grove](https://github.com/tortuvshin/grove) | commit `ef69963b95a0bc80c3b904de4b0d7ca9579a9d34`；MIT；Copyright (c) 2026 Turtuvshin Byambaa | 使用发布包的脚手架；原样保留 Grove-MIT.txt |
| [Open App Scout 实际源码](https://github.com/tortuvshin/open-apps) | commit `17c1187fb81131f9d0d6ffc1cfc2dadbf9dbb8cb`；MIT；Copyright (c) 2024–2026 Open Apps contributors | 只读研究；完整 Open-Apps-MIT.txt 连同 legacy seed CC0 注记保留 |

用户给出的 `tortuvshin/openappscout` 返回 Repository not found。[Grove 官网](https://withgrove.dev/) 的 “Inspect the source” 指向 `tortuvshin/open-apps`，本次据此核对真实源码。没有借用参考站品牌名称作为本站身份、Logo、项目数据、图片或原文。许可文件中的上游名称仅用于保留归属声明。Grove 集成自动提供的通用技术栈/平台图标属于框架资源，不是复制参考站图片。

[官方初始化](https://withgrove.dev/getting-started/scaffold/) 使用 `npx @grove-dev/cli@latest init <目录>`。实际固定版本执行：

```text
npx --yes @grove-dev/cli@0.11.0 init grove-probe --no-install --no-git
```

**Windows 原生命令失败**：提示找不到 npm；使用另一个空目标目录复现，退出码 1，见 native-init.log。npm 本身可正常执行；源码 `packages/cli/src/package-manager.ts` 使用无 shell 的 `spawnSync` 探测 npm，Windows `.cmd` 调用存在兼容问题。

为继续验证，隔离目录安装发布 CLI，调用其内部 `initDirectory`，注入安装回调使其走内置 bundled registry writer，成功写入 72 个文件，再单独 npm install。见 bootstrap.log。未修改 node_modules 或上游源码；此内部 API 绕行不是正式初始化支持，也没有把原命令记成通过。原生成依赖为 `^0.11.0`，实验工程另行固定版本和 lockfile。

## 3. 数据与能力矩阵

原生输入：`data/records/*.yml`（本实验用 JSON 兼容 YAML）、`data/taxonomy/`，可附 Markdown 正文；文件 slug 是主要标识。构建产生 `records.full.json`、`records.index.json` 等投影。原生 `licenses: string[]` 不等于本项目的结构化 `license`；原生单个 `source` 不等于多出处 `sources[]`。不要只把字段写入 YAML 就假定会进入产物。

`scripts/native-schema.mjs` 实际调用已发布的 Schema；同时核对实际构建的 full/index JSON。结果详见 [native-schema.json](../grove-validation/evidence/native-schema.json)。

| 用户要求 | 原生 Grove 0.11.0 | 本次适配版 / 验证结果 |
| --- | --- | --- |
| 默认 `/`、中文 `/zh/` | `/` 通过；脚手架不生成 `/zh/`，实际请求 404，site.locale 为单值 | 自有 getStaticPaths 生成两个语言前缀；16 个业务页面 + 404 静态 HTML，通过 |
| 同项目独立稳定 ID + 英中摘要 | `id`、`locales` 在 Schema/投影中丢失；原生依赖 slug | Zod sidecar 保留 ID/两个摘要；6 个详情页和语言切换验证通过；未验证重命名重定向 |
| ecosystem/source_status/license/requirements/sources/verification | 以上 6 个字段全部被剥离；输入未报错不代表保留成功 | 自有白名单适配器保留并静态输出，通过；未知许可/使用条件继续保持 null |
| 列表、分类、详情 | 原生页面生成和无 JS 浏览通过 | 英中两套静态页面及分类浏览通过 |
| 搜索、筛选 | 原生关键词和 MIT 筛选实测通过；内置仅 category/stack/platform/tags/license；ecosystem/source_status 配置被拒绝 | 中文摘要搜索、ecosystem/source_status 组合 AND、local_install true/unknown、空结果、重置、URL 重载与语言切换通过 |
| 静态 HTML | 原生 build 显示 output/mode static，17 页 | 适配版 17 页；逐页 HTTP 正文与磁盘 HTML 相同；无 Astro server/_worker.js 输出，通过 |
| 普通页静态，赞助 API 单独动态 | Grove 不阻止此部署方式；API 不是其现成功能 | Wrangler assets-first + run_worker_first 数组；16 页面和资源无 Worker 标记，测试 API 有标记，通过 |
| Workers Static Assets | 框架产物可作为 assets 目录 | 原生纯 assets 配置、本地 workerd、混合 assets+Worker 配置验证通过；线上账户部署未执行 |
| 许可声明 | Grove 和参考源码均提供 MIT 文本 | 两份全文保留在源包与静态许可路径，HTTP 200，通过 |

适配流程：原始 YAML → 自有 Zod 字段白名单 → 以 Grove **visible index** 限定发布记录 → 自有双语页面/筛选。没有直接把 full JSON 当公共发布清单。正式采用时应以现有 JSON 为唯一源，自动投影到 Grove，不能让 JSON/YAML 两份数据由人工同步。

## 4. 实际执行与证据

| 执行 | 实际结果 | 证据 |
| --- | --- | --- |
| npm install --no-audit --no-fund | 安装成功；生成 lockfile | 工程 package-lock.json；不将其称为依赖安全审计 |
| npm run build | 退出 0；原生 17 页静态 HTML | native-build.log |
| npm run check | 退出 0；0 errors、0 warnings、7 hints | native-check.log |
| node scripts/native-schema.mjs | 确认 8 字段丢失、2 自定义 facet 拒绝 | native-schema.json |
| node scripts/verify.mjs native | 4 组断言通过，其中 2 组是**确认原生限制**，不是相应能力通过 | native-verification.json、native-browser.log |
| npm run build:adapted | 最终退出 0；17 HTML + sitemap.xml | adapted-build.log |
| npm run check:adapted | 最终退出 0；82 文件，0 errors、0 warnings、7 hints | adapted-check.log |
| node scripts/verify.mjs adapted | 最终退出 0；6 组检查通过，覆盖上表所列有限场景 | adapted-verification.json、adapted-browser.log |
| Wrangler 本地纯静态 / 混合预览 | 原生端口 8792、适配端口 8791；完成后已停止本次进程 | native-preview.log、adapted-preview.log |
| wrangler deploy --dry-run | 已生成 Worker bundle、读取 86 个静态文件并打印结束信息；进程持续未退出，人工中断；**不记正常退出通过** | cloudflare-dry-run.log、worker-bundle/ |
| 工作区保护核对 | 12 个已有脏文件 hash 一致；原 package/lock 无 diff | preserved-files-check.json |

期间失败也保留：并行启动第二个 workerd、同时构建时出现 Rust/workerd memory allocation 错误；停止本次预览并设置 `RAYON_NUM_THREADS=2` 后串行重建成功。现场可用物理内存约 0.9GB，视为本机并发资源问题，不能推断线上会失败。构建失败日志为 adapted-build-memory-failure.log。

适配测试初次有 1 组失败：测试误假设一定存在 `_astro/*.js`，实际小型脚本被内联。改为检查真正输出的 SVG 静态资源后重跑通过；首次 JSON/log 同时保留，未删掉 API/404/静态绕过断言。桌面与手机截图为 adapted-1440.png、adapted-375.png；这是技术原型，不是产品 UI 验收。

## 5. Cloudflare 边界

遵循 [Cloudflare Worker script 路由文档](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)，使用：

```json
{
  "main": "worker.js",
  "assets": {
    "directory": "./dist-adapted",
    "binding": "ASSETS",
    "run_worker_first": ["/api/sponsors/*"],
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page"
  }
}
```

没有 Astro SSR adapter，没有 SPA fallback。存在的普通 HTML 和资源走静态分发；赞助路径优先进入 Worker。assets 未命中的请求仍可能进入 Worker fallback，不能声称“所有非 API 请求永远不执行 Worker”。本实验未知路径返回真实 404。

`/api/sponsors/health` 只是返回 fixture/implemented:false 的隔离探针，未实现广告、D1、签名、统计和付费逻辑。未做远程部署、正式域名、DNS、HTTPS、账号权限、额度及线上计费验证；因此不能据此通过原项目 M4-02/M4-04/M5-01 或 AC-22 的线上验收。

## 6. 正式采用需补的开发与风险

1. **数据模型风险高**：原生 Zod 静默剥离字段；采集、normalize、sync、导入导出及更新工具是否会往返丢数据必须逐条验证。本轮没有让 Grove 接管既有 JSON 流水线。
2. **双语与身份需自研**：共享 ID、缺译策略、locale manifest、搜索索引、canonical/hreflang/sitemap、slug 重定向要统一维护。本实验只覆盖完整英中摘要的 3 条数据。
3. **筛选需自研**：业务维度、同维度多选 OR、跨页搜索、分页与返回恢复必须与原站行为对齐。原生 facet 枚举不能靠配置扩展。本实验单选表单只证明基本可行。
4. **迁移/更新成本**：Grove 将组件源码安装到消费者工程；高度定制后仍需维护组件差异。已有审核、来源、安全抓取、AI 增量、overrides/tombstones 和许可规则不能因框架替换丢失。
5. **Windows 和版本风险**：原版 CLI 初始化失败，内部 fallback 不宜作为长期生产依赖；0.x 版本、默认宽松 TS 配置和 semver 范围需要升级复验。Wrangler dry-run 未正常退出另列为本机工具限制。
6. **未验证项**：1500 条容量、性能预算、全面可访问性、Grove 自动同步/升级、缺译/重命名、真实 GitHub Actions、Cloudflare 线上部署。本实验不继承原站 EV-003 的性能结论。

没有发现静态渲染层面的绝对不可实现项；高风险是把“通过自定义代码可实现”误当作“Grove 原生支持，可无损迁移”。正式采用条件应包括：受支持的字段扩展机制或长期维护适配层的明确决定、迁移往返不丢字段、原站验收完整回归、Windows 可复现初始化及升级策略。在这些条件完成前不建议迁移。

## 7. 保留 Astro 时如何参考 UI

根据 [Open App Scout 页面结构](https://openappscout.com/)，后续可在现有 Astro 组件上参考：搜索主入口、分类/筛选区域、统一项目条目、分区标题、详情的正文与事实侧栏，以及桌面/手机布局切换。沿用本站配色、真实项目、摘要、来源、许可证状态和独立品牌，不导入其营销文案、排行计数、示例项目、Logo 或图片。若以后实际复制 MIT 组件代码，应在分发中继续保留对应版权与许可。动效和最终视觉优化属于后续 UI 工作，本次未继续实现。

## 8. 三份项目文档修改清单与下一步

原生关键要求未通过直接采用门槛，按用户要求保留 Astro 架构；**不把“计划采用 Grove”写成已经批准的迁移**。

| 文档 | 本次实际修改 | 后续正式采用或 UI 实施前的具体改动 |
| --- | --- | --- |
| docs/jev-directory-prd-v1.0.md | 仅清理域名错误拼写的历史引用，统一 jevtypesafe.dev；保留现有技术方案 | 若只参考 UI：更新 §1 UI 参考及 §6 风格要求为 Open App Scout/Grove 的结构参考，保留业务字段和品牌边界。若未来采用 Grove：增加框架版本、JSON→YAML 投影、扩展字段保护、双语 manifest、升级/迁移与回滚验收，不能只换框架名称 |
| docs/PROJECT_PLAN.md | 新增 SP-01 技术验证记录、EV-005 索引、CH-02 决策；当前交接改为本次结论；统一域名历史表述；保留原 P0 分母和基线计数 | 下一步确认是否接受 Astro + 参考 UI；恢复 UI 迭代与完整回归后再推进 M4-02；若选择继续 Grove，单独立迁移任务与不丢数据门槛 |
| 根 AGENTS.md / docs/AGENTS.md | **不修改**，根入口有效、域名已正确，既有 Astro/JSON、静态分发、双语与安全约定继续有效 | 正式选择后再更新 §3 允许的 Grove 依赖边界、§4 唯一事实源/投影/Windows 命令、§6 UI 参考及归属许可；禁止直接以 Grove full JSON 代替公共白名单 |

SP-01 的“已验收”只表示技术调查和证据交付完成，不表示 Grove 迁移通过、UI 满意、M4 发布完成或网站已上线。
