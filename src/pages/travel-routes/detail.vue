<script lang="ts" setup>
import type { TravelRoute } from '@/api/travel-routes'
import type { HttpError } from '@/http/types'
import { ref } from 'vue'
import { getTravelRoute } from '@/api/travel-routes'
import PublicContentBody from '@/components/PublicContentBody.vue'
import PublicDetailCover from '@/components/PublicDetailCover.vue'
import PublicDetailHeading from '@/components/PublicDetailHeading.vue'
import PublicState from '@/components/PublicState.vue'

defineOptions({ name: 'TravelRouteDetail' })
definePage({ style: { navigationBarTitleText: '线路详情' } })

const id = ref<number | null>(null)
const route = ref<TravelRoute | null>(null)
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
  notFound.value = false
  try {
    route.value = await getTravelRoute(id.value)
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

function durationLabel(minutes: number | null) {
  if (!minutes)
    return ''
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${hours ? `${hours}小时` : ''}${rest ? `${rest}分钟` : ''}`
}

function openNode(node: NonNullable<TravelRoute['nodes']>[number]) {
  const path = node.node_type === 'attraction' ? 'attractions' : 'scenic-spots'
  uni.navigateTo({ url: `/pages/${path}/detail?id=${node.target.id}` })
}

onLoad((query) => {
  const value = Number(query?.id)
  id.value = Number.isInteger(value) && value > 0 ? value : null
  load()
})
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state-shell">
      <PublicState kind="loading" title="正在加载线路详情" />
    </view>
    <view v-else-if="notFound" class="state-shell">
      <PublicState kind="not-found" title="该线路不存在或已停止展示" action-text="返回线路列表" @action="returnToList" />
    </view>
    <view v-else-if="failed" class="state-shell">
      <PublicState kind="network-error" title="线路详情暂时无法加载" description="请检查网络后重新尝试。" action-text="重新加载" @action="load" />
    </view>
    <template v-else-if="route">
      <view class="detail-shell">
        <PublicDetailCover :src="route.cover?.url" height="420rpx" />
        <view class="content">
          <PublicDetailHeading :title="route.name" :summary="route.summary" />
          <view v-if="route.duration_minutes" class="duration">
            <text class="duration-label">建议用时</text><text class="duration-value">{{ durationLabel(route.duration_minutes) }}</text>
          </view>
          <view v-if="route.nodes?.length" class="section">
            <view class="section-title">
              行程安排
            </view>
            <view class="timeline">
              <view v-for="node in route.nodes" :key="`${node.position}-${node.target.id}`" class="node" role="link" @click="openNode(node)">
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
              </view>
            </view>
          </view>
          <PublicContentBody title="线路说明" :content="route.description" />
        </view>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--lx-color-surface-muted);
}
.state-shell {
  max-width: var(--lx-page-max);
  min-height: 78vh;
  margin: 0 auto;
  padding: 28rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.detail-shell {
  width: 100%;
  max-width: var(--lx-page-max);
  margin: 0 auto;
  overflow: hidden;
  background: var(--lx-color-surface);
}
.content {
  padding: 36rpx var(--lx-space-page) calc(72rpx + env(safe-area-inset-bottom));
}
.duration {
  display: flex;
  align-items: baseline;
  gap: 14rpx;
  margin-top: 24rpx;
  padding: 18rpx 0;
  border-bottom: 1px solid var(--lx-color-border);
}
.duration-label {
  color: var(--lx-color-text-tertiary);
  font-size: 23rpx;
}
.duration-value {
  color: var(--lx-color-primary-strong);
  font-size: 32rpx;
  font-weight: 680;
}
.section {
  margin-top: 40rpx;
}
.section-title {
  color: var(--lx-color-text-main);
  font-size: 31rpx;
  font-weight: 650;
}
.timeline {
  position: relative;
  margin-top: 18rpx;
}
.node {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  min-height: 126rpx;
  padding: 18rpx 0 28rpx;
  box-sizing: border-box;
}
.node + .node {
  border-top: 0;
}
.node:not(:last-child)::after {
  position: absolute;
  top: 66rpx;
  bottom: -4rpx;
  left: 23rpx;
  width: 2rpx;
  background: var(--lx-color-border-strong);
  content: '';
}
.position {
  display: flex;
  flex: 0 0 48rpx;
  height: 48rpx;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--lx-color-secondary);
  border-radius: 50%;
  font-size: 23rpx;
}
.node-copy {
  flex: 1;
  min-width: 0;
}
.node-name {
  color: var(--lx-color-text-main);
  font-size: 28rpx;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.node-kind {
  margin-top: 7rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 23rpx;
}
.node-note {
  margin-top: 10rpx;
  color: var(--lx-color-text-tertiary);
  font-size: 24rpx;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
</style>
