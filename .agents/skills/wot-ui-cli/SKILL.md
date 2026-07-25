---
name: wot-ui-cli
description: '回答和使用 admin9-unibest 项目内 @wot-ui/cli scripts 时使用。关键词：pnpm wot、CLI、MCP、doctor、usage、lint、list、info、demo、doc、token、changelog。适用于组件知识查询、项目分析与可选 MCP 接入。'
argument-hint: '命令名、参数、组件查询、项目检查或 MCP 场景'
---

# Wot UI CLI Skill

这个 skill 用于通过 admin9-unibest 已定义的 pnpm scripts 使用 `@wot-ui/cli`，避免依赖系统级可执行文件或误用上游 CLI 源码仓库的维护流程。

## 适用场景

- 通过项目本地 CLI 查询组件、demo、完整文档、主题变量或 changelog。
- 检查当前项目的 wot-ui 依赖、组件使用情况和 lint 问题。
- 在确有需要时通过项目 script 启动 MCP stdio server。
- 用户从 CLI 查询进入组件代码问题时，转用 `wot-ui-v2` skill 完成组件选型和实现。

## 推荐流程

1. 确认任务是查询组件知识、分析当前项目，还是可选的 MCP 接入。
2. 组件查询遵循 `list` -> `info` -> `demo` -> `doc` -> `token`。
3. 项目修改后依次运行 doctor、usage 和 lint，或运行聚合检查。
4. 只使用本项目 `package.json` 已定义的 scripts；依赖缺失时不要阻塞其他 Codex 工作。

## 组件知识查询

- `pnpm wot list`
- `pnpm wot info <Component>`
- `pnpm wot demo <Component> [name]`
- `pnpm wot doc <Component>`
- `pnpm wot token [Component]`
- `pnpm wot changelog [version] [component]`

多数查询命令支持 `--format text`、`--format json` 和 `--version v2`；不要臆造 CLI 未声明的参数。

## 项目分析

- `pnpm wot:doctor`
- `pnpm wot:usage`
- `pnpm wot:lint`
- `pnpm wot:check` 聚合运行前三项。

## MCP

- 仅在确实需要 MCP 客户端接入时运行 `pnpm wot:mcp`。
- MCP 使用 stdio；终端没有交互输出通常是正常现象。
- MCP 不是本应用启动、构建或 Codex 修改代码的前置条件。

## 项目边界

- 不要依赖系统级安装的 CLI；所有调用均通过上述项目 scripts。
- 本项目不是上游 CLI 源码仓库，不运行其数据提取、源码入口调试、构建产物调试或发布流程。
- 不把上游仓库的目录结构、维护命令或整份文档规则复制进本项目。
- 当本地 CLI 或 MCP 依赖不可用时，继续依据项目代码和本 skill 的参考知识工作，并明确标记未运行的检查。

## 参考资料

- [Wot UI CLI 概览](./references/overview.md)
