# 分页滚动 Hook

`useScroll` 管理列表、页码、加载、完成和错误状态。它接收一个对象，`fetchData` 必须按页返回数组；组件挂载时会自动加载第一页。

```ts
import { useScroll } from '@/hooks/useScroll'

interface MemberItem {
  id: number
  name: string
}

async function fetchData(page: number, pageSize: number): Promise<MemberItem[]> {
  // 在业务模块中调用对应的 API adapter，并返回当前页列表。
  return loadMemberPage({ page, pageSize })
}

const { list, loading, finished, error, refresh, loadMore } = useScroll({
  fetchData,
  pageSize: 20,
})
```

页面下拉刷新时调用 `refresh`，列表或 `scroll-view` 到底时调用 `loadMore`。当前会员 API 没有分页端点，上例中的 `loadMemberPage` 由后续业务模块实现，不属于生成服务。
