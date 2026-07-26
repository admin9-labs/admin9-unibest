# 登录页
需要输入会员邮箱或手机号及密码的登录页。

## 适用性

本项目在 H5 和微信小程序中使用同一套会员账号密码登录。`src/router/config.ts` 中的 `LOGIN_PAGE_ENABLE_IN_MP` 已启用，因此小程序也会进入登录拦截流程。

更多信息请看 `src/router` 文件夹的内容。

## 登录跳转

登录跳转逻辑位于 `src/router/interceptor.ts` 和 `src/pages/auth/login.vue`。登录成功后优先消费 `redirect` 来源地址；tabbar 页面使用 `switchTab`，其他页面使用 `reLaunch`。

如果与您的业务不符，您可以自行修改。
