<script lang="ts" setup>
defineOptions({ name: 'Home' })
definePage({ type: 'home', style: { navigationBarTitleText: '旅享西昌' } })

function openAttractions() {
  uni.navigateTo({ url: '/pages/attractions/index' })
}

function openScenicSpots() {
  uni.navigateTo({ url: '/pages/scenic-spots/index' })
}

function openTravelRoutes() {
  uni.navigateTo({ url: '/pages/travel-routes/index' })
}
function openArticles() {
  uni.navigateTo({ url: '/pages/articles/index' })
}
function openAudioGuides() {
  uni.navigateTo({ url: '/pages/audio-guides/index' })
}
function openRestaurants() {
  uni.navigateTo({ url: '/pages/restaurants/index' })
}
function openAccommodations() {
  uni.navigateTo({ url: '/pages/accommodations/index' })
}
</script>

<template>
  <view class="home-page">
    <view class="home-header">
      <text class="home-kicker">TRAVEL XICHANG</text>
      <view class="home-title">
        旅享西昌
      </view>
      <view class="home-subtitle">
        从山水人文出发，发现此刻值得抵达的西昌。
      </view>
    </view>
    <view class="section-title">
      探索目的地
    </view>
    <view class="feature-row" role="button" @click="openAttractions">
      <view class="feature-icon">
        <wd-icon name="location" size="24" />
      </view>
      <view class="feature-copy">
        <view class="feature-title">
          景区
        </view>
        <view class="feature-description">
          查看已发布景区、开放时间与位置
        </view>
      </view>
      <wd-icon name="arrow-right" size="20" color="#69716c" />
    </view>
    <view class="feature-row" role="button" @click="openScenicSpots">
      <view class="feature-icon secondary">
        <wd-icon name="view" size="24" />
      </view>
      <view class="feature-copy">
        <view class="feature-title">
          景点
        </view>
        <view class="feature-description">
          发现景区内外值得停留的具体景点
        </view>
      </view>
      <wd-icon name="arrow-right" size="20" color="#69716c" />
    </view>
    <view class="feature-row" role="button" @click="openTravelRoutes">
      <view class="feature-icon route-icon">
        <wd-icon name="road" size="24" />
      </view>
      <view class="feature-copy">
        <view class="feature-title">
          线路
        </view><view class="feature-description">
          查看已发布行程和有序游览节点
        </view>
      </view>
      <wd-icon name="arrow-right" size="20" color="#69716c" />
    </view>
    <view class="feature-row" role="button" @click="openArticles">
      <view class="feature-icon article-icon">
        <wd-icon name="books" size="24" />
      </view><view class="feature-copy">
        <view class="feature-title">
          攻略资讯
        </view><view class="feature-description">
          阅读已发布攻略、资讯与通知
        </view>
      </view><wd-icon name="arrow-right" size="20" color="#69716c" />
    </view>
    <view class="feature-row" role="button" @click="openAudioGuides">
      <view class="feature-icon audio-icon">
        <wd-icon name="headphones" size="24" />
      </view><view class="feature-copy">
        <view class="feature-title">
          语音导览
        </view><view class="feature-description">
          播放已发布的景区景点讲解
        </view>
      </view><wd-icon name="arrow-right" size="20" color="#69716c" />
    </view>
    <view class="feature-row" role="button" @click="openRestaurants">
      <view class="feature-icon restaurant-icon">
        <wd-icon name="food" size="24" />
      </view><view class="feature-copy">
        <view class="feature-title">
          餐饮
        </view><view class="feature-description">
          发现已发布餐厅、招牌菜与位置
        </view>
      </view><wd-icon name="arrow-right" size="20" color="#69716c" />
    </view>
    <view class="feature-row" role="button" @click="openAccommodations">
      <view class="feature-icon accommodation-icon">
        <wd-icon name="home" size="24" />
      </view><view class="feature-copy">
        <view class="feature-title">
          住宿
        </view><view class="feature-description">
          查看已发布住宿、设施与参考价格
        </view>
      </view><wd-icon name="arrow-right" size="20" color="#69716c" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  padding: 48rpx 28rpx;
  background: #f4f6f3;
  box-sizing: border-box;
}

.home-header {
  padding: 36rpx 4rpx 56rpx;
}

.home-title {
  margin-top: 12rpx;
  color: #17211c;
  font-size: 58rpx;
  font-weight: 700;
}

.home-kicker {
  color: #34765b;
  font-size: 22rpx;
  font-weight: 600;
}

.home-subtitle {
  max-width: 600rpx;
  margin-top: 20rpx;
  color: #59635e;
  font-size: 28rpx;
  line-height: 1.65;
}

.section-title {
  margin-bottom: 20rpx;
  color: #27312c;
  font-size: 30rpx;
  font-weight: 600;
}

.feature-row {
  display: flex;
  align-items: center;
  min-height: 132rpx;
  padding: 24rpx;
  background: #fff;
  border: 1px solid #e1e6e2;
  border-radius: 8px;
  box-sizing: border-box;
}
.feature-row + .feature-row {
  margin-top: 20rpx;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  color: #fff;
  background: #23744f;
  border-radius: 8px;
}
.feature-icon.secondary {
  background: #365f75;
}
.feature-icon.route-icon {
  background: #7b5934;
}
.feature-icon.article-icon {
  background: #8a4f4a;
}
.feature-icon.audio-icon {
  background: #5d4d78;
}
.feature-icon.restaurant-icon {
  background: #a64532;
}
.feature-icon.accommodation-icon {
  background: #2f6571;
}

.feature-copy {
  flex: 1;
  min-width: 0;
  margin: 0 24rpx;
}
.feature-title {
  color: #17211c;
  font-size: 32rpx;
  font-weight: 600;
}
.feature-description {
  margin-top: 8rpx;
  color: #69716c;
  font-size: 24rpx;
}
</style>
