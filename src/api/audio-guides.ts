import type { AudioGuidePlaybackResource } from '@/service/types'
import { publicAudioGuidesAudioGuideUsingGet, publicAudioGuidesUsingGet } from '@/service/audioGuide'

export type AudioGuide = AudioGuidePlaybackResource
export async function getAudioGuides(keyword = '') {
  const response = await publicAudioGuidesUsingGet({ params: { keyword: keyword || undefined, page_size: 50 }, options: { auth: 'public', hideErrorToast: true } })
  return response.data as AudioGuide[]
}
export async function getAudioGuide(code: string) {
  const response = await publicAudioGuidesAudioGuideUsingGet({ params: { audioGuide: code }, options: { auth: 'public', hideErrorToast: true } })
  return response.data.audio_guide as AudioGuide
}
