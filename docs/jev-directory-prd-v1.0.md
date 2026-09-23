# Jev 案例导航站 PRD v1.0

文档日期：2026-09-20  
文档语言：中文；产品语言：英文、简体中文  
工作名称：Jev Atlas（独立案例目录，可配置）
用户提供的已购域名：`jevtypesafe.dev`  
产品形态：开源项目及公开案例聚合导航站  
开发方式：单人使用 Codex 开发、自动化采集、少量运营审核  
状态：可用于实施；正式域名拼写、联系邮箱和收款方式按第 20 节完成上线配置。

> 域名以用户 2026-09-22 确认的 `jevtypesafe.dev` 为准；此前文档中的错误拼写已统一修正。开发时集中配置站点地址，正式绑定前仍从 Vercel 控制台复制实际域名核对。本次交付是产品需求文档，不代表网站已开发或已部署。

## 1. 产品结论与已确定决策

建设一个帮助用户发现 Jev 开源项目、集成工具和公开演示的英中双语目录。主要内容来自可追溯的公开项目及可复用数据源；系统负责采集、去重、摘要、分类、翻译和更新。站长无需持续原创教程、开发案例或运行评测。

| 决策 | 本文采用的方案 |
| --- | --- |
| 核心价值 | 按用途、源码状态和使用条件找到项目，并跳转源码或作者体验页 |
| 内容来源 | 开源目录提供发现线索；项目仓库、许可证和作者页面负责事实核实 |
| 生产方式 | 采集与 AI 辅助整理；缺失事实留空；人工只处理异常与商业合作 |
| 主语言 | 英文默认路径；简体中文位于 `/zh/` |
| 用户账户 | 普通访客不注册、不登录；第一阶段不开发会员系统 |
| 收费对象 | 需要触达相关开发者的商业工具或服务方 |
| 核心收费商品 | 首页赞助展示位，30 天，最多同时 3 个，英中两版覆盖 |
| 免费内容 | 浏览、搜索、筛选、查看详情、普通项目收录 |
| 价格 | 未确定；先询价，不把此前演示用的 $49 当成既定售价 |
| UI 参考 | [Open App Scout](https://openappscout.com/)；重点参考导航、搜索优先 Hero、分类/筛选、项目列表、详情信息密度和移动端布局，保留本站品牌与内容 |
| 主技术栈 | Astro 静态生成、TypeScript、Tailwind CSS、GitHub JSON 内容库 |
| 主部署 | Cloudflare Workers Static Assets；Vercel 保留域名注册和续费 |
| 初期成本目标 | 静态托管在免费额度内 $0/月；域名、AI、CI 和支付费用单独计算 |

### 1.1 两个交付阶段

为保持已确定的低成本部署方案，将公开目录上线和正式销售广告分开实施。

- **P0／v1.0：目录上线。** 完成静态双语目录、采集脚本、搜索筛选、项目详情、提交与赞助联系入口、基础访问分析。可以公开浏览和接洽合作，不承诺尚不存在的赞助统计服务。
- **P0.1／v1.1：首次收费前补齐。** 增加仅用于赞助的 Worker API 和 D1，落实广告排期、到期控制、曝光与点击记录、报告导出，然后开始售卖付费展示。
- **P1：有证据后扩展。** 站内提交表单、自助收款、后台管理、更广语言、MCP 等。没有明确需求前不开发。

P0.1 是首次销售广告的实施门槛，不是额外业务模式；P0 的普通页面仍然静态提供。

## 2. 目标用户、场景和业务目标

| 角色 | 具体场景 | 产品提供的结果 |
| --- | --- | --- |
| 独立开发者 | 想给自己的产品增加分类或路由功能 | 找到有源码的相近项目，了解接入条件 |
| AI 工具用户 | 想找能用的 Claude Code 插件或工作流 | 区分可安装工具与仅有视频的演示 |
| 中文开发者 | 英文仓库资料阅读成本高 | 阅读简短中文摘要，保留原始链接 |
| 项目作者 | 希望项目被更多人发现 | 免费提交公开项目链接，审核后收录 |
| 商业项目方 | 希望获得相关开发者关注 | 购买明确标注的展示位，获得可解释的数据报告 |
| 站长 | 无法持续制作原创内容 | 运行自动更新流程，审核异常，处理赞助 |

### 2.1 成功指标

工程上线与商业验证分别评估，不用 Star 数、上游记录数代替用户需求。

| 指标 | 口径／用途 |
| --- | --- |
| 有效独立项目数 | 按去重后的发布项目 ID 计数；两种语言只算一个项目 |
| 内容完整率 | 已发布条目中必填字段、出处及状态完整的比例；目标 100% |
| 核实及时性 | 公开“资料检查时间”；不是模型效果测试时间 |
| 用户访问 | 使用基础分析观察访问趋势、来源和访问页面，不预设收入 |
| 赞助询价 | 区分一般咨询、提供预算的咨询、付款客户 |
| 赞助交付 | P0.1 上线后报告可观测曝光、点击及过滤规则 |
| 运营负担 | 稳定后以每周审核约 1–2 小时为设计目标，实际记录验证 |

运营建议：上线后用 30 天作为一次复盘窗口，检查自然访问、项目出站需求和赞助询价。窗口与指标是内部实验安排，不是流量或收入承诺。

## 3. 范围与边界

### 3.1 P0 必须交付

1. 首页与目录、分类页、项目详情页、搜索页。
2. 英文与简体中文界面及内容；相同项目共用事实数据。
3. 来源采集、去重、仓库信息获取、许可证状态识别。
4. 基于来源的摘要、用途分类与翻译；可关闭 AI、可重试、可设置预算。
5. 自动生成更新差异与待审核队列，发布使用已保存快照。
6. 免费项目提交说明页、赞助合作页、关于与收录政策、隐私说明。
7. 基础访问分析、SEO 元数据、响应式布局、404 和失效状态。
8. Cloudflare 自动构建、域名接入说明、回退与维护文档。

### 3.2 首版不包含

- 自建 Jev Playground、托管第三方应用、Jev API 转售。
- 站长原创教程、付费课程、强制实测全部项目。
- 用户账户、评论、点赞、投票、竞价排名、付费上架。
- 自动发布宣传帖、群发推广、自动联系项目作者。
- 自建论坛、复杂 CMS、全站服务端渲染、浏览时调用 AI。
- 默认接入 Neon、Supabase、R2、付费搜索或邮件发送服务。
- 自动转载第三方视频、全文教程或不明确授权的截图。

## 4. 信息架构与 URL

使用小写、稳定英文 slug 和尾部斜杠；实际域名只从 `SITE_URL` 生成。

| 页面 | 英文路径 | 中文路径 | 索引规则 |
| --- | --- | --- | --- |
| 首页 | `/` | `/zh/` | 索引 |
| 全部项目 | `/projects/` | `/zh/projects/` | 索引 |
| 目录分页 | `/projects/page/2/` | `/zh/projects/page/2/` | 独立 canonical，可索引 |
| 分类 | `/categories/[slug]/` | `/zh/categories/[slug]/` | 有项目和有效说明时索引 |
| 分类分页 | `/categories/[slug]/page/2/` | 对应 `/zh/` 路径 | 有真实分页时索引 |
| 项目详情 | `/projects/[slug]/` | `/zh/projects/[slug]/` | 具备足够真实内容才索引 |
| 搜索 | `/search/?q=...` | `/zh/search/?q=...` | noindex,follow |
| 提交项目 | `/submit/` | `/zh/submit/` | 可索引 |
| 赞助合作 | `/sponsor/` | `/zh/sponsor/` | 可索引 |
| 关于与收录政策 | `/about/` | `/zh/about/` | 可索引 |
| 隐私说明 | `/privacy/` | `/zh/privacy/` | 可索引 |
| 404 | `/404.html` | 对应中文错误呈现 | 返回真实 404 |

所有页面显示顶部导航和页脚。首页主导航：Projects／Categories／Submit／Sponsor，右侧为 EN／简体中文。分类可用菜单展开。没有登录按钮、API Key 按钮和未实现的 Playground 链接。

### 4.1 分类词表

| 稳定分类 ID | 英文 | 中文 | 示例用途 |
| --- | --- | --- | --- |
| `data` | Data & Classification | 数据与分类 | 表格整理、文本标签、商品归类 |
| `routing` | Routing & Agents | 路由与 Agent | 工单、询盘、任务分流 |
| `filtering` | Search & Filtering | 搜索与筛选 | 新闻、评论、候选结果筛选 |
| `review` | Review & Validation | 审核与校验 | 内容审核、陈述比对、质量检查 |
| `developer` | Developer Tools | 开发工具 | 上下文管理、开发插件 |
| `experiments` | Research & Demos | 研究与演示 | 游戏、模型原型、实验实现 |

每个项目一个主分类、最多两个辅分类、最多五个用途标签。隐藏无项目分类；不得为了数量给空分类生成批量 SEO 页面。

## 5. 页面需求与交互

### 5.1 首页

从上至下：独立站说明条、导航、紧凑 Hero、搜索、赞助区域、分类筛选、最新项目列表、提交提示、页脚。

| 区域 | 内容与行为 |
| --- | --- |
| 独立站说明 | 说明与 TypeSafe AI 无隶属关系；链接官方站，避免误认官方 |
| Hero | 一行小标签、1–2 行主标题、一句说明；主 CTA 跳目录，次 CTA 跳提交页 |
| 搜索 | 支持名称、用途、标签、作者／仓库名；回车跳搜索页 |
| 数据摘要 | 显示实际独立项目数、确认开源数、资料快照日期；不展示假用户量或假收入 |
| 赞助区域 | P0 无真实赞助时只显示简短合作入口；P0.1 最多 3 个有标识的卡片 |
| 分类 | “全部”加已存在分类；主列表按分类链接浏览 |
| 项目列表 | 首屏不堆长篇模型介绍；首页展示最新 12 项并链接全部目录 |
| 底部 CTA | 邀请提交项目 URL，不暗示填写教程或付费才能被收录 |

主标题建议：英文 “Discover what people build with Jev.”；中文“发现用 Jev 构建的项目”。副标题说明可查源码、用途和使用条件；不得声称所有条目已实际运行。

### 5.2 项目目录与分类页

输入：搜索关键词、主分类、生态关系、许可证状态、使用方式、排序。输出：匹配数、项目行、分页或过滤结果、空状态。

| 控件 | 选项与规则 |
| --- | --- |
| 生态关系 | 全部／使用 Jev／Jev-like；未知关系不伪装成官方 Jev 应用 |
| 源码状态 | 全部／已确认开源／源码可见但许可待核／仅公开演示 |
| 使用方式 | 全部／有在线体验／需要本地安装；一个项目可同时具备两种方式 |
| 排序 | 最新收录（默认）／最近源码更新／GitHub Stars／名称 |
| 页容量 | 静态目录每页 24 项；客户端筛选结果也每页 24 项 |
| 状态保存 | 用 URL 查询参数；支持返回上一页恢复筛选，不依赖登录 |

过滤条件跨维度为 AND；同一多选维度为 OR。未知值在明确筛选该能力时不匹配。Stars 为采集快照，未知排最后、并列用稳定 ID 排序，显示更新日期。全站使用同一去重 ID，不因语言、分类或多个帖子重复计数。

基线目录与分类分页必须预渲染。JS 加载后使用精简本地索引增强全库筛选；索引不包含邮件、采集原始文本和完整 README。无 JS 时仍可浏览目录、分页和详情；搜索页明确提示需要 JavaScript，不显示虚假结果。

桌面目录行字段：项目图标／名称与一句话用途、用途分类、源码与使用方式徽标、可用 Stars、详情／GitHub／Demo 操作。默认顺序不是质量排名，不使用奖牌暗示评测获胜。

### 5.3 项目详情

| 模块 | 展示规则 |
| --- | --- |
| 标题 | 项目原名、作者、用途摘要、分类和生态关系 |
| 主要按钮 | View source／查看源码；Try demo／查看演示；不存在的链接不渲染 |
| 解决的问题 | 2–4 句来源支持的概括；资料少时缩短，不填空话 |
| 使用条件 | API Key、额外模型、设备与安装要求；未知项写未说明 |
| Jev 的作用 | 区分直接调用 Jev、可选集成、独立 Jev-like 实验 |
| 项目信息 | 许可证、源码快照时间、归档状态、网站链接 |
| 出处 | 原项目仓库、作者公开帖子或演示页，显示资料检查日期 |
| 核实状态 | 仅资料核实／实际运行验证；默认前者；后者必须有测试记录 |
| 相关项目 | 同用途最多 4 个，不影响广告自然排序 |
| 纠错 | 打开提交页并带项目 ID，用户可复制纠错信息或打开邮件 |

不复制原 README 全文；不显示没有来源的速度、准确率、成本。第三方报告的性能应标“作者报告”，并附出处和测试条件；第一版没有可靠数据就省略该模块。

### 5.4 免费提交项目（P0）

P0 使用静态页面和用户主动发送邮件，不新增数据库或发送服务。

- 必填：项目 URL（HTTPS）；选填：名称、补充说明（最多 500 字）。
- 用户点击“打开邮件应用／Open email app”，客户端生成主题与正文，收件人为站长配置的公开联系邮箱。
- 同时提供“复制提交信息”和可复制邮箱，支持没有本地邮件客户端的用户。
- 文案明确“请在邮件应用中发送；本站尚未收到提交”，不能显示“提交成功”或假审核编号。
- 用户无需在本站注册。收到邮件后，站长把 URL 输入采集命令，系统自动补充资料；不要求站长人工填写全部信息。
- 普通收录免费；说明来源核实与发布时间不作即时承诺。

P1 如确有提交量再改为 Turnstile＋Worker＋D1 表单；保留现有页面路径。

### 5.5 赞助合作页（P0）

清楚展示广告受众、位置示意、30 天展示、英中两版、最多 3 个并行位置、报告能力及限制。P0 使用“咨询赞助／Ask about sponsorship”，不放虚假 Buy now 按钮、倒计时、成交数或未确认定价。

询价内容：项目网址、推广目标、期望日期、预算（选填）。同样以打开邮件应用／复制信息完成联系，真实发送由用户在自己的邮箱执行。

展示位示意使用“位置示意／Placement preview”文字，不使用真实项目冒充已付款赞助商。未接入 P0.1 时，说明排期与报告服务在合作确认时约定。

## 6. UI 风格与组件规格

### 6.1 参考站实看结论

2026-09-22 已通过浏览器查看 [Open App Scout](https://openappscout.com/) 的首页、目录与详情结构。可借鉴：紧凑顶部导航、居中的搜索主入口、真实计数、分类网格、高密度项目条目、详情正文与事实侧栏、桌面/手机布局切换。用户提供的 `tortuvshin/openappscout` 仓库地址核查时返回未找到；参考站公开源码入口指向 [tortuvshin/open-apps](https://github.com/tortuvshin/open-apps)，仅用于结构和许可证研究。

本项目保留近黑底、偏灰白文本、淡粉和灰绿强调色、细边框与克制装饰，并把搜索、分类和真实项目列表前置。不复制参考站品牌、Logo、宣传文案、项目数据、图片或无关功能，不把参考站名称用于本站身份。若以后实际复制 MIT 组件代码，分发时继续保留对应版权和许可证声明。

### 6.2 设计令牌（本项目建议值，非原站完整 CSS）

| 令牌 | 建议值 | 用途 |
| --- | --- | --- |
| `background` | `#080908` | 本站页面基准底色 |
| `surface` | `#141715` | 列表、卡片、输入区域 |
| `surface-hover` | `#1C211E` | Hover 和选中背景 |
| `text-primary` | `#E6E4E7` | 本站标题和正文基准色 |
| `text-secondary` | `#AFB6B0` | 次要说明，保持可读对比 |
| `border` | `#303833` | 常规分隔线；表单控件需另验证对比 |
| `accent-pink` | `#E9A8C0` | 强调和焦点边框 |
| `accent-sage` | `#B8C9BD` | 渐变终点、补充强调 |
| 主按钮 | 粉到灰绿的浅渐变＋深色文字 | 浏览、提交等主行动 |
| 圆角 | 按钮 6px、卡片 10px、列表容器 12px | 保持紧凑，不做大胶囊风格 |
| 主字体 | 系统无衬线；中文优先 PingFang／Microsoft YaHei | 首版不依赖外部字体请求 |
| 代码与标识 | 系统等宽字体 | 仓库名、短代码字段 |

布局规格：内容最大宽度 1180px；桌面左右间距至少 24px，手机 16px；导航主体约 64–72px；Hero 桌面约 300–420px；标题桌面 48–72px、手机 32–42px；正文 16px、行高 1.6。首屏以搜索为主要操作，分类和项目列表保持较高信息密度。

### 6.3 关键组件

- **目录行**：桌面约 88–112px 高，名称 16–18px，摘要两行以内；鼠标悬停轻微提亮。项目名称链接详情，外部按钮独立，避免整个行与内嵌链接冲突。
- **赞助卡片**：桌面三列、平板两列、手机一列；统一高度；顶部持久显示 Sponsored／赞助。不能伪装成自然排名。
- **搜索框**：桌面最大宽 680px，触控高度至少 44px，清除与回车行为明确。
- **过滤器**：桌面横向分组；手机展开筛选面板，有关闭按钮、焦点返回和当前筛选数量。
- **标签**：颜色之外保留文字含义；“源码可见”不等于“已确认开源”。
- **项目图标**：优先允许使用的图标；无授权或无资源时用名称首字母和固定背景，保证无破图。
- **装饰纹理**：纯 CSS、低透明度、置于背景；不压在表格文字上；首版不做 WebGL 和自动播放视频。
- **动效**：仅 120–180ms 的透明度和颜色过渡；响应 reduced-motion。

响应式规则：≥1024px 为表格式目录；640–1023px 精简列；<640px 转纵向信息卡，不能要求横向拖表才能操作。首版只做暗色主题，减少双主题维护。

### 6.4 必须交付的界面状态

正常／筛选中／零结果／索引加载失败／来源链接未知／归档项目／无赞助／赞助服务不可用／复制成功或失败／联系邮箱未配置／404／中文译文尚未就绪。

空结果文案：英文 “No matching projects. Try fewer filters.”；中文“没有找到匹配项目，请减少筛选条件。”提供清除筛选按钮。

## 7. 内容来源、许可和可信度

### 7.1 首批来源

| 来源 | 用途 | 限制 |
| --- | --- | --- |
| `everyai-com/jev-directory` | 发现候选项目及原始出处 | 是聚合数据，不证明每个项目独立、开源或可运行 |
| GitHub 项目仓库／README／LICENSE | 核实项目功能、接入条件、许可证和更新状态 | 公开仓库不自动等于开源许可 |
| 作者公开网站／演示链接 | 补充访问入口和项目介绍 | 不擅自转载视频或受限素材 |
| 用户提交 URL | 后续新内容 | 先核实，不能提交即发布 |

优先读取结构化数据而不是抓取导航 HTML。已知上游文件包括 `data/use-case-candidates.json`；实际字段在开发时按当时文件核实，写适配器和 fixture，不把上游字段未经校验直接用作本站模型。保存来源 commit／快照日期。[上游仓库](https://github.com/everyai-com/jev-directory)

上游仓库标 MIT；复用其许可覆盖的代码或文档时保留声明。外链项目及原始社区材料按各自权利状况处理。本站默认用简短事实摘要和出处链接，不因为聚合仓库开源就批量复制第三方作品。[许可证](https://github.com/everyai-com/jev-directory/blob/main/LICENSE)

### 7.2 收录类型和发布要求

| 类型 | 判定 | 展示标签 |
| --- | --- | --- |
| 明确开源 | 可访问源码，许可证已识别，属于允许名单 | Open source／已确认开源 |
| 源码可见 | 有仓库但无许可证、许可未知或需进一步判断 | Source available／许可待核 |
| 公开演示 | 有作者可追溯演示，无公开源码 | Demo only／仅演示 |
| Jev-like | 作者明确说明为独立相似模型／替代实现 | Jev-like，并显示区别 |
| 工具集成 | 在工具中直接或可选使用 Jev | Jev integration／Jev 集成 |

初期自动标记开源的许可证允许名单采用 MIT、Apache-2.0、BSD-2-Clause、BSD-3-Clause、ISC；其他许可证进入规则复核，不自动认定不可用。GitHub 许可证 API 识别结果也要保留原许可证链接，`NOASSERTION` 视为未知。[GitHub 许可证 API](https://docs.github.com/en/rest/licenses/licenses)

发布必需：稳定项目 ID、名称、有效项目链接、主分类、简短用途、事实来源、生态关系、源码状态、资料检查时间。用于性能断言或“已运行”徽标的证据是额外字段，不是所有项目强制要求。

已知种子候选：

| 项目 | 核查到的描述 | 类型 |
| --- | --- | --- |
| [fast-jev-compaction](https://github.com/tamaratran/fast-jev-compaction) | 用 Jev 判断历史工具调用与结果的保留／截短 | Claude Code 集成；仓库标 MIT |
| [supercov](https://github.com/supercorp-ai/supercov) | 编程 Agent 的代码质量与覆盖信息，其中质量评分使用 Jev | 开发工具；仓库标 MIT |
| [jevlike](https://github.com/vinnylarouge/jevlike) | 在候选选项间评分和选择的独立模型原型 | Jev-like 实验；仓库标 MIT |

种子描述仅基于作者资料，未代表本站实测。开发者应重新获取它们的当前状态；不得硬编码虚假 Stars、运行成绩或把上游声称的总数用作本站统计。

## 8. 采集、摘要、翻译和发布流程

### 8.1 流程

候选源下载 → 格式校验 → URL 规范化与去重 → 获取仓库资料 → 分类与摘要 → 翻译 → 数据校验 → 差异／待审核队列 → 合并快照 → 静态构建。

建议命令契约：`npm run ingest`、`npm run enrich`、`npm run translate`、`npm run validate:data`、`npm run content:diff`、`npm run build`。这些是本项目需要实现的脚本，不是已有上游 API。

### 8.2 自动化与人工边界

- 新项目的首次公开，初期采用批次预览后合并；不要求逐项写文案。
- 已发布项目的 Stars、仓库更新时间等低风险字段可按规则自动更新；自动合并仅针对允许字段并通过检查。
- 内容大幅变化、主域名变更、许可证变化、可疑外链进入异常队列。
- 站长手工修正写入独立 overrides，优先级高于采集与 AI，后续同步不得覆盖。
- 删除使用 tombstone／停用状态；站长移除的项目不得被下一次采集自动恢复。
- AI Key 缺失时，已有快照照常构建；新增候选可保留来源简介进入待处理，不能伪造中文或阻断整站。

### 8.3 去重和更新规则

GitHub 仓库优先以稳定 repository ID 去重；owner/name 用于显示，重命名时保留本站项目 ID。规范化去掉追踪参数与 `.git` 后缀；不同帖子指向同一仓库合并来源。Fork 默认不单独收录，除非存在清楚的独立功能。多个独立产品使用同一 monorepo 时可人工指定子项目 ID，避免过度合并。

以内容 hash 判断摘要输入是否改变。仅 Stars 变化不重新翻译。新源码内容与原摘要无关时不无条件调用 AI。记录输入 hash、模型、提示模板版本、生成时间，保证可追溯。

### 8.4 来源故障与采集限制

- 单次访问超时建议 15 秒、最多 2 次退避重试、有限并发（初值 3）。遵循 GitHub 限流响应和重试提示。
- 源列表为空、结构改变或规模异常下降时中止该源更新，保留最后成功快照；不批量删除已发布内容。
- 初始异常阈值可设为相对上次成功快照减少超过 20%，只触发检查，不代表项目真的消失。
- 链接状态区分可访问、限制访问、暂时失败、已确认不可用。403／429 不直接标成死链；连续两次独立检查确认 404 后再进入处理队列。
- 只访问公共 HTTP(S) 地址；拒绝内网、回环、元数据 IP，重定向每跳重新校验；不执行第三方脚本和安装命令。
- 限制响应大小及 MIME，README 默认取文本；只解析外部数据，不执行上游生成器或动态脚本。
- 私有 Discord／社媒内容不在首版自动抓取范围；只使用已公开且适合收录的项目线索，不复制成员资料。

### 8.5 AI 输出约束

使用能生成文本的模型做摘要与翻译，不假定 Jev 可以生成文章。供应商尚未确定，使用可替换适配层；本导航站不要求配置 Jev API Key。

允许输出：简短摘要、用途标签、语言翻译、来源支持的使用条件。禁止输出：虚构效果、许可证、作者身份、用户数、收入或“已实测”。摘要结果必须对应 source_ref；未知字段返回 null，模型输出再经 Schema 校验。

生成任务按新增／变化记录计费，设置每次最多处理项目数、输入长度、最大输出长度和总预算；预算耗尽后保留队列，不影响网站。提供 dry-run 和费用预估，不能默认购买额度。

### 8.6 自动更新运行位置

P0 脚本支持 Windows 本地 Node.js 运行，并提供 GitHub Actions 工作流（定时及手动触发）。默认每日一次低频增量采集；首次全量采集分批执行。AI 翻译按队列变化触发，避免每天全量重做。

GitHub Actions 生成更新分支和差异，Cloudflare 只在正式分支变更后部署。注意工作流使用 `GITHUB_TOKEN` 创建的事件可能不触发后续工作流；数据验证必须在采集工作流自身执行，不能只等待另一个 PR 检查。定时任务失败或延迟时可本地／手动重试，不能承诺准点实时更新。[GitHub Actions 触发说明](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-when-your-workflow-runs/triggering-a-workflow)

## 9. 数据模型与存储

### 9.1 Git 内容结构

| 路径 | 内容 | 是否进入公开构建 |
| --- | --- | --- |
| `content/projects/*.json` | 归一化项目与英中摘要 | 仅发布字段 |
| `content/categories.json` | 分类定义与双语标签 | 是 |
| `content/overrides/*.json` | 人工字段修正 | 合并后输出允许字段 |
| `content/tombstones.json` | 移除原因与阻止重新导入的 ID | 不直接公开内部原因 |
| `content/site.json` | 品牌、公共邮箱、文案等 | 按字段输出 |
| `scripts/` | 采集、转换、检查、导出工具 | 否 |
| `var/ingest/` | 原始响应、错误及临时缓存 | gitignore；必要快照另做持久备份 |
| `reports/` | 更新差异、质量报告 | 非 `public/`，默认不公开 |

仓库默认私有。可公开数据与私人通信分离，即使仓库以后公开也不能夹带联系邮件、付款信息或凭证。

### 9.2 项目字段

| 字段 | 类型 | 规则 |
| --- | --- | --- |
| `id` | string | 本站稳定 ID |
| `slug` | string | 双语共用；变更生成 301 |
| `name` | string | 原名，通常不翻译 |
| `owner` | string/null | 项目公开作者／组织名称 |
| `primary_category` | enum | 第 4.1 节词表 |
| `tags` | string[] | 至多 5 项，使用标准词表 |
| `ecosystem` | enum | `jev`／`jev_integration`／`jev_like`／`unknown` |
| `source_status` | enum | `open_source`／`source_available`／`demo_only`／`unknown` |
| `repo_url`、`demo_url`、`website_url` | URL/null | 各自独立，禁止将仓库当在线体验 |
| `repository_id` | string/null | GitHub 稳定标识，去重依据 |
| `license` | object/null | SPDX、LICENSE URL、核查时间、识别方式 |
| `requirements` | object | API Key／硬件／本地安装等可未知，不做假布尔 |
| `locales.en`、`locales.zh` | object | summary、problem、requirements_text、generation 状态 |
| `sources` | object[] | URL、类型、快照／commit、抓取时间 |
| `stars` | integer/null | 无值时隐藏，不伪造为 0 |
| `repo_updated_at` | datetime/null | 上游时间，不等于收录时间 |
| `first_published_at` | datetime/null | 本站首次公开时间 |
| `checked_at` | datetime | 资料核实时间 |
| `archived` | boolean/null | 原仓库状态 |
| `verification` | enum | `source_checked`／`runtime_tested`；后者需证据链接 |
| `status` | enum | `draft`／`review`／`published`／`unlisted` |
| `source_hash`、`generation` | object | 增量更新与追溯；选择性公开 |

`sponsored` 不作为项目永久属性；赞助属于独立 campaign。开源筛选不得因为项目购买广告而改变。

## 10. 多语言与 SEO

### 10.1 英中共用事实

默认英文 `/`，中文 `/zh/`。不按 IP 强制跳转，不把语言当作国家。切换语言时优先保留同项目／同分类／筛选状态；目标译文未发布则提示并链接英文原页面，不生成假中文详情。

系统 UI 使用静态翻译字典。项目只翻译摘要、用途和条件；代码、命令、API 参数、项目名保留原文。仅生成过且校验通过的译文进入中文页面；更新时按输入 hash 局部重译。Astro 可生成与核验语言路由，但 hreflang 和内容完整性仍需项目自身实现。[Astro i18n](https://docs.astro.build/en/guides/internationalization/)

### 10.2 可索引页面要求

- 每页唯一 title、description、H1，项目页至少有真实摘要、用途／条件及出处。
- 语言页 self-canonical；互相标记 `en`、`zh-Hans`，`x-default` 指向对应英文页。
- 无有效中文内容时不放进中文 sitemap 或 hreflang；不得中英页全部 canonical 到首页。
- 自动生成 sitemap，lastmod 来自内容实质变更，不是每次构建时间。
- 查询筛选状态统一进入 `/search/`，noindex；不要无限生成筛选组合静态页。
- 静态目录分页有实际 HTML 与普通链接，搜索引擎无需执行 JS 即可到达详情。
- 预览环境 noindex；上线前检查生产没有遗留 noindex。
- 项目合并使用 301；确实删除按场景返回 404／410，不跳首页掩盖缺失。
- 结构化数据优先 `CollectionPage`／`ItemList`／`BreadcrumbList`，与页面一致；不生成虚假评价或评分。
- 赞助外链使用 `rel="sponsored noopener"`；其他新窗口外链使用 `noopener`。

SEO 是实现规范，不是排名承诺。没有真实量化资料时，不在站上展示搜索量、用户规模或盈利判断。

## 11. 盈利模式与赞助交付

### 11.1 商品定义

商品工作名称：Homepage Sponsorship／首页赞助展示。面向与本站访客相关的商业工具、托管或开发服务。纯个人开源作者不预设有推广预算；开源项目提供内容，不要求它们承担付费供给。

| 项目 | 规则 |
| --- | --- |
| 展示位置 | 首页独立赞助区，位于搜索下方、自然目录上方 |
| 同期数量 | 最多 3 个；桌面均等列宽、移动端依 slot 顺序展示 |
| 时间 | 按 UTC 记录起止时间；30 天定义为 30×24 小时 |
| 覆盖语言 | 英文＋中文；套餐中明确说明不是两份独立受众 |
| 素材 | 名称、短文案、有效链接、允许展示的图片／图标；中文可辅助生成 |
| 定价方式 | 询价，单次购买，无默认自动续费 |
| 承诺 | 展示位置、日期与约定的数据报告；不承诺流量、销量、SEO 排名 |
| 普通收录 | 符合规则时免费；赞助到期不删除其普通项目条目 |
| 标识 | Sponsored／赞助一直可见；不以付费替换“已确认开源”等事实徽标 |

一个项目最多占一个同期位置。不做自动轮播与付费竞价。位置顺序和手机显示顺序提前展示；报价以明确位置与时段为单位，不能保证三个位点击相同。

### 11.2 从询价到上线

1. 项目方从合作页发起询价。
2. 站长确认项目相关性、链接、素材权利、位置、日期、价格、报告口径和异常补偿安排。
3. 生成待确认排期记录，防止两笔合作占用同一 slot 同一时间。
4. 通过站长最终选定的有效收款方式收款；首版在托管支付页／人工确认完成，不在本站接银行卡信息。
5. 付款核实后把广告设为 scheduled；未付款不能凭跳转“成功页”激活。
6. P0.1 按服务器时间上架、结束；报告导出后由站长交付，不自动群发邮件。
7. 同意延期／退款时单独记录原因与新时段，不改写原始交易和统计记录。

本 PRD 不指定尚未决定的支付商、不使用 Stripe 作为前提，也不要求为开发先开通支付账户。P0 完成询价闭环；首次收款前落实有效支付渠道和 P0.1。

### 11.3 排期与状态

商业状态：draft → reserved → scheduled → ended；取消为 cancelled。展示条件是 `scheduled` 且 `start_at <= server_now < end_at`，并且没有暂停标记；不依赖每日 Cron 把数据库状态改为 active。

排期冲突按同 slot 的半开区间比较，校验失败不允许确认付款排期。reserved 有明确失效时间；实际保留时长由运营配置。数据库修改通过运营脚本事务执行；收款结果、确认人和时间保留私密记录。

## 12. 统计与首次收费前的动态模块（P0.1）

### 12.1 P0 的基础分析

接入 Cloudflare Web Analytics，观察页面访问和性能。用规范化路由判断中文／英文页面访问；仅依据后台实际可得维度展示报告，不承诺其提供任意自定义事件或完整跨语言去重。[Web Analytics](https://developers.cloudflare.com/web-analytics/about/)

P0 不把页面访问量当作广告曝光，不声称已经记录每个出站点击。需要验证出站行为或准备售卖赞助时，进入 P0.1。

### 12.2 P0.1 最小技术增量

增加一个轻量 Worker 脚本和一个 D1 数据库；所有 HTML 仍然静态生成。Worker 仅处理 `/api/sponsors/*`，D1 存广告排期和事件。普通浏览、目录搜索和项目详情不查询 D1。

| 自建接口 | 方法 | 输入 | 输出／行为 |
| --- | --- | --- | --- |
| `/api/sponsors/active?locale=en` | GET | en／zh | 按服务器时间返回有效广告、server_now、失效时间和计量 token |
| `/api/sponsors/events` | POST | 批次事件、campaign_id、token、locale、pageview_id、event_id | 校验后记录；失败不阻止用户访问项目 |

这些是本站拟实现接口，不是 Jev 官方接口。公共接口不返回收款信息、项目方邮箱、私密备注或未来未公开合同。广告更改和报表导出仅通过受账户权限保护的运营命令进行，不建设无保护的 `/admin`。

### 12.3 广告显示与到期

- 首页预留广告槽位，GET 成功后显示当前广告；JS 禁用或接口失败时不显示过期广告，正常项目浏览不受影响。
- active 响应使用 `no-store`，避免缓存越过开始／结束边界；初期最多 3 项，查询使用时间与状态索引。
- 已打开页面依据 server_now 与单调计时器计算剩余时间，到期移除广告；标签页恢复可见时重新获取有效名单。
- 不在静态 HTML 内硬编码长期可见的付费广告，避免依赖“凌晨定时重建准点成功”。
- API 超额或数据库故障时隐藏广告并记录服务问题；站长按约定补足展示，不补造曝光数据。

此设计支持真实排期，代价是每次首页广告加载产生少量动态请求。未启用商业模块时不产生这些请求。

### 12.4 统计口径

| 事件／指标 | 定义 |
| --- | --- |
| 广告可观测曝光 | 卡片至少 50% 面积连续可见 1 秒，且页面处于前台；每 campaign、每 pageview 最多一次 |
| 广告出站点击 | 用户主动点击赞助链接时触发；每 campaign、每 pageview 在报告中最多计一次 |
| CTR | 在已有合格曝光的页面实例上发生的点击数 ÷ 合格曝光数；分母为 0 时为空 |
| 去重事件 | `event_id` 唯一，重复上报不重复累计；另按 pageview 与 campaign 做报告去重 |
| 语言 | 触发事件的页面语言；不据此推断访客国家 |
| 收集情况 | 报告注明无 JS、拦截、离线、接口失败可能造成漏记 |

点击记录异步发送，链接保留真实目标 URL；不经统计重定向才能出站。统计失败时照常跳转。客户端没有收到 2xx 时最多有限重试，复用 event_id；禁止无限重试放大费用。

客户端数据只能作为可观测信号。排除可识别机器人、预览环境、自测流量、异常频率和重复事件；不能宣称“100% 真人点击”或“审计级反作弊”。对外报告明确命名为去重并经过基础过滤的可观测数据。

### 12.5 事件最小化与防滥用

- 仅允许固定事件枚举、有效 campaign 和 locale；不接受任意字符串维度，单批最多 10 个、请求体最大 16 KiB。
- 服务端校验短期签名 token、请求 Origin 和活动状态；Origin 校验不作为唯一防护。
- 签名密钥仅在 Worker Secrets，token 不包含私人信息；有效时长不超过排期剩余时间。
- 基础请求限流；可使用当日盐化散列的 IP 仅做限流与异常识别，不存原始 IP、完整 UA、完整来源查询参数。
- pageview_id 为单页随机值，不用来建立跨站画像；不声称跨语言独立人数已去重。
- 事件保存 30 天，按日聚合保存 12 个月；清理需幂等，有导出及失败记录。
- 本站隐私说明明确区分基础分析与广告事件，不声称所有数据都留在浏览器。

### 12.6 D1 数据表与报告

| 表 | 最小字段 |
| --- | --- |
| `campaigns` | id、project_id/null、slot、status、paused、start_at、end_at、双语文案、target_url、asset_url、created_at、updated_at |
| `sponsor_events` | event_id 唯一、campaign_id、kind、pageview_id、locale、received_at、quality_flag |
| `sponsor_daily` | UTC 日期、campaign_id、locale、曝光数、点击数、排除数；联合唯一键 |
| `campaign_audit` | campaign_id、操作者、动作、时间、变更摘要；私密 |

合同金额、联系方式和付款凭证保存在私密运营记录，不能进入公开 Git 数据／搜索索引。报表 CLI 按 campaign 和日期导出 CSV：投放区间、位置、每日英中曝光／点击、汇总、CTR 口径、异常区间、生成时间。首次有数据时验证一次，不能用演示数字出正式报告。

## 13. 详细技术栈与工程结构

| 层 | 选择 | 说明 |
| --- | --- | --- |
| 页面 | Astro，静态输出 | 每个项目有真实 HTML；不依赖运行时 SSR |
| 类型与校验 | TypeScript＋Zod | 采集、生成、发布数据共用 Schema |
| 样式 | Tailwind CSS＋少量 CSS | 暗色设计令牌，静态构建 |
| 浏览器交互 | 原生 TypeScript 模块 | 搜索、筛选、复制、语言切换；默认不引入 React 全量运行时 |
| 搜索 | 精简 JSON 索引＋字符串／标签匹配 | 先支持中英文子串与规范化匹配，无外部搜索服务 |
| 内容存储 | GitHub JSON | 普通内容无数据库 |
| 构建发布 | Cloudflare Workers Builds | Git 集成，正式分支自动发布 |
| 数据任务 | 本地 Node.js／GitHub Actions | 采集与 AI 处理不在页面请求执行 |
| 商业增量 | Worker API＋D1 | 仅 P0.1 开启 |

建议源码目录：`src/layouts`、`src/components`、`src/pages`、`src/lib`、`src/i18n`、`content`、`scripts`、`public`、`tests`、`docs`。P0.1 新增 `worker` 和 `migrations`。固定 package lock 与 Node LTS 版本，版本以安装时官方兼容矩阵为准，避免跟随未锁定的 latest。

### 13.1 构建数据边界

`public/` 仅放可分发静态资源；不能把整个仓库或采集缓存复制到 dist。内容解析从 Schema 生成只含公开字段的 view model。配置、采集脚本和许可证文件如何保留应在 README 说明；不把上游示例的共享 AI 服务地址带进本站。

上线前验收一次断开采集源和 AI Key 的正常构建：有完整内容快照就能生成全站，不实时抓取才能开页面。

### 13.2 运行环境与版本策略

**采用 Node.js 24 LTS＋npm；Windows 11 本地开发与 Cloudflare／GitHub Actions 构建保持一致。** 当前 Astro 文档要求 Node.js 22.12.0 或更高的受支持偶数版本，Node 官方将 24 标为 LTS，因此选择 24 LTS 作为项目基线。[Astro 安装要求](https://docs.astro.build/en/install-and-setup/)、[Node 发布状态](https://nodejs.org/en/about/previous-releases)

Astro、TypeScript、Tailwind、Zod、Wrangler 等在项目初始化时选择相互兼容的稳定版本，安装后提交精确 lockfile，并在 README 记录实际版本。本文不编造尚未安装验证的完整 package.json。正式 CI 统一 `npm ci`，不在每次构建自动更新依赖；Node 的具体补丁版本写入 `.node-version` 和 CI 配置。

采集脚本采用 TypeScript／ESM，通过 `tsx` 运行；避免只支持 Bash 的脚本和 `VAR=value command` 形式，使 Windows PowerShell 用户也能通过 `npm run` 执行。环境变量从受控环境或显式指定的本地 env 文件读取，文件加入 gitignore。

### 13.3 首版依赖清单与选择原因

| 依赖／工具 | 用途 | 本项目实施方式 |
| --- | --- | --- |
| `astro` | 静态路由、页面模板、资源构建 | `output: 'static'`；项目／分类动态路径在构建时枚举 |
| `typescript` | 页面、采集、接口共用类型 | strict 模式；外部 JSON 必须运行时校验 |
| `tailwindcss`＋`@tailwindcss/vite` | 样式与设计令牌 | 使用官方 Vite 集成；主样式统一引入 Tailwind |
| `zod` | 数据结构和配置校验 | 项目、分类、AI 结果、环境配置分别建 Schema |
| `@astrojs/check` | Astro 模板和 TypeScript 检查 | 纳入 `npm run check` |
| `tsx` | 运行 TypeScript 内容任务 | 执行 ingest／translate／validate 等脚本 |
| `wrangler` | Cloudflare 本地预览与部署 | 作为锁定的开发依赖；P0 上传 dist |
| `vitest` | 数据逻辑单元测试 | 去重、状态映射、失败保留、语言映射、赞助时间边界 |
| `@playwright/test` | 关键浏览流程与截图检查 | 目录、筛选、语言切换、无 JS、手机布局、404 |
| `prettier`＋`prettier-plugin-astro` | 文件格式一致 | 格式化 Astro、TS、JSON、CSS 和文档 |

Tailwind 官方对 Astro 的推荐安装路径是 `tailwindcss`＋`@tailwindcss/vite`，不是在网页插入 Tailwind CDN 脚本。[Tailwind Astro 集成](https://tailwindcss.com/docs/installation/framework-guides/astro)

首版图标使用少量本地 SVG／CSS 图形，避免为了几个图标引入大型组件库。字体使用系统栈。所有展示组件采用 `.astro` 模板，需交互的区域用浏览器 TypeScript 增强；首次加载无需下载整套 UI 框架运行时。

### 13.4 页面、状态、搜索与国际化实施

| 模块 | 技术细节 |
| --- | --- |
| 页面生成 | 从已校验 JSON 构建 `getStaticPaths` 数据；英文、中文和静态分页分别枚举；详情主要文本进入 HTML |
| 共享布局 | `BaseLayout` 输出 head、站点导航、语言切换和页脚；title／canonical 等由路由数据传入 |
| 目录组件 | `ProjectRow`／`ProjectCard` 共用 view model；响应式仅调整布局，不复制两份可点击内容 |
| 客户端状态 | 原生 URL／URLSearchParams＋局部内存状态；不增加 Redux、数据库状态或用户账户 |
| 搜索索引 | 构建生成每语言一个有 hash 的 JSON 文件，包含 ID、slug、名称、摘要、标签、状态、时间和 Stars |
| 搜索匹配 | NFKC 规范化、英文小写、去除多余空格；支持名称／标签／摘要子串；名称精确命中优先 |
| 查询策略 | 输入防抖约 150ms；保留最终查询；加载失败可重试；不得把全量 README 填进索引 |
| 国际化 | Astro 路由＋`src/i18n/en.ts`／`zh.ts` 文案字典；同一项目共享 ID 与 slug |
| sitemap | 基于相同发布清单生成静态 XML；只含可索引语言页和分页，正确转义，测试路径完整性 |
| 元数据 | 服务端构建时生成 title、description、Open Graph、canonical、hreflang 和 JSON-LD |
| 复制与邮件 | Clipboard API 配合失败降级；mailto 内容正确编码，并提供完整可复制文本 |

搜索索引使用内容 hash 文件名，在目录页 JS 中引用当前版本；内容页 HTML 用可重新验证缓存，带 hash 的 JS／CSS／索引使用长期 immutable 缓存。避免发布后旧 HTML 读取不兼容的新索引；`schema_version` 必须校验。

### 13.5 采集与生成程序实施

采集与摘要程序运行在 Node.js，使用内置 `fetch`、`AbortController`、`crypto`、`fs` 和 `path`。先使用 GitHub REST API；不为结构化 API 抓取默认启用无头浏览器，不建设常驻爬虫服务器。

| 子模块 | 输入 | 输出 | 关键实现 |
| --- | --- | --- | --- |
| SourceAdapter | 源 URL／commit | Candidate[] | 每个来源独立适配，保存原始字段映射和版本 |
| Normalizer | Candidate[] | 规范化 URL 和来源记录 | 同源去重、仓库重命名跟踪、追踪参数清理 |
| RepositoryEnricher | 仓库链接 | README 摘要输入、LICENSE、Stars 等 | 条件请求、有限并发、超时和限流处理 |
| SummaryProvider | 公开来源文本＋Schema | 结构化英文摘要 | 供应商可替换；输出事实与 source_ref 绑定 |
| TranslationProvider | 英文摘要＋术语表 | 中文字段 | 保留项目名／代码，按 source_hash 缓存 |
| PublicationValidator | 归一化项目＋overrides | 可发布数据／异常队列 | Schema、许可状态、链接、语言完整度 |
| SnapshotWriter | 已校验数据 | Git 内容文件＋差异报告 | 原子写入临时文件后替换；失败不产生半份快照 |

摘要／翻译模型由独立适配器实现，默认只接一种用户选择的供应商；不同时安装多家 SDK。可以用服务端 fetch 调用其官方 HTTP 接口；具体认证、模型名、价格、请求协议在供应商确定后按官方文档落实。项目必须先能用现有快照与 fixture 完成本地开发。

CI 中第三方文本始终是数据；摘要生成不能执行其中的命令或变更工具权限。外部 URL 下载器要有响应大小、重定向和网络目标限制，不允许把采集 Key 转发到项目网站。

### 13.6 商业模块的详细技术栈

| 子模块 | 选择 | 原因／约束 |
| --- | --- | --- |
| API 服务 | Cloudflare Worker 原生 Fetch handler＋TypeScript | 当前只有两个公共接口，使用明确路由分支即可 |
| API 类型 | `wrangler types` 生成环境绑定类型 | 与实际 D1 和 Secrets 配置保持一致 |
| 数据访问 | D1 binding＋参数化 SQL | 四张小表直接维护；不新增远程数据库连接池 |
| Schema 迁移 | 版本化 SQL migrations＋Wrangler | 先测试环境执行，生产执行前备份 |
| 签名 | Worker Web Crypto HMAC | 短期计量 token，密钥仅存在 Secrets |
| 可见性检测 | IntersectionObserver＋Page Visibility API | 落实 50%／1 秒曝光定义 |
| 事件发送 | fetch keepalive／sendBeacon 的受控实现 | 异步、不阻止外链；幂等 ID，有限重试 |
| 排期维护 | 本地／受保护 CI 中的运营 CLI | 最少写入权限，不公开管理接口 |
| 报告导出 | 运营 CLI 查询聚合数据后生成 CSV | SQL 条件有索引，导出需防表格公式注入 |
| 监控 | Cloudflare Worker 日志／D1 指标 | 记录错误类别和请求 ID，不输出密钥或私人请求体 |

P0.1 的 D1 属于商业运行数据；项目内容仍由 Git 保存并静态发布。不要因为加入广告统计就把所有项目迁到数据库或改成 SSR。数据清理与日聚合可用低频 Cron，活动是否展示仍由服务器实时比较起止时间，不依赖 Cron 成功。

### 13.7 脚本命令与 CI 分工

| 命令 | 预期实现 | 在哪里执行 |
| --- | --- | --- |
| `npm run dev` | Astro 本地开发 | Windows／开发机 |
| `npm run ingest` | `tsx scripts/ingest.ts` | 本地或 Actions |
| `npm run enrich` | `tsx scripts/enrich.ts` | 本地或 Actions |
| `npm run translate` | `tsx scripts/translate.ts` | 内容任务，有预算时 |
| `npm run validate:data` | 数据、URL、许可映射、语言完整性校验 | 内容任务＋所有构建 |
| `npm run content:diff` | 与上次快照比较并生成变更摘要 | 内容任务 |
| `npm run check` | Astro／TS 类型检查 | PR 和正式构建 |
| `npm run test` | `vitest run` | 数据／逻辑发生变更的 PR |
| `npm run test:e2e` | `playwright test` | 关键流程变更与发布验收 |
| `npm run build` | Astro 生成 HTML、资源、索引与 sitemap | Cloudflare Builds／本地 |
| `npm run preview` | Astro 预览构建产物 | 本地内容／UI 检查 |
| `npm run preview:cloudflare` | Wrangler 模拟静态资源与可选 API | 路由／缓存／P0.1 验收 |
| `npm run deploy` | Wrangler 发布已构建产物 | Cloudflare／授权部署环境 |
| `npm run sponsor:validate` | 检查活动素材、字段、时段与位置冲突 | P0.1 运营环境 |
| `npm run sponsor:report` | 指定 campaign、时段和 locale 导出 | P0.1 私密运营环境 |

Cloudflare 负责代码合并后的构建与发布；GitHub Actions 负责离线内容采集和相应检查。不要为同一次提交同时启动两套正式部署，避免覆盖和双重消耗。复杂测试主要放 PR，正式部署保留数据／类型／构建必需检查即可。

### 13.8 测试范围与工程验收

单元测试针对会影响数据真实性或业务交付的规则：去重、许可证映射、空源保留、人工 overrides 优先级、译文 hash、分页、排期冲突和统计去重。不为每个颜色、文案标签写镜像测试。

浏览器测试覆盖搜索与筛选、语言切换、复制／邮件入口、错误页、手机布局和无 JS 阅读。P0.1 追加未到期／到期、预览隔离和广告 API 故障降级。UI 对照参考站的风格要求检查，不能因普通代码测试通过就宣布视觉验收完成。[Vitest](https://vitest.dev/guide/)、[Playwright](https://playwright.dev/docs/intro)

在 CI 使用 fixture 测试外部接口错误，正式首次采集做少量真实 API 冒烟检查。测试任务不应反复消耗摘要 API 额度；配置严格允许的测试数据与站点，不能批量运行收录项目的未知代码。

## 14. API 与外部服务清单

| 服务 | P0 是否需要 | 调用位置 | 用途／凭证 |
| --- | --- | --- | --- |
| GitHub 仓库元数据、README、许可证 API | 是 | 采集脚本 | 可读公开仓库的 token 放本地或 Actions Secrets |
| 上游开源目录 JSON | 是 | 采集脚本 | 优先固定 commit；公共数据无需访客凭证 |
| 摘要／翻译模型 | 自动生成时需要 | 内容任务 | 供应商与模型可配置；仅处理允许的公开内容 |
| Cloudflare 部署 | 是 | Git 集成或本地 Wrangler | Git 集成不要求把管理 token 放进前端 |
| Cloudflare Web Analytics | 建议启用 | 浏览器 beacon | 公共站点标识，缺失不影响目录 |
| Jev 推理 API | 否 | 无 | 导航站无需替用户运行 Jev |
| 邮件发送 API | 否 | 无 | P0 用户主动通过自己邮箱发送 |
| 支付 API | 否 | 无 | 人工合作；P1 自助支付才对接 |
| D1 | P0.1 | Worker 绑定／运营脚本 | 排期与事件，不提供浏览器直接连接 |
| Turnstile | P1 表单 | 浏览器＋服务器验证 | 只有启用服务器表单后需要 |

GitHub API 典型查询范围是仓库详情、README、许可证、搜索仓库；使用官方接口和条件请求，搜索结果只作为候选发现。GitHub 搜索的分页、限额与相关性均不能替代真实仓库检查。[搜索 API](https://docs.github.com/en/rest/search/search)、[许可证 API](https://docs.github.com/en/rest/licenses/licenses)

## 15. Cloudflare 部署规格

### 15.1 P0 静态部署

保留 Vercel 作为域名注册商；Cloudflare Free 托管 DNS；部署目标为 **Workers Static Assets**。不将 Cloudflare Pages 的构建额度或配置混用于 Workers。

构建命令约定：`npm ci` 后执行 `npm run validate:data`、`npm run check`、`npm run build`；发布命令为 `npx wrangler deploy`，产物目录 `dist`。在 Git 集成中按工具默认安装步骤配置，避免不必要重复安装。

P0 的 Wrangler 关键配置示例（实施配置，不表示已创建项目）：

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "jev-builds-directory",
  "compatibility_date": "2026-09-20",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

P0 不设置 `main`，不安装用于 SSR 的 Astro Cloudflare adapter，不设置全站 `run_worker_first: true`。Cloudflare 官方说明纯静态 Astro 可直接上传构建资源。[Astro 部署指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)

### 15.2 P0.1 动态路由

商业模块启用时才增加 `main` 与 D1 绑定，`assets.run_worker_first` 仅匹配 `/api/sponsors/*`。其余匹配的静态资源直接分发；未匹配路径返回正确 404。发布前实际测量普通首页／详情没有调用 SSR 或 D1，API 消耗独立可观测。[Worker 静态路由](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)

生产和预览使用分开的 D1 数据库、签名密钥和环境标识；预览不能写入生产报表，也不能显示真实付费活动。

### 15.3 域名接入步骤

1. 先发布到 Cloudflare 测试地址并完成页面冒烟检查。
2. 在 Vercel 确认实际域名拼写与续费状态，备份现有 DNS 记录。
3. Cloudflare 添加该域名，选 Free；检查 MX／TXT 等现有记录；存在 DNSSEC 时按官方迁移流程处理旧 DS。
4. 把 Cloudflare 分配的 Nameservers 填入 Vercel 域名的 Nameservers 设置，不是在普通 DNS 记录中随便增加 NS。
5. 等 Cloudflare zone Active 后，在 Worker 的 Domains & Routes 添加根域名 Custom Domain；Cloudflare 建立对应解析及证书。
6. 配置代理的 www DNS 记录，并用 Redirect Rule 把 www 301 到根域名，保留路径与查询参数。
7. 确认 HTTPS、证书、根域名、www、中文和深层详情链接。`.dev` 正式访问必须有有效 HTTPS。
8. `SITE_URL` 使用正式 HTTPS 根域名，重新生成 canonical／sitemap；测试地址和预览环境避免重复索引。

Vercel 允许已注册域名自定义 Nameservers，传播最长可能约 48 小时；不要求把注册商也转移到 Cloudflare。[Vercel 域名说明](https://vercel.com/docs/domains/managing-nameservers)、[Cloudflare 自定义域名](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

### 15.4 发布与回退

PR 分支先检查；正式分支 main 部署。构建失败保留当前线上版本。内容错误先恢复上一份内容快照；样式／代码错误恢复上一个已知正常 Git 标签并重新部署，Cloudflare 可用的版本回退作为辅助。

`wrangler` 本地发布是 CI 故障时的备用方式，凭证只授予必要账户／项目权限。没有正式域名或邮箱时可先交付预览，不能把占位地址当作可用业务入口发布。

## 16. 成本预算与升级条件

价格与限额核查日期为 2026-09-20，上线时复核官方政策；这些是预算依据，不是永久免费承诺。

| 项目 | 当前依据 | 本项目做法 |
| --- | --- | --- |
| 域名 | Vercel 实际续费价 | 已购买；单独记录年成本，不预填金额 |
| 静态资源请求 | Cloudflare 当前免费、不按请求次数收费 | 浏览目录保持静态，不全站先执行 Worker |
| Workers Builds | Free 每月 3,000 分钟；单次构建最长 20 分钟 | 增量内容按批次发布，避免每条触发一次构建 |
| 动态 Worker | Free 每日 100,000 请求、每次 10ms CPU；账户额度共享 | 仅 P0.1 广告接口使用；合理批量与索引 |
| Workers Paid | 基础 $5/月，超额另计 | 根据实际用量升级，首版不提前购买 |
| D1 | Free 每日 500 万行读、10 万行写、总存储 5GB | 仅商业阶段；行写含索引维护，不能等同事件条数 |
| GitHub Actions | 依仓库类型及账户额度 | 本地脚本可替代；设置预算和超时，不承诺无限免费 |
| AI 摘要／翻译 | 依所选供应商及输入输出量 | 只处理新增变化、缓存结果、预算上限 |
| 图片／视频 | 当前无需单独存储服务 | 小图随静态产物；视频链接作者页面 |
| 支付 | 依最终渠道 | 成交才产生，未选定前不写死费率 |

来源：[静态资源计费](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)、[构建额度](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)、[Workers 定价](https://developers.cloudflare.com/workers/platform/pricing/)、[D1 定价](https://developers.cloudflare.com/d1/platform/pricing/)。

预算示例：若每天构建一次、每次 5 分钟，每月约 150 分钟；这是计划假设，真实耗时从构建记录确认。静态请求量增加不直接等于动态请求量，不能用“访问次数×API 费用”计算静态站成本。

如果赞助 API 接近免费请求／CPU 限制、D1 读写占用持续增长或构建超过额度，先找出重复上报、全表扫描和过度构建，再决定升级。不得把免费账号超限后的请求失败当作已自动付费扩容。

## 17. 非功能需求与可靠性

### 17.1 性能与可用性目标

- 首页内容与前 12 个项目无需 JS 即可阅读；图片懒加载、设置尺寸，避免布局跳动。
- 自有首屏 JS gzip 目标不超过 80KB；每语言搜索索引 gzip 初始目标不超过 250KB，超出时按需分片。
- 以 1,500 个项目、两种语言作为构建与搜索容量测试样本；这不是实际已收录数量。
- 目标在常规移动设备上搜索输入后 200ms 内反馈；大型结果使用分页，避免一次渲染全库。
- 移动端 Lighthouse Performance／Accessibility／SEO 初始目标均不低于 90，保存测试环境与结果；不把实验室分数等同于真实用户指标。
- 内容抓取失败、AI 不可用、商业 API 不可用都不影响已有项目页面浏览。

### 17.2 可访问性

语义标题、表格／列表结构清晰，输入有 label，键盘能完成导航与筛选，焦点样式可见。正文对比至少 4.5:1；图标按钮有文本替代。移动端最小触控区域 44px。使用 reduced-motion，装饰背景不可干扰屏幕阅读器。

### 17.3 数据与链接安全

外部内容仅作为数据；清理 HTML，不执行 README 内脚本。URL 只允许 http／https，实际可点击链接优先 HTTPS；拒绝 javascript 和 data URL。来源变更可能影响许可证和目的地址时重新进入审核。提交 P0 仅生成邮件，不服务器抓取用户 URL。

API Key、供应商 token、付款资料不进入前端、Git 历史或公开日志。客户手工补充信息也不作为 AI 指令执行。图片无法明确授权时使用文字图标，不把依赖热链作为唯一显示方式。

### 17.4 备份和恢复

代码、归一化内容、Schema、手工修正和许可证记录存 Git；保留本地副本。首次全量导入前保存原始来源快照或源 commit；外部数据后来不可取时仍可恢复已发布内容。

P0.1 定期导出 D1，保留最近一个完整报表周期的恢复副本；备份中私人字段不能进入公开产物。运行清理、迁移、批量取消活动前先导出备份。每个阶段至少验证一次恢复到已知正常版本。

## 18. 验收清单

以下为可测的交付条件；不要求为纯装饰微调编写单元测试。

| ID | 场景 | 通过标准 | 阶段 |
| --- | --- | --- | --- |
| AC-01 | 首页与参考风格 | 近黑底、浅粉灰绿主按钮、细边框、紧凑目录；正文不被纹理干扰 | P0 |
| AC-02 | 手机使用 | 375px 宽无整体横向溢出；项目链接和筛选可触达 | P0 |
| AC-03 | 无 JS 浏览 | 首页、目录分页、分类和详情主要内容可读且可跳转 | P0 |
| AC-04 | 搜索筛选 | 名称／用途可搜，AND／OR 规则正确；返回操作恢复状态 | P0 |
| AC-05 | 数据去重 | 同仓库多个帖子只产生一个项目；中英不双计 | P0 |
| AC-06 | 许可分类 | 无 LICENSE 不标开源；Jev-like 不标官方 Jev | P0 |
| AC-07 | 来源失效 | 模拟 429、空数组与结构错误，已发布快照不被清空 | P0 |
| AC-08 | 增量更新 | 仅 Stars 改变不调用翻译；人工 overrides 不被覆盖 | P0 |
| AC-09 | AI 失败 | 无 Key／预算耗尽时已有站可构建，未处理项目保留队列 | P0 |
| AC-10 | 多语言 | 同项目一键切换；缺译不产生虚假中文索引页 | P0 |
| AC-11 | SEO | canonical／hreflang／sitemap 正确；搜索 noindex；缺页真实 404 | P0 |
| AC-12 | 提交与联系 | 打开邮件和复制可用；不显示未真正发送的成功提示 | P0 |
| AC-13 | 自动部署 | 更新正式分支后正确发布；采集服务离线仍能从快照构建 | P0 |
| AC-14 | 域名 | 实际根域名 HTTPS 正常；www 301 保留路径参数；没有拼写错绑 | P0 |
| AC-15 | 初始内容 | 导入所有已核实种子与合格候选；每项有出处；数量从数据生成 | P0 |
| AC-16 | 凭证隔离 | 扫描 dist 与 Git，不包含私密字段或供应商 Key | P0 |
| AC-17 | 排期 | 同 slot 重叠拒绝；未付费不激活；起止边界正确 | P0.1 |
| AC-18 | 广告到期 | 不重新构建也按服务器时间失效；恢复标签页不展示过期广告 | P0.1 |
| AC-19 | 计量 | 曝光达可见阈值才上报，重复 event 不双计，预览不计生产 | P0.1 |
| AC-20 | 商业服务故障 | API／D1 故障不阻止目录和原项目出站；报告注明异常 | P0.1 |
| AC-21 | 数据报告 | CSV 汇总可与采样事件核对，中英合计不声称独立人数 | P0.1 |
| AC-22 | 资源消耗 | 普通 HTML 命中静态资源；动态访问仅指定接口，无全站 SSR | 两阶段 |

初始内容推荐 20–50 个合格项目作为目标区间，但不是必须凑满的发布门槛。源不足就展示实际数量，不引入虚构条目。性能用 synthetic fixture 与生产内容明确分开，fixtures 不上线。

## 19. 开发里程碑与交付物

| 里程碑 | 工作 | 完成条件 |
| --- | --- | --- |
| M1 数据与骨架 | 项目初始化、Schema、已知种子、双语路由、设计令牌 | 可静态构建，真实种子能展示 |
| M2 目录体验 | 首页、列表、搜索、详情、分类、移动端、联系页 | AC-01 至 AC-04、AC-10 至 AC-12 |
| M3 内容流水线 | 来源适配、去重、摘要／翻译、差异、overrides、失败保护 | AC-05 至 AC-09、AC-15 |
| M4 P0 发布 | 元数据、部署、域名、基础分析、运行手册、恢复 | AC-13、AC-14、AC-16、AC-22；可公开浏览 |
| M5 商业启用 | 广告 API、D1、排期、事件、报表、收款操作说明 | AC-17 至 AC-22；可开始售卖展示 |

没有强行承诺开发天数；采集源质量、实际仓库规模和账户接入会影响时间。各阶段完成后记录已验收项与未完成项，不以 UI 演示代替后端或统计验收。

开发交付必须包含：源码、可复现 lockfile、内容 Schema、首批真实数据、采集与翻译脚本、英文／中文界面、部署配置、`.env.example`（只有占位值）、README、运营手册和验收记录。P0.1 追加 migrations、广告配置／导出命令与计量说明。

运营手册至少解释：导入一个 URL、审核一批更新、修正分类或译文、隐藏项目、恢复内容、处理源故障、添加赞助、导出报告和暂停广告。

## 20. 配置项与尚待落实的业务值

缺少业务值不阻止使用示例配置完成本地开发；正式上线时不得把占位内容当作真实可用配置。

| 配置 | 阶段 | 放置位置 | 默认／要求 |
| --- | --- | --- | --- |
| `SITE_URL` | P0 | 构建环境 | 默认 `https://jevtypesafe.dev`（用户 2026-09-22 确认），上线时与 Vercel 控制台核对 |
| `SITE_NAME` | P0 | 公开配置 | Jev Atlas，可更换 |
| `CONTACT_EMAIL` | P0 | 公开配置 | 用户提供真实可收信地址；可以用已有邮箱，无需新购域名邮箱 |
| `PUBLIC_WEB_ANALYTICS_TOKEN` | P0 | 前端允许公开值 | 创建对应站点后配置；缺失时不加载 beacon |
| `SOURCE_REPO`／`SOURCE_REF` | P0 | 采集配置 | 已知开源目录／固定 commit 或受控分支 |
| `GH_READ_TOKEN` | P0 采集 | 本地环境／Actions Secrets | 只给必要权限，不给访客 |
| `SUMMARY_BASE_URL`、`SUMMARY_MODEL`、`SUMMARY_API_KEY` | P0 内容生成 | 任务配置／Secrets | 供应商待选择；禁止在页面请求中调用 |
| `INGEST_BATCH_LIMIT`、`AI_BUDGET_USD` | P0 | 任务配置 | 设置上限；dry-run 可先查看消耗 |
| `CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_API_TOKEN` | 本地／备用发布 | 本地或 CI Secrets | 使用 Git 集成时按实际流程配置，不要求无关 token |
| `COMMERCIAL_MODE` | P0.1 | 构建与 Worker 配置 | P0 为 off；不开 API 不展示活动广告 |
| `DB` | P0.1 | Worker D1 binding | 生产预览分离；不是浏览器数据库 URL |
| `SPONSOR_EVENT_SECRET` | P0.1 | Worker Secrets | 用于短期签名，不公开 |
| 赞助价格、收款渠道、排期、补偿安排 | 首次销售前 | 私密业务记录 | 当前未定，不替用户虚构 |

正式域名拼写、联系邮箱、收款渠道是上线／销售时的配置事项，不要求用户为了写 PRD 先提供密钥。开发者不能自行改成 Next.js／Vercel 托管，也不能为了方便引入未要求的会员订阅。

## 21. 后续扩展触发条件

| 后续功能 | 什么时候再做 |
| --- | --- |
| 站内提交表单 | 邮件提交出现明显流失或重复处理量；采用服务器持久化与反滥用 |
| 自助支付与续投 | 已有重复赞助客户，人工报价／确认开始占用明显时间 |
| 后台 CMS | Git／脚本维护已成为主要障碍 |
| 其他语言 | 对应语言／地区出现可验证访问或客户需求，且有审核能力 |
| 托管付费工具 | 某用途获得持续需求并验证付费意愿，另写工具 PRD |
| 扩大模型范围 | Jev 内容增量或商业买家不足，用户明确决定扩展 |
| MCP／资料包 | 开发者实际需要在 Agent 中查询目录，且数据与许可已整理 |

P1 表单必须服务端验证 Turnstile token；仅前端验证码不构成有效提交保护。[Turnstile 服务端验证](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)

## 22. 关键风险与处理

| 风险 | 实际影响 | 处理方式 |
| --- | --- | --- |
| Jev 热度消退 | 新案例、访问和赞助需求不足 | 30 天复盘；保持固定成本低，不承诺热门即赚钱 |
| 上游条目大量重复／无源码 | 导航数量虚高、开源筛选失真 | repository ID 去重、许可证标识、记录真实计数 |
| AI 摘要错误 | 用户误解功能、成本或依赖 | 出处可追溯、未知留空、异常审核、可覆盖修正 |
| 内容与竞品同质 | 缺少访问理由 | 用开源状态、使用条件、英中摘要和有效链接改善发现效率 |
| 上游源停更／失效 | 更新中断 | 已发布快照独立保存，GitHub 与用户提交作为补充 |
| 静态广告过期 | 违背排期 | 收费前启用服务器时间控制，不依赖每日构建 |
| 广告统计被刷／漏记 | 报告失真 | 去重、基础过滤、明确可观测口径，不承诺独立审计 |
| 域名拼写与官方混淆 | 用户找错站或误认为官方 | 使用真实已购域名，显著独立站声明与官方链接 |
| 私人资料误入静态文件 | 信息暴露 | 公开字段白名单，联系方式／账务隔离，产物检查 |

## 23. 来源与事实边界

本 PRD 的功能、范围、默认值、验收阈值和交付阶段是针对用户需求的产品设计，不是外部资料事实。2026-09-20 浏览了参考站的实际 UI；其他仓库与服务按公开文档核查，未实际部署网站、未逐一运行所收录项目、未完成全库许可证审计。

主要依据：

1. [Open App Scout](https://openappscout.com/) 与其[公开源码](https://github.com/tortuvshin/open-apps)：布局结构、信息密度和许可证研究；不复制品牌、内容和项目数据。
2. [Jev 官方说明](https://docs.typesafe.ai/introduction)：结构化决策模型背景；本站不提供官方 API。
3. [开源目录仓库](https://github.com/everyai-com/jev-directory) 与 [MIT 许可证](https://github.com/everyai-com/jev-directory/blob/main/LICENSE)：候选内容与复用边界。
4. [Astro Cloudflare 部署](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)：纯静态部署路径。
5. [Workers Static Assets 计费](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) 与 [路由行为](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)：静态与动态请求边界。
6. [Workers Builds 额度](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)、[Workers 定价](https://developers.cloudflare.com/workers/platform/pricing/)、[D1 定价](https://developers.cloudflare.com/d1/platform/pricing/)：成本预算。
7. [Vercel Nameservers](https://vercel.com/docs/domains/managing-nameservers) 与 [Cloudflare 自定义域名](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)：域名接入。
8. [GitHub 搜索](https://docs.github.com/en/rest/search/search)、[许可证](https://docs.github.com/en/rest/licenses/licenses)、[Actions 触发行为](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)：采集和更新机制。
9. [Astro i18n](https://docs.astro.build/en/guides/internationalization/) 与 [Web Analytics](https://developers.cloudflare.com/web-analytics/about/)：语言路由与基础分析。

### 给 Codex 的执行约束

按 M1–M4 完成 P0，再按 M5 实施首次收费所需功能。使用真实、有出处的项目数据；样例数据与生产数据分离。缺少部署凭证或业务配置时继续完成可本地验证的工程，并准确列出仅剩的配置项。不得伪造收录量、赞助商、支付成功、提交成功或实测结果；不得把默认价格或未验证的流量设想写成既定商业事实。
