import { apiRequest } from './api.js'

export const badgeApi = {
  list: () => apiRequest('/badges'),
  earned: () => apiRequest('/badges/earned'),
}
