
## 项目说明

**背景**
过年时，当顾客去表哥理发店理发时，
面临理发店小，放不下太多人，店长记不住顾客顺序的问题，
想要让顾客可以远程查看当前排队情况，进行排队，快到自己时系统提醒，自己不至于手忙脚乱，
以让自己心理平稳放松和顾客觉得理发店很现代、专业。

**痛点**
目前的解决方案存在线下排队，店长手忙脚乱，顾客等待着急，
原因是现在只有一个取号机，没有线上记录，顾客取号后，只能给个预估取号时间让顾客先回去。

**需求**
请帮我开发一个微信小程序和Workers后端，要求：
1. 核心功能：APP或者微信小程序线上排队
2. 用户体验：快到顾客时微信提醒
3. 技术选择：cloudflare Workers免费服务、免费的微信小程序/公众号

**自身**
我是一个程序员，可以看懂基本代码

## 技术栈

* cloudflare：Workers、Workers KV
* 原生小程序（微信开发者工具）
* typescript

## Workers

目录：`jc-workers/`
后端 API 已实现：server/index.ts
已实现这些接口（都在 /api/* 下，带 CORS，方便小程序/前端调用）：

* GET /api/health
* POST /api/join?queueId=default body: { "userId": "...", "nickname": "..." }
* POST /api/cancel?queueId=default body: { "userId": "..." }
* GET /api/status?queueId=default&userId=...
* GET /api/list?queueId=default
* POST /api/next?queueId=default（叫下一个号：把第一个 waiting 标记成 called）

KV 存储 key 设计：

* queue:${queueId}:items 存整个队列数组
* queue:${queueId}:user:${userId} 用户的“入队票据”（用来防重复入队）
* queue:${queueId}:active 等待人数缓存（当前代码写了，但还没单独提供读取接口）

## 小程序（原生）

目录：`miniapp/`

### 启动

打开微信开发者工具

用“导入项目”打开 `miniapp/` 目录（`project.config.json` 已生成）。

### 配置后端地址

默认后端地址在 `miniapp/app.js`：

`apiBaseUrl: "http://localhost:5173"`

如果你部署到线上 Workers，需要把它改成你的线上域名（例如 `https://xxx.workers.dev`）。

### 页面

* `pages/index/index`：用户排队（join/status/cancel）
* `pages/admin/admin`：店家叫号（list/next）