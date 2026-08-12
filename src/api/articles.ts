import type { PublishedContentResource } from '@/service/types'
import { publicArticlesArticleUsingGet, publicArticlesUsingGet } from '@/service/article'

export type Article = PublishedContentResource

export async function getArticles(keyword = '', categoryCode = '') {
  const response = await publicArticlesUsingGet({ params: { keyword: keyword || undefined, category_code: categoryCode || undefined, page_size: 50 }, options: { auth: 'public', hideErrorToast: true } })
  return response.data as Article[]
}

export async function getArticle(code: string) {
  const response = await publicArticlesArticleUsingGet({ params: { article: code }, options: { auth: 'public', hideErrorToast: true } })
  return response.data.article as Article
}
