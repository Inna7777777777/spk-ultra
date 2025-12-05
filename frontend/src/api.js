import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function login(email, password) {
  const params = new URLSearchParams()
  params.append('username', email)
  params.append('password', password)
  const { data } = await api.post('/auth/token', params)
  localStorage.setItem('token', data.access_token)
  return data
}

export async function fetchMe() {
  const { data } = await api.get('/users/me')
  return data
}

export async function fetchPages(siteKey) {
  const { data } = await api.get('/pages/', { params: { site_key: siteKey } })
  return data
}

export async function fetchPublicPage(siteKey, slug) {
  const { data } = await api.get(`/pages/public/${siteKey}/${slug}`)
  return data
}

export async function fetchEvents(siteKey) {
  const { data } = await api.get('/calendar/events', { params: { site_key: siteKey } })
  return data
}

export async function fetchTariffs(siteKey) {
  const { data } = await api.get('/billing/tariffs', { params: { site_key: siteKey } })
  return data
}

export async function fetchAccruals(siteKey, year) {
  const { data } = await api.get('/billing/accruals', { params: { site_key: siteKey, year } })
  return data
}

export async function fetchMyAccruals(siteKey, year) {
  const { data } = await api.get('/billing/accruals/my', { params: { site_key: siteKey, year } })
  return data
}

export async function fetchBillingSummary(siteKey, year) {
  const { data } = await api.get('/billing/summary', { params: { site_key: siteKey, year } })
  return data
}

export async function generateAccruals(siteKey, year, tariffId, byPlots = true) {
  const { data } = await api.post('/billing/accruals/generate', null, {
    params: { site_key: siteKey, year, tariff_id: tariffId, by_plots: byPlots }
  })
  return data
}

export async function fetchForumCategories(siteKey) {
  const { data } = await api.get('/forum/categories', { params: { site_key: siteKey } })
  return data
}

export async function fetchForumTopics(categoryId) {
  const { data } = await api.get('/forum/topics', { params: { category_id: categoryId } })
  return data
}

export async function fetchForumPosts(topicId) {
  const { data } = await api.get('/forum/posts', { params: { topic_id: topicId } })
  return data
}

export async function createForumTopic(payload) {
  const { data } = await api.post('/forum/topics', payload)
  return data
}

export async function createForumPost(payload) {
  const { data } = await api.post('/forum/posts', payload)
  return data
}

export async function fetchAuditLogs(siteKey, limit = 100) {
  const { data } = await api.get('/audit/logs', { params: { site_key: siteKey, limit } })
  return data
}

export async function fetchAuditAccrualReport(siteKey, year) {
  const { data } = await api.get('/audit/accruals_report', { params: { site_key: siteKey, year } })
  return data
}

export async function fetchReceipt(accrualId) {
  const { data } = await api.get(`/payments_extra/receipt/${accrualId}`)
  return data
}


export async function fetchPolls(siteKey, activeOnly = true) {
  const { data } = await api.get('/polls/list', { params: { site_key: siteKey, active_only: activeOnly } })
  return data
}

export async function fetchPoll(pollId) {
  const { data } = await api.get(`/polls/${pollId}`)
  return data
}

export async function createPoll(payload) {
  const { data } = await api.post('/polls/', payload)
  return data
}

export async function castVote(payload) {
  const { data } = await api.post('/polls/vote', payload)
  return data
}

export async function fetchPollResults(pollId) {
  const { data } = await api.get(`/polls/${pollId}/results`)
  return data
}

export async function sendFeedback(payload) {
  const { data } = await api.post('/feedback/', payload)
  return data
}

export async function fetchMyFeedback(siteKey) {
  const { data } = await api.get('/feedback/my', { params: { site_key: siteKey } })
  return data
}

export async function fetchFeedbackAdmin(siteKey, status = 'open') {
  const { data } = await api.get('/feedback/admin', { params: { site_key: siteKey, status } })
  return data
}

export default api
