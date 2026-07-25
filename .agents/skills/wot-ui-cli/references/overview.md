# Wot UI CLI Overview

本文件说明 admin9-unibest 如何通过项目内 scripts 使用 `@wot-ui/cli`。它只覆盖当前应用需要的组件知识查询、项目分析与可选 MCP 接入，不包含上游 CLI 源码仓库的维护流程。

## Package Identity

- 工具包：`@wot-ui/cli`
- 调用入口：当前项目 `package.json` 中的 pnpm scripts。
- 使用边界：不依赖系统级 CLI，不运行上游仓库维护命令。

## Component Knowledge

- `pnpm wot list`：列出可用组件。
- `pnpm wot info <Component>`：查看 props、events、slots、CSS 变量。
- `pnpm wot demo <Component> [name]`：查看 demo 列表或指定 demo 源码。
- `pnpm wot doc <Component>`：输出组件 markdown 文档。
- `pnpm wot token [Component]`：查看组件 CSS 变量与默认值。
- `pnpm wot changelog [version] [component]`：查看版本更新记录。

推荐查询顺序：

1. `pnpm wot list`
2. `pnpm wot info Button`
3. `pnpm wot demo Button basic`
4. `pnpm wot doc Button`
5. `pnpm wot token Button`

多数查询命令支持：

- `--format text`
- `--format json`
- `--version v2`

## Project Analysis

- `pnpm wot:doctor`：检查当前项目依赖、运行环境与基础集成情况。
- `pnpm wot:usage`：统计当前项目 `.vue` 文件中的 `wd-*` 使用情况。
- `pnpm wot:lint`：检查未知组件、空按钮等规则。
- `pnpm wot:check`：聚合运行 doctor、usage 和 lint。

项目修改后应运行前三项，或使用聚合命令。

## MCP Server

- 需要 MCP 客户端接入时，从项目根目录运行 `pnpm wot:mcp`。
- MCP 走 stdio，终端没有交互输出通常是正常现象。
- MCP 是可选工具，不是启动、构建或修改本应用的前置条件。
- MCP 或本地 CLI 依赖缺失时，不应阻塞 Codex 继续依据代码和本地参考完成工作。

## Project Boundary

- 只使用当前项目 `package.json` 暴露的 scripts。
- 不建议系统级安装或直接调用 CLI 可执行文件。
- 不运行上游 CLI 仓库的数据提取、源码调试、构建产物调试、测试或发布命令。
- 不引用上游 CLI 仓库的内部目录作为本项目路径。
- 不复制整份上游组件文档、Cursor 规则或 Trae 规则。

## Agent Guidance

- 命令问题按“项目 script + 示例参数 + 输出用途”回答。
- 组件本身的 API、页面实现和主题问题应切换到 `wot-ui-v2` skill。
- 不要混淆 `@wot-ui/cli` 工具包与 `@wot-ui/ui` 组件库 API。
