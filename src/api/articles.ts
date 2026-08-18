import type { PublishedContentResource } from '@/service/types'
import { publicArticlesArticleUsingGet, publicArticlesUsingGet } from '@/service/article'

export type Article = PublishedContentResource

export async function getArticles(keyword = '', categoryId?: number) {
  const response = await publicArticlesUsingGet({ params: { keyword: keyword || undefined, category_id: categoryId, page_size: 50 }, options: { auth: 'public', hideErrorToast: true } })
  return response.data as Article[]
}

export async function getArticle(id: number) {
  const response = await publicArticlesArticleUsingGet({ params: { article: id }, options: { auth: 'public', hideErrorToast: true } })
  return response.data.article as Article
}
