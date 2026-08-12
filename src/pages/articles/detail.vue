<script lang="ts" setup>
import type { Article } from '@/api/articles'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import { getArticle } from '@/api/articles'

defineOptions({ name: 'ArticleDetail' })
definePage({ style: { navigationBarTitleText: '文章详情' } })
const code = ref('')
const article = ref<Article | null>(null)
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)
async function load() {
  if (!code.value) {
    loading.value = false
    notFound.value = true
    return
  }
  loading.value = true
  failed.value = false
  try {
    article.value = await getArticle(code.value)
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
  uni.navigateTo({ url: `/pages/${paths[relation.relation_type]}/detail?code=${encodeURIComponent(relation.target.code)}` })
}
onLoad((query) => {
  code.value = typeof query?.code === 'string' ? decodeURIComponent(query.code) : ''
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
      <text class="category">{{ article.category?.name || '文章' }}</text><view class="title">
        {{ article.title }}
      </view><view v-if="article.subtitle" class="subtitle">
        {{ article.subtitle }}
      </view>
      <view class="byline">
        <text v-if="article.author">{{ article.author }}</text><text v-if="article.source">{{ article.source }}</text>
      </view>
      <wd-img v-if="article.cover?.url" :src="article.cover.url" width="100%" height="380rpx" mode="aspectFill" radius="8" enable-preview />
      <rich-text class="rich-content" :nodes="article.content" />
      <view v-if="article.relations?.length" class="related">
        <view class="section-title">
          相关内容
        </view><view v-for="relation in article.relations" :key="`${relation.relation_type}-${relation.target.code}`" class="related-item" role="link" @click="openRelation(relation)">
          <text>{{ relation.target.name }}</text><wd-icon name="arrow-right" size="18" />
        </view>
      </view>
    </article>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f4f6f3;
}
.state {
  display: flex;
  min-height: 78vh;
  align-items: center;
  justify-content: center;
  padding: 28rpx;
}
.content {
  display: block;
  padding: 52rpx 28rpx 80rpx;
}
.category {
  color: #34765b;
  font-size: 23rpx;
  font-weight: 600;
}
.title {
  margin-top: 14rpx;
  color: #17211c;
  font-size: 46rpx;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}
.subtitle {
  margin-top: 14rpx;
  color: #59635e;
  font-size: 28rpx;
}
.byline {
  display: flex;
  gap: 20rpx;
  margin: 22rpx 0 30rpx;
  color: #818983;
  font-size: 23rpx;
}
.rich-content {
  display: block;
  margin-top: 32rpx;
  color: #343d38;
  font-size: 29rpx;
  line-height: 1.9;
  overflow-wrap: anywhere;
}
.related {
  margin-top: 48rpx;
}
.section-title {
  color: #25302a;
  font-size: 31rpx;
  font-weight: 650;
}
.related-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 92rpx;
  margin-top: 16rpx;
  padding: 0 24rpx;
  background: #fff;
  border: 1px solid #dfe5e0;
  border-radius: 8px;
  color: #25302a;
  font-size: 27rpx;
}
</style>
