import { isPageTabbar } from '@/tabbar/store'

const MAX_REDIRECT_DECODE_PASSES = 4

function hasControlCharacters(value: string) {
  return value.split('').some((character) => {
    const code = character.charCodeAt(0)
    return code <= 31 || code === 127
  })
}

export function normalizeAuthRedirect(redirect?: string) {
  let normalized = redirect?.trim()
  if (!normalized)
    return undefined

  try {
    for (let pass = 0; normalized.startsWith('%') && pass < MAX_REDIRECT_DECODE_PASSES; pass++) {
      const decoded = decodeURIComponent(normalized)
      if (decoded === normalized)
        break
      normalized = decoded
    }

    if (normalized.startsWith('%'))
      return undefined

    const decodedForValidation = decodeURIComponent(normalized)
    if (hasControlCharacters(decodedForValidation) || decodedForValidation.includes('#'))
      return undefined
  }
  catch {
    return undefined
  }

  const queryIndex = normalized.indexOf('?')
  const path = queryIndex === -1 ? normalized : normalized.slice(0, queryIndex)
  const query = queryIndex === -1 ? '' : normalized.slice(queryIndex)
  const canonicalPath = decodeURIComponent(path)

  if (!canonicalPath.startsWith('/')
    || canonicalPath.startsWith('//')
    || canonicalPath.includes('\\')
    || canonicalPath.includes('?')
    || canonicalPath.includes('#')
    || hasControlCharacters(canonicalPath)) {
    return undefined
  }

  return `${canonicalPath}${query}`
}

export function navigateAfterLogin(redirect?: string) {
  const target = normalizeAuthRedirect(redirect)
  if (target) {
    const path = target.split('?')[0]
    if (isPageTabbar(path))
      uni.switchTab({ url: path })
    else
      uni.reLaunch({ url: target })
    return
  }

  const pages = getCurrentPages()
  if (pages.length > 1)
    uni.navigateBack()
  else
    uni.reLaunch({ url: '/pages/me/me' })
}
