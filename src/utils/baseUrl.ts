import { isMpWeixin } from '@uni-helper/uni-env'

export function getEnvBaseUrl() {
  // #ifdef H5
  return ''
  // #endif
  // #ifndef H5
  let baseUrl = import.meta.env.VITE_SERVER_BASEURL
  if (isMpWeixin) {
    const { miniProgram: { envVersion } } = uni.getAccountInfoSync()
    const weixinBaseUrlMap: Record<string, string | undefined> = {
      develop: import.meta.env.VITE_SERVER_BASEURL__WEIXIN_DEVELOP,
      trial: import.meta.env.VITE_SERVER_BASEURL__WEIXIN_TRIAL,
      release: import.meta.env.VITE_SERVER_BASEURL__WEIXIN_RELEASE,
    }
    baseUrl = weixinBaseUrlMap[envVersion] || baseUrl
  }
  return baseUrl
  // #endif
}
