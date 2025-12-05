export const DEFAULT_SITE_KEY = 'spk1'

export const SITE_CONFIG = {
  spk1: {
    title: 'СПК «Хорошово-1»',
    subtitle: 'Официальный портал садоводства',
    accent: '#52c41a'
  },
  spk2: {
    title: 'СПК «Хорошово-2»',
    subtitle: 'Портал соседнего товарищества',
    accent: '#13c2c2'
  },
  aihub: {
    title: 'AI Infinity / GPT Fusion',
    subtitle: 'AI-платформа и сервисы',
    accent: '#722ed1'
  }
}

export function detectSiteFromLocation() {
  const params = new URLSearchParams(window.location.search)
  const key = params.get('site')
  if (key && SITE_CONFIG[key]) return key
  return DEFAULT_SITE_KEY
}
