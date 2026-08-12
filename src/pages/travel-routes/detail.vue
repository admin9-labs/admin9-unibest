<script lang="ts" setup>
import type { TravelRoute } from '@/api/travel-routes'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import { getTravelRoute } from '@/api/travel-routes'

defineOptions({ name: 'TravelRouteDetail' })
definePage({ style: { navigationBarTitleText: '线路详情' } })

const code = ref('')
const route = ref<TravelRoute | null>(null)
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
  notFound.value = false
  try {
    route.value = await getTravelRoute(code.value)
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
  uni.redirectTo({ url: '/pages/travel-routes/index' })
}
function openNode(node: NonNullable<TravelRoute['nodes']>[number]) {
  const path = node.node_type === 'attraction' ? 'attractions' : 'scenic-spots'
  uni.navigateTo({ url: `/pages/${path}/detail?code=${encodeURIComponent(node.target.code)}` })
}

onLoad((query) => {
  code.value = typeof query?.code === 'string' ? decodeURIComponent(query.code) : ''
  load()
})
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state">
      <wd-loading text="正在加载线路详情" />
    </view>
    <view v-else-if="notFound" class="state">
      <wd-empty tip="该线路不存在或已停止展示">
        <template #bottom>
          <wd-button size="small" @click="returnToList">
            返回线路列表
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <view v-else-if="failed" class="state">
      <wd-empty icon="network" tip="线路详情暂时无法加载">
        <template #bottom>
          <wd-button size="small" @click="load">
            重新加载
          </wd-button>
        </template>
      </wd-empty>
    </view>
    <template v-else-if="route">
      <wd-img v-if="route.cover?.url" :src="route.cover.url" width="100%" height="420rpx" mode="aspectFill" radius="0" enable-preview />
      <view v-else class="hero-placeholder">
        <wd-icon name="road" size="40" /><text>旅享西昌</text>
      </view>
      <view class="content">
        <view class="title">
          {{ route.name }}
        </view>
        <view v-if="route.summary" class="summary">
          {{ route.summary }}
        </view>
        <view v-if="route.duration_minutes" class="duration">
          <wd-icon name="time" size="18" /><text>建议用时 {{ route.duration_minutes }} 分钟</text>
        </view>
        <view v-if="route.description" class="section">
          <view class="section-title">
            线路说明
          </view><view class="long-text">
            {{ route.description }}
          </view>
        </view>
        <view v-if="route.nodes?.length" class="section">
          <view class="section-title">
            行程节点
          </view>
          <view class="timeline">
            <view v-for="node in route.nodes" :key="`${node.position}-${node.target.code}`" class="node" role="link" @click="openNode(node)">
              <view class="position">
                {{ node.position }}
              </view>
              <view class="node-copy">
                <view class="node-name">
                  {{ node.target.name }}
                </view><view class="node-kind">
                  {{ node.node_type === 'attraction' ? '景区' : '景点' }}<template v-if="node.stay_minutes">
                    · 建议停留 {{ node.stay_minutes }} 分钟
                  </template>
                </view><view v-if="node.note" class="node-note">
                  {{ node.note }}
                </view>
              </view>
              <wd-icon name="arrow-right" size="18" color="#69716c" />
            </view>
          </view>
        </view>
      </view>
    </template>
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
.hero-placeholder {
  display: flex;
  height: 420rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  color: #496270;
  background: #e3eaed;
  font-size: 24rpx;
}
.content {
  padding: 36rpx 28rpx 72rpx;
}
.title {
  color: #17211c;
  font-size: 46rpx;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
.summary {
  margin-top: 18rpx;
  color: #515b56;
  font-size: 28rpx;
  line-height: 1.7;
}
.duration {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 26rpx;
  color: #365f75;
  font-size: 26rpx;
}
.section {
  margin-top: 40rpx;
}
.section-title {
  color: #25302a;
  font-size: 31rpx;
  font-weight: 650;
}
.long-text {
  margin-top: 18rpx;
  color: #434d48;
  font-size: 28rpx;
  line-height: 1.85;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.timeline {
  margin-top: 18rpx;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dfe5e0;
  border-radius: 8px;
}
.node {
  display: flex;
  align-items: center;
  gap: 18rpx;
  min-height: 126rpx;
  padding: 24rpx;
  box-sizing: border-box;
}
.node + .node {
  border-top: 1px solid #edf0ed;
}
.position {
  display: flex;
  flex: 0 0 48rpx;
  height: 48rpx;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #23744f;
  border-radius: 50%;
  font-size: 23rpx;
}
.node-copy {
  flex: 1;
  min-width: 0;
}
.node-name {
  color: #25302a;
  font-size: 28rpx;
  font-weight: 600;
}
.node-kind {
  margin-top: 7rpx;
  color: #365f75;
  font-size: 23rpx;
}
.node-note {
  margin-top: 10rpx;
  color: #69716c;
  font-size: 24rpx;
  line-height: 1.5;
}
</style>
