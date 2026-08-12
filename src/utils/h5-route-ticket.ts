export function currentH5Ticket() {
  // #ifdef H5
  const query = window.location.hash.split('?')[1] || ''
  const value = new URLSearchParams(query).get('ticket')
  return value ? decodeURIComponent(value) : ''
  // #endif
  // #ifndef H5
  return ''
  // #endif
}
