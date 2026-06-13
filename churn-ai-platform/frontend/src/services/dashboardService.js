import apiClient, { unwrapApiEnvelope } from '@/services/apiClient'

export async function getDashboard(hours = 24) {
  const { data } = await apiClient.get('/dashboard', { params: { hours } })
  return unwrapApiEnvelope(data)
}

export async function getHistory(limit = 20, offset = 0) {
  const { data } = await apiClient.get('/history', { params: { limit, offset } })
  return unwrapApiEnvelope(data)
}

export async function getHealth() {
  const [healthResponse, systemResponse, modelResponse] = await Promise.all([
    apiClient.get('/health'),
    apiClient.get('/system-health'),
    apiClient.get('/model-health'),
  ])

  return {
    health: unwrapApiEnvelope(healthResponse.data),
    system: systemResponse.data,
    model: unwrapApiEnvelope(modelResponse.data),
  }
}
