# EV-004 — 深色目录 UI 优化

- 日期：2026-09-22；执行者：Codex。
- 基线：`codex/m1-foundation`，`a68a040`（GLM-5.3 已推进至 M4-01）；开始时工作区干净。
- 环境：Windows、Node 24.14.1、npm 11.11.0、Astro 7.3.3；Chromium / Playwright 1.63.0；本地 Cloudflare 静态预览。
- 范围：M1-05、M2-01、M2-07，AC-01/02 的视觉与响应式复查，以及既有交互、双语、无 JS、SEO 回归。
- 用户选择：精致深色目录，清晰排版、紧凑列表、克制装饰。使用 `design-review` 技能；没有将技能流行度描述为已证实排名。

## 视觉发现与实现

本次作为同一个目录信息层级调整实施；不改 GLM-5.3 的内容、路由、采集或搜索逻辑，不增加依赖。

| 发现 | 调整 | 复查 |
| --- | --- | --- |
| 首页营销区域和赞助卡片占据过多高度 | 左对齐标题、搜索前置、赞助入口改为细条 | 英中首页桌面与手机截图 |
| 分类按钮与列表争抢横向空间 | 桌面分类侧栏、真实分类计数；手机横向滑动栏 | 375/768/1024/1440px，无整体溢出；手机键盘聚焦末项可见 |
| 列表按钮和徽标边框过多，信息轻重不清 | 细分隔线、低对比标签、分色首字母标识、轻量操作链接与统一元信息 | 首页、目录、详情相关项目列表 |
| 内页宽度与表单层级不统一 | 详情限制阅读宽度、来源自动换行、表单容器与全站导航统一 | 详情、搜索、提交、中文赞助页截图 |

代理主观设计评分：6/10 → 8/10，依据为层级、内容密度、跨页一致性；不是用户验收或客观质量指标。通用模板感减少，保留系统字体、近黑底、粉灰绿主按钮与明确来源信息。

## 验证

- `npm run check`：0 errors、0 warnings、8 个既有 hints（弃用提示和未使用导入）。
- `npm run test`：10 个文件、81 项测试通过。
- `npm run build`：10 个真实发布项目、6 分类验证通过，静态构建 47 页。
- 第一轮 `npm run test:e2e -- --workers=2`：30/30 通过。
- 隔离预览目录后的最终完整复跑：30/30 通过（1.7 分钟），包含双视口的 axe WCAG AA、44px 触控、全部页面单 H1/无溢出、无 JS 浏览、搜索状态/重试、邮件/复制、键盘/reduced-motion、SEO/404。`git diff --check` 通过。原 EV-002 截图已恢复，当前截图单独存放，避免改写历史证据。
- 最后调整手机分类栏后进行完整复跑；一次受本地 Wrangler `.wrangler/tmp` 文件锁影响，预览连接中断。现场存在 8788 与测试 8787 两个实例。保留既有 8788 实例，将测试实例的配置复制到被忽略的 `.wrangler/ui-preview/`，仅将 assets.directory 设为相同 dist 的绝对路径；端口、静态路由与响应头不变。未修改源码配置或测试断言来绕过失败。
- `node reports/ui-review/capture.mjs`：7 个页面 × 4 个宽度，共 28 项无整体横向溢出；结果见 `reports/ui-review/measurements.json`。
- 手机额外交互检查：聚焦横向分类最后一个链接会滚动到可见区域；键盘 Enter 展开原生分类菜单后可导航到分类页。
- 截图为真实本地渲染。初始截图来自 Astro 开发服务（包含开发工具浮层），最终截图来自 Cloudflare 静态预览，不含浮层。

## 证据文件

- `reports/ui-review/before-desktop.png`、`before-mobile.png`：修改前首页。
- `reports/ui-review/after-{home,zh-home,directory,detail,search,submit,sponsor}-{375,1440}.png`：最终整页截图。
- `reports/ui-review/viewport-{home,zh-home}-{375,1440}.png`：最终首屏截图。
- `reports/ui-review/capture.mjs`、`measurements.json`：可重跑截图及布局记录。

AC-01 仍待用户最终视觉确认。此次未重新测量 Lighthouse/1500 条容量，EV-003 的分数是历史结果，不代表本次改动重新验收；未部署、未推送。
