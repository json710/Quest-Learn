import { apiRequest } from './api.js'

const id = encodeURIComponent

export const adminApi = {
  overview: () => apiRequest('/admin/overview'),
  users: ({ page = 1, limit = 20, role = '', status = '', search = '' }) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (role) query.set('role', role)
    if (status) query.set('status', status)
    if (search) query.set('search', search)
    return apiRequest(`/admin/users?${query}`)
  },
  user: (userId) => apiRequest(`/admin/users/${id(userId)}`),
  updateRole: (userId, role) =>
    apiRequest(`/admin/users/${id(userId)}/role`, {
      method: 'PATCH',
      body: { role },
    }),
  updateStatus: (userId, isActive) =>
    apiRequest(`/admin/users/${id(userId)}/status`, {
      method: 'PATCH',
      body: { isActive },
    }),
}
