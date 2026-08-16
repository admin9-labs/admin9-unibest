# Admin9 Unibest

Admin9 的会员端脚手架，基于 Vue 3、TypeScript、uni-app 和 Wot UI v2，当前交付目标为 H5 与微信小程序。项目提供账号密码登录、Bearer 会话、单飞刷新、会员资料、修改密码与退出登录。

## 环境

- Node.js 22、pnpm 10，具体约束以 `package.json` 为准
- Laravel API 仓库默认位于同级目录 `../xichang-travel-api`

使用冻结锁文件安装依赖：

```bash
pnpm install --frozen-lockfile
```

## 本地开发

```bash
pnpm dev:h5
pnpm dev:mp
```

H5 默认仅监听本机并运行在 [http://localhost:9000/](http://localhost:9000/)。开发模式下 `/api` 默认代理到当前公开 API 主机 `http://travel.wifixc.test`，对应 API Base URL 为 `http://travel.wifixc.test/api`；代理 target 不应包含 `/api`，因为客户端请求路径已经包含该前缀。需要其他环境时，在忽略的 `env/.env.development.local` 中设置 `VITE_APP_PROXY_TARGET`，或在启动命令前设置同名环境变量。跨设备调试必须显式使用 `VITE_APP_HOST=0.0.0.0 pnpm dev:h5`；微信开发者工具导入目录为 `dist/dev/mp-weixin`。

`env/.env` 中的 `https://api.example.com` 是公开仓库的安全占位值，不是可用生产地址。微信开发版、体验版和正式版应分别通过 `VITE_SERVER_BASEURL__WEIXIN_DEVELOP`、`VITE_SERVER_BASEURL__WEIXIN_TRIAL`、`VITE_SERVER_BASEURL__WEIXIN_RELEASE` 配置已备案 HTTPS 请求域名。不要把凭据或秘密放入任何客户端可见的 `VITE_*` 变量。

## Member API

请求链路保持单向：

```text
page/store -> src/api/member.ts -> generated src/service
           -> src/http/openapi-request.ts -> src/http/http.ts -> uni.request
```

`src/service` 由 Laravel OpenAPI 文档生成，不得手工编辑。默认 schema 是 `../admin9-api-laravel/docs/api.json`；其他布局可设置 `OPENAPI_SCHEMA_PATH`。

```bash
pnpm openapi
pnpm openapi:check
```

账号开通、注册和凭据分发属于后端或授权运营流程，不由此客户端实现。

## 验证

```bash
pnpm type-check
pnpm lint
pnpm test:run
pnpm openapi:check
pnpm wot:check
pnpm build:h5
SKIP_OPEN_DEVTOOLS=true pnpm build:mp
```

`pnpm wot:check` 当前可能报告 `wd-form-item` 与 `wd-cell-group` 的已知静态识别误报；组件来自已安装的 Wot UI 包，类型检查与平台构建是交付门禁。

## License

[MIT](./LICENSE)

本项目基于 unibest 脚手架演进，保留其适用的开源许可与依赖声明。
