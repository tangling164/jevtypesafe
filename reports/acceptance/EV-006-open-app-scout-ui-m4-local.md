# EV-006 · Open App Scout 布局重构与 M4 本地发布验证

- 日期：2026-09-22
- 验证者：Codex
- 分支/基线：`codex/m1-foundation` / `95c6b1c`，结果对应未提交工作区差异
- 环境：Windows 11、Node.js v24.14.1、npm 11.11.0、Astro 7.3.3、Wrangler 4.135.0、Playwright 1.63.0
- 覆盖：M1-05、M2-01～M2-07 回归；M4-02、M4-03；M4-05 本地恢复部分；AC-01/02/03/04/10/11/12/13/16/22 的本地场景

## 实现结果

保留 Astro + TypeScript + Tailwind CSS + JSON 和纯静态输出。没有安装 Grove、React、数据库或 SSR adapter，也没有新增 Worker `main`。以 Open App Scout 的信息结构为参考，重做搜索优先 Hero、顶部导航、分类目录、项目列表、项目详情事实侧栏、搜索筛选、信息页和三栏页脚；品牌、文案、配色、项目数据、图形和代码均为本项目内容。

动效使用原生 CSS 与 Web Animations API：首屏分层位移、滚动进入、悬停与按钮反馈；`prefers-reduced-motion` 会关闭动画。HTML 初始始终可见，无 JavaScript 时目录、分类和详情仍可访问。为避免动画期间降低文字对比度，滚动与首屏动画只改变位移，不改变透明度。

## 实际验证

| 检查 | 实际结果 | 证据 |
| --- | --- | --- |
| 数据、类型、单元测试 | `validate:data`：10 个项目/6 个分类；`npm run check`：0 errors、8 hints；`npm test`：81/81 | 本报告对应终态命令输出 |
| 静态构建 | `npm run build`：`output: static`，47 页 | 本报告的终态验证记录；生产断言另见 `reports/m4-production-assertions.json` |
| 浏览器回归 | `npx playwright test --workers=1`：40/40；桌面和 375px 手机均覆盖 axe、44px 控件、无 JS、搜索历史、404、SEO、动效与 reduced motion | `tests/e2e/reference-layout.spec.ts`、`tests/e2e/motion.spec.ts`、Playwright HTML 报告 |
| 响应式视觉 | 7 个路由 × 4 个宽度，共 28 次检查，无横向溢出；桌面和手机全页/首屏截图已人工查看 | `reports/taste-review/measurements.json`、`reports/taste-review/final-*.png` |
| Cloudflare 本地路由 | Wrangler Static Assets：`/` 200、`/zh/` 200、缺页 404；HTML `must-revalidate`，指纹资源一年 immutable；安全头生效 | `reports/m4-preview-http.json` |
| Wrangler dry-run | 读取 `dist` 104 个文件、`No bindings found`、输出 `--dry-run: exiting now`；Windows 进程仍保留句柄，30 秒后人工中断，不能记为正常退出 | `reports/m4-static-dry-run/output.txt` 及同目录生成物 |
| 生产索引 | 生产首页 `index,follow`；搜索页 `noindex,follow`；robots Allow；canonical/sitemap 为 `https://jevtypesafe.dev`；47 个 HTML；无 Worker bundle | `reports/m4-production-assertions.json` |
| 分析门控 | 生产模式使用合法格式测试 token 时注入 Cloudflare beacon；预览无 token 时不注入并保持 noindex。未配置真实 token，未产生真实统计 | `reports/m4-analytics-gate.json` |
| 独立恢复 | 从 detached `95c6b1c` 临时 worktree 执行 `npm ci`（0 vulnerabilities）、校验、81/81 单测和 47 页构建；外部 Key 全空；无 Worker bundle；随后安全删除临时 worktree | `reports/m4-recovery-result.json` |
| 公开产物扫描 | 终态 `npm run scan:public`：源码 202 文件、dist 55 文件、findings 空；仅检查工作区，Git 历史扫描仍待远端发布链路 | `reports/acceptance/public-scan.json` |

完整 e2e 首轮发现并复现三类问题：动画透明度导致瞬时对比度失败、页脚链接高度 32px、首页与页脚重复可访问名称导致无 JS 测试歧义。修复后失败用例先通过，最终完整 40/40 通过。移动端分类徽标出现 `43.999969px` 的像素舍入，最小高度改为 45px 后复验通过。

## 状态边界

- M4-02 的配置与本地 Static Assets 预览已验收；AC-22 的线上静态路径仍需实际 Cloudflare URL。
- M4-03 的域名、邮箱、索引与分析门控已验收；真实 Web Analytics token 缺失时维持关闭，符合“不配置不加载”。
- M4-05 的本地恢复演练已完成，但 M3-06 真实 GitHub Actions 尚未运行，且还没有正式发布 tag，因此任务保持待验收。
- M4-04 与 M4-06 仍受 GitHub/Cloudflare 访问、DNS、HTTPS、www 重定向和真实线上冒烟检查阻塞。本轮没有部署、推送、改 DNS 或宣称网站已上线。
- AC-01 的技术与视觉证据已更新，但最终美观度仍由用户确认。
