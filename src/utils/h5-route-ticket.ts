export function currentH5Ticket() {
  // #ifdef H5
  return new URLSearchParams(window.location.search).get('ticket') || ''
  // #endif
  // #ifndef H5
  return ''
  // #endif
}
