import { apiRequest } from './api.js'

export const leaderboardApi = {
  get: () => apiRequest('/leaderboard'),
}
