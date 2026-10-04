import { apiRequest } from './api.js'

const id = encodeURIComponent

export const studentSubmissionApi = {
  list: () => apiRequest('/submissions'),
  forTask: (taskId) => apiRequest(`/submissions/tasks/${id(taskId)}`),
  submit: (taskId, content) =>
    apiRequest(`/submissions/tasks/${id(taskId)}`, {
      method: 'POST',
      body: { content },
    }),
  update: (submissionId, content) =>
    apiRequest(`/submissions/${id(submissionId)}`, {
      method: 'PATCH',
      body: { content },
    }),
}

export const instructorSubmissionApi = {
  forTask: (taskId) =>
    apiRequest(`/instructor/submissions/learning-tasks/${id(taskId)}`),
  details: (submissionId) =>
    apiRequest(`/instructor/submissions/${id(submissionId)}`),
  review: (submissionId, review) =>
    apiRequest(`/instructor/submissions/${id(submissionId)}/review`, {
      method: 'PATCH',
      body: review,
    }),
}
