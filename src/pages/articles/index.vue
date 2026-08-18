<script lang="ts" setup>
import type { Article } from '@/api/articles'
import { computed, ref } from 'vue'
import { getArticles } from '@/api/articles'
import PublicContentCard from '@/components/PublicContentCard.vue'

defineOptions({ name: 'ArticleList' })
definePage({ style: { navigationBarTitleText: '攻略资讯' } })
const selectedCategoryId = ref<number | null>(null)
const keyword = ref('')
const articles = ref<Article[]>([])
const loading = ref(true)
const failed = ref(false)
const categories = computed(() => Array.from(new Map(articles.value.flatMap(article => article.category ? [[article.category.id, article.category] as const] : [])).values()))
const visibleArticles = computed(() => selectedCategoryId.value === null
  ? articles.value
  : articles.value.filter(article => article.category?.id === selectedCategoryId.value))
async function load() {
  loading.value = true
  failed.value = false
  try {
    articles.value = await getArticles(keyword.value.trim())
    if (selectedCategoryId.value !== null && !articles.value.some(article => article.category?.id === selectedCategoryId.value))
      selectedCategoryId.value = null
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}
function selectCategory(id: number | null) {
  selectedCategoryId.value = id
}
function openDetail(id: number) {
  uni.navigateTo({ url: `/pages/articles/detail?id=${id}` })
}
onLoad(load)
</script>

<template>
  <view class="page">
    <view class="page-shell">
      <scroll-view class="categories" scroll-x>
        <view class="category-row">
          <wd-tag
            :type="selectedCategoryId === null ? 'primary' : 'default'"
            :variant="selectedCategoryId === null ? 'dark' : 'plain'"
            size="large"
            @click="selectCategory(null)"
          >
            全部
          </wd-tag>
          <wd-tag
            v-for="item in categories"
            :key="item.id"
            :type="selectedCategoryId === item.id ? 'primary' : 'default'"
            :variant="selectedCategoryId === item.id ? 'dark' : 'plain'"
            size="large"
            @click="selectCategory(item.id)"
          >
            {{ item.name }}
          </wd-tag>
        </view>
      </scroll-view>
      <view class="search-wrap">
        <wd-search v-model="keyword" placeholder="搜索本栏目文章" hide-cancel :maxlength="120" @search="load" @clear="load" />
      </view>
      <view v-if="loading" class="state">
        <wd-loading text="正在加载文章" />
      </view>
      <view v-else-if="failed" class="state">
        <wd-empty icon="network" tip="文章暂时无法加载">
          <template #bottom>
            <wd-button size="small" @click="load">
              重新加载
            </wd-button>
          </template>
        </wd-empty>
      </view>
      <view v-else-if="visibleArticles.length === 0" class="state">
        <wd-empty tip="暂无符合条件的文章" />
      </view>
      <view v-else class="article-list">
        <PublicContentCard
          v-for="article in visibleArticles"
          :key="article.id"
          class="article"
          :title="article.title"
          :summary="article.summary"
          :image-url="article.cover?.url"
          layout="vertical"
          @click="openDetail(article.id)"
        >
          <template v-if="article.category" #eyebrow>
            {{ article.category.name }}
          </template>
        </PublicContentCard>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--lx-color-surface-muted);
}

.page-shell {
  width: 100%;
  max-width: 520px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 20rpx 24rpx calc(40rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.categories {
  width: 100%;
  margin-bottom: 20rpx;
  white-space: nowrap;
}

.category-row {
  display: inline-flex;
  gap: 14rpx;
  padding: 2rpx 2rpx 4rpx;
}

.search-wrap {
  overflow: hidden;
  border: 1px solid var(--lx-color-border);
  border-radius: var(--lx-radius-card);
}

.state {
  display: flex;
  min-height: 500rpx;
  align-items: center;
  justify-content: center;
}
.article-list {
  display: grid;
  gap: 20rpx;
  margin-top: 24rpx;
}
</style>
