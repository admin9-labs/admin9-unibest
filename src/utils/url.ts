export function ensureDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}

export function parseUrlToObj(url: string) {
  const separatorIndex = url.indexOf('?')
  const path = separatorIndex === -1 ? url : url.slice(0, separatorIndex)
  const queryStr = separatorIndex === -1 ? '' : url.slice(separatorIndex + 1)
  if (!queryStr)
    return { path, query: {} }

  const query: Record<string, string> = {}
  queryStr.split('&').forEach((item) => {
    const separatorIndex = item.indexOf('=')
    const key = separatorIndex === -1 ? item : item.slice(0, separatorIndex)
    const value = separatorIndex === -1 ? '' : item.slice(separatorIndex + 1)
    query[ensureDecodeURIComponent(key)] = ensureDecodeURIComponent(value)
  })
  return { path, query }
}
