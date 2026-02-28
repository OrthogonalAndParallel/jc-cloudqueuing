# jc-workers

该模板可以帮助你开始使用 Vite 进行 Vue 3 开发。

## 推荐的 IDE 设置

[VS Code](https://code.visualstudio.com/) + [Vue（官方扩展）](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（并禁用 Vetur）。

## 推荐的浏览器设置

- 基于 Chromium 的浏览器（Chrome、Edge、Brave 等）：
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [在 Chrome DevTools 中启用自定义对象格式化器](http://bit.ly/object-formatters)
- Firefox：
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [在 Firefox DevTools 中启用自定义对象格式化器](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## 对 `.vue` 文件导入的 TypeScript 支持

默认情况下，TypeScript 无法处理 `.vue` 导入的类型信息，因此我们使用 `vue-tsc` 替代 `tsc` 命令行工具进行类型检查。在编辑器中，我们需要安装 [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 插件来使 TypeScript 语言服务识别 `.vue` 文件的类型。

## 配置定制

详见 [Vite 配置参考](https://vite.dev/config/)。

## 项目设置

```sh
npm install
```

### 开发环境编译和热重载

```sh
npm run dev
```

### 生产环境类型检查、编译和压缩

```sh
npm run build
```

## Workers KV namespace 配置

1. 创建 KV namespace

```bash
npx wrangler kv namespace create QUEUE_KV
```

2. 把输出的 id 填到：

* jc-workers/wrangler.jsonc 里的 kv_namespaces[0].id
（如果你还想本地 wrangler dev 时使用单独的 preview namespace，可以再创建一个 preview id；这一步可选。）


## 本地调试接口（Workers 已启动的前提下）


### 1) 先测健康检查
```bash
curl -s http://localhost:5173/api/health | jq
```

没有 `jq` 也可以：
```bash
curl -s http://localhost:5173/api/health
```

预期返回类似：
```json
{ "ok": true, "now": 1234567890 }
```

---

### 2) 加入排队（join）
```bash
curl -s -X POST "http://localhost:5173/api/join?queueId=default" \
  -H "content-type: application/json" \
  -d '{"userId":"u1","nickname":"张三"}'
```

再用另一个用户：
```bash
curl -s -X POST "http://localhost:5173/api/join?queueId=default" \
  -H "content-type: application/json" \
  -d '{"userId":"u2","nickname":"李四"}'
```

---

### 3) 查我的位置（status）
```bash
curl -s "http://localhost:5173/api/status?queueId=default&userId=u1"
```

预期：
- **`position`**：第几个（1/2/3…），如果不在队列里会是 `null`（小程序里显示“未排队”）
- **`waitingCount`**：当前等待人数

---

### 4) 查看队列详情（list，店家端常用）
```bash
curl -s "http://localhost:5173/api/list?queueId=default"
```

会返回完整 items（含 `waiting/called/canceled`）。

---

### 5) 店家叫号（next）
```bash
curl -s -X POST "http://localhost:5173/api/next?queueId=default" \
  -H "content-type: application/json" \
  -d '{}'
```

预期：
- 返回 [next](cci:1://file:///Users/jinchen/Documents/github/jc-cloudqueuing%20/miniapp/utils/api.js:34:0-40:1) 为被叫到的那个人（并把其 [status](cci:1://file:///Users/jinchen/Documents/github/jc-cloudqueuing%20/miniapp/utils/api.js:22:0-26:1) 变为 `called`）
- 同时该用户的 [userKey](cci:1://file:///Users/jinchen/Documents/github/jc-cloudqueuing%20/jc-workers/server/index.ts:37:2-37:79) 会被删掉（所以他再查 [status](cci:1://file:///Users/jinchen/Documents/github/jc-cloudqueuing%20/miniapp/utils/api.js:22:0-26:1) 会显示不在 waiting 里）

---

### 6) 取消排队（cancel）
```bash
curl -s -X POST "http://localhost:5173/api/cancel?queueId=default" \
  -H "content-type: application/json" \
  -d '{"userId":"u2"}'
```
