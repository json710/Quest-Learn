import { apiRequest } from './api.js'

export const authApi = {
  login: (credentials) =>
    apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (details) =>
    apiRequest('/auth/register', { method: 'POST', body: details }),
  me: () => apiRequest('/auth/me'),
  updateProfile: (profile) =>
    apiRequest('/auth/profile', { method: 'PATCH', body: profile }),
  changePassword: (passwords) =>
    apiRequest('/auth/password', { method: 'PATCH', body: passwords }),
}
