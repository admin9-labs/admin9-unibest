<script lang="ts" setup>
import type { Article } from '@/api/articles'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import { getArticle } from '@/api/articles'
import PublicDetailCover from '@/components/PublicDetailCover.vue'

defineOptions({ name: 'ArticleDetail' })
definePage({ style: { navigationBarTitleText: '文章详情' } })
const id = ref<number | null>(null)
const article = ref<Article | null>(null)
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)
async function load() {
  if (id.value === null) {
    loading.value = false
    notFound.value = true
    return
  }
  loading.value = true
  failed.value = false
  try {
    article.value = await getArticle(id.value)
  }
  catch (error) {
    notFound.value = (error as HttpError).statusCode === 404
    failed.value = !notFound.value
  }
  finally {
    loading.value = false
  }
}
function returnToList() {
  uni.redirectTo({ url: '/pages/articles/index' })
}
function openRelation(relation: NonNullable<Article['relations']>[number]) {
  const paths = { attraction: 'attractions', scenic_spot: 'scenic-spots', travel_route: 'travel-routes', restaurant: 'restaurants', accommodation: 'accommodations' }
  uni.navigateTo({ url: `/pages/${paths[relation.relation_type]}/detail?id=${relation.target.id}` })
}
onLoad((query) => {
  const value = Number(query?.id)
  id.value = Number.isInteger(value) && value > 0 ? value : null
  load()
})
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state">
      <wd-loading text="正在加载文章" />
    </view>
    <view v-else-if="notFound" class="state">
      <wd-empty tip="该文章不存在或已停止展示">
        <template #bottom>
          <wd-button size="small" @click="returnToList">
            返回文章列表
          </wd-button>
        </template>
      </wd-empty>
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
    <article v-else-if="article" class="content">
      <text v-if="article.category" class="category">{{ article.category.name }}</text>
      <view class="title">
        {{ article.title }}
      </view><view v-if="article.subtitle" class="subtitle">
        {{ article.subtitle }}
      </view>
      <view v-if="article.author || article.source" class="byline">
        <text v-if="article.author">{{ article.author }}</text><text v-if="article.source">{{ article.source }}</text>
      </view>
      <view v-if="article.cover?.url" class="cover-wrap">
        <PublicDetailCover :src="article.cover.url" height="380rpx" />
      </view>
      <rich-text class="rich-content" :nodes="article.content" />
      <view v-if="article.relations?.length" class="related">
        <view class="section-title">
          相关内容
        </view><view class="related-list">
          <view v-for="relation in article.relations" :key="`${relation.relation_type}-${relation.target.id}`" class="related-item" role="link" @click="openRelation(relation)">
            <text>{{ relation.target.name }}</text><wd-icon name="arrow-right" size="18" color="var(--lx-color-text-tertiary)" />
          </view>
        </view>
      </view>
    </article>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--lx-color-surface-muted);
}
.state {
  display: flex;
  min-height: 78vh;
  align-items: center;
  justify-content: center;
  padding: 28rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
}
.content {
  display: block;
  width: 100%;
  max-width: 960rpx;
  margin: 0 auto;
  padding: 44rpx 28rpx calc(80rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.category {
  display: block;
  color: var(--lx-color-text-tertiary);
  font-size: 23rpx;
}
.title {
  margin-top: 18rpx;
  color: var(--lx-color-text-main);
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}
.subtitle {
  margin-top: 14rpx;
  color: var(--lx-color-text-secondary);
  font-size: 28rpx;
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.byline {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 22rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 23rpx;
}
.byline text + text::before {
  margin-right: 20rpx;
  color: var(--lx-color-border);
  content: '|';
}
.cover-wrap {
  margin-top: 30rpx;
  overflow: hidden;
  border-radius: var(--lx-radius-card);
}
.rich-content {
  display: block;
  margin-top: 32rpx;
  color: var(--lx-color-text-main);
  font-size: 29rpx;
  line-height: 1.9;
  overflow-wrap: anywhere;
}
:global(.rich-content img) {
  display: block;
  width: auto !important;
  max-width: 100% !important;
  height: auto !important;
  margin: 24rpx auto;
  border-radius: 8px;
}
.related {
  margin-top: 48rpx;
}
.section-title {
  color: var(--lx-color-text-main);
  font-size: 31rpx;
  font-weight: 650;
}
.related-list {
  margin-top: 18rpx;
  overflow: hidden;
  background: var(--lx-color-surface);
  border: 1px solid var(--lx-color-border);
  border-radius: var(--lx-radius-card);
  box-shadow: var(--lx-shadow-card);
}
.related-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  min-height: 92rpx;
  padding: 0 24rpx;
  color: var(--lx-color-text-main);
  font-size: 27rpx;
}
.related-item + .related-item {
  border-top: 1px solid var(--lx-color-border);
}
.related-item text {
  min-width: 0;
  flex: 1;
  overflow-wrap: anywhere;
}
</style>
