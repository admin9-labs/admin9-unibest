<script lang="ts" setup>
import type { Article } from '@/api/articles'
import { ref } from 'vue'
import { getArticles } from '@/api/articles'

defineOptions({ name: 'ArticleList' })
definePage({ style: { navigationBarTitleText: '攻略资讯' } })
const categories = [{ code: '', name: '全部' }, { code: 'guide', name: '攻略' }, { code: 'news', name: '资讯' }, { code: 'notice', name: '通知' }]
const category = ref('')
const keyword = ref('')
const articles = ref<Article[]>([])
const loading = ref(true)
const failed = ref(false)
async function load() {
  loading.value = true
  failed.value = false
  try {
    articles.value = await getArticles(keyword.value.trim(), category.value)
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}
function selectCategory(code: string) {
  category.value = code
  load()
}
function openDetail(code: string) {
  uni.navigateTo({ url: `/pages/articles/detail?code=${encodeURIComponent(code)}` })
}
onLoad(load)
</script>

<template>
  <view class="page">
    <view class="intro">
      <text class="eyebrow">STORIES</text><view class="title">
        读懂西昌，再出发
      </view><view class="description">
        浏览已发布的攻略、资讯与通知。
      </view>
    </view>
    <view class="categories">
      <wd-tag v-for="item in categories" :key="item.code" :type="category === item.code ? 'primary' : 'default'" clickable @click="selectCategory(item.code)">
        {{ item.name }}
      </wd-tag>
    </view>
    <wd-search v-model="keyword" placeholder="搜索本栏目文章" hide-cancel maxlength="120" @search="load" @clear="load" />
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
    <view v-else-if="articles.length === 0" class="state">
      <wd-empty tip="暂无符合条件的文章" />
    </view>
    <view v-else class="article-list">
      <view v-for="article in articles" :key="article.code" class="article" role="link" @click="openDetail(article.code)">
        <wd-img v-if="article.cover?.url" :src="article.cover.url" width="180rpx" height="160rpx" mode="aspectFill" radius="8" /><view class="article-copy">
          <view class="article-meta">
            {{ article.category?.name || '文章' }}
          </view><view class="article-title">
            {{ article.title }}
          </view><view v-if="article.summary" class="article-summary">
            {{ article.summary }}
          </view>
        </view><wd-icon name="arrow-right" size="18" color="#69716c" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 28rpx;
  background: #f4f6f3;
  box-sizing: border-box;
}
.intro {
  padding: 28rpx 4rpx 28rpx;
}
.eyebrow {
  color: #34765b;
  font-size: 21rpx;
  font-weight: 600;
}
.title {
  margin-top: 10rpx;
  color: #17211c;
  font-size: 44rpx;
  font-weight: 700;
}
.description {
  margin-top: 12rpx;
  color: #69716c;
  font-size: 26rpx;
}
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 22rpx;
}
.state {
  display: flex;
  min-height: 500rpx;
  align-items: center;
  justify-content: center;
}
.article-list {
  margin-top: 24rpx;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dfe5e0;
  border-radius: 8px;
}
.article {
  display: flex;
  align-items: center;
  gap: 20rpx;
  min-height: 180rpx;
  padding: 24rpx;
  box-sizing: border-box;
}
.article + .article {
  border-top: 1px solid #edf0ed;
}
.article-copy {
  flex: 1;
  min-width: 0;
}
.article-meta {
  color: #34765b;
  font-size: 22rpx;
}
.article-title {
  margin-top: 7rpx;
  color: #17211c;
  font-size: 29rpx;
  font-weight: 600;
  line-height: 1.4;
}
.article-summary {
  display: -webkit-box;
  margin-top: 8rpx;
  overflow: hidden;
  color: #69716c;
  font-size: 24rpx;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
