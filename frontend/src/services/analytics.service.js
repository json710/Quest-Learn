import { apiRequest } from './api.js'

const id = encodeURIComponent

export const studentAnalyticsApi = {
  get: () => apiRequest('/analytics'),
}

export const instructorAnalyticsApi = {
  overview: () => apiRequest('/instructor/analytics'),
  course: (courseId) =>
    apiRequest(`/instructor/courses/${id(courseId)}/analytics`),
}
