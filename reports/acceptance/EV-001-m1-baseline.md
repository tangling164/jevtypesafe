# EV-001 · M1 基线与页面层验证

- 执行者：ZCode 代理（GLM-5.3）
- 日期：2026-09-20（UTC+8 下午）
- 环境：Windows 11（10.0.26200）、Node.js v24.14.1、npm 11.11.0、Git Bash；工作区分支 `codex/m1-foundation`（尚未建立提交，工作区差异即本证据对应变更）
- 覆盖任务：M1-01、M1-02、M1-03（复核）、M1-04、M1-05；M2-01/M2-02/M2-04/M2-05 的实现基础

## 本次变更范围

1. 修复 `src/lib/contact.ts`：仅对进入邮件主题的字段（name）做 header 安全处理；正文专用字段（纠错 ID 等）只去换行，保留普通文本（对应单元测试意图）。
2. 修复 `tests/unit/contact.test.ts` 的 notes 上限断言（原断言把 URL host 中的字母 x 计入，永远多数 1 个，属于测试缺陷）。
3. 修复 `tests/e2e/contact.spec.ts`：`toBeInvalid` 不是 Playwright matcher，改为 `checkValidity()` 断言；`data-contact-output` 断言从 `toContainText` 改为 `toHaveValue`（textarea 的值由脚本设置，textContent 不会更新）。
4. `ContactForm.astro`/`src/scripts/contact.ts`：`?project=` 纠错参数改为客户端读取并净化（静态构建无法在构建期捕获查询参数）。
5. 新增页面层：`src/pages/[...path].astro` 由发布清单渲染全部路由；新增 `Pagination.astro`、`ProjectDetail.astro`；`BaseLayout` 增加 head 插槽；`routes.ts` Route 增加 `total`；补充 en/zh 文案键；删除被覆盖的占位 `src/pages/index.astro`。

## 命令与结果（全部实际执行）

| 命令 | 结果 |
| --- | --- |
| `npm run validate:data` | 通过：`Validated 3 published projects and 6 categories.` |
| `npm run check` | 通过：0 errors、0 warnings（5 hints 为 Zod 弃用提示） |
| `npm run test` | 通过：67/67（8 个文件） |
| `npm run build` | 通过：31 页生成（含 en/zh、目录、5 个非空分类、3 个详情、404） |
| `npx playwright test` | 通过：10/10（desktop + mobile 两项目组） |

## 关键抽查（dist 产物）

- `/`、`/zh/` canonical 分别自引用；hreflang 输出 `en`、`zh-Hans`、`x-default` 指向对应英文页。
- sitemap.xml 含 28 个可索引 URL；仅详情页带 lastmod（来自 checked_at）；空分类未生成页面。
- 搜索页 robots 为 `noindex,follow`；默认 `DEPLOY_ENV=preview` 时全站 noindex 且 robots.txt `Disallow: /`（预览隔离）。
- 搜索索引 `/search-index/{en,zh}.{hash}.json` 含 `schema_version:1`，文件名带内容 hash。
- 首页统计行显示真实计数「独立项目 3 个 · 已确认开源 3 个」（从内容数据生成）。
- 语言切换：`/projects/supercov/` ↔ `/zh/projects/supercov/`。

## e2e 覆盖场景

- 首页（desktop+mobile）单一 H1、375px 无整体横向溢出。
- 未知路径经 wrangler `not_found_handling: 404-page` 返回真实 404 状态码。
- 提交页：`?project=` 纠错 ID 出现在待发送内容中；`http://` URL 校验无效；页面无「已发送/提交成功」类假提示。
- `/zh/sponsor/`：含「最多 3」「30 天」「英文和中文」，无 Buy now/付款成功文案。
- `/privacy/`：说明不存储表单、无邮件服务。

## 视觉验收（截图）

- `screenshots/home-375.png`（375×667）、`home-desktop.png`（1440×900）、`detail-375.png`、`zh-home-375.png`。
- 视觉模型检查结论：近黑底、粉到灰绿渐变主按钮、细边框、无横向溢出、无重叠破损，符合 PRD 6.1/6.2 风格要求。

## 未验证 / 限制

- AC-01/AC-02 的完整验收还差键盘导航、reduced-motion、触控尺寸的系统检查（M2-07 范围）。
- 无 JS 浏览（AC-03）、搜索交互与 URL 状态恢复（AC-04）、语言切换缺译跳转（AC-10）尚无浏览器级测试，仅有实现。
- dist/Git 凭证扫描（AC-16）未执行。
- 构建产物为预览配置（noindex）；生产需 `DEPLOY_ENV=production` 重新构建，尚未验证。
