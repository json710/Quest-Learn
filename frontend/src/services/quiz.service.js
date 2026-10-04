import { apiRequest } from './api.js'

const id = encodeURIComponent

export const studentQuizApi = {
  list: () => apiRequest('/quizzes'),
  details: (quizId) => apiRequest(`/quizzes/${id(quizId)}`),
  start: (quizId) => apiRequest(`/quizzes/${id(quizId)}/attempts`, { method: 'POST' }),
  submit: (attemptId, answers) => apiRequest(`/quizzes/attempts/${id(attemptId)}/submission`, { method: 'POST', body: { answers } }),
  result: (attemptId) => apiRequest(`/quizzes/attempts/${id(attemptId)}`),
  attempts: () => apiRequest('/quizzes/attempts'),
}

export const instructorQuizApi = {
  listForCourse: (courseId) => apiRequest(`/instructor/courses/${id(courseId)}/quizzes`),
  details: (quizId) => apiRequest(`/instructor/quizzes/${id(quizId)}`),
  create: (courseId, quiz) => apiRequest(`/instructor/courses/${id(courseId)}/quizzes`, { method: 'POST', body: quiz }),
  update: (quizId, quiz) => apiRequest(`/instructor/quizzes/${id(quizId)}`, { method: 'PATCH', body: quiz }),
  remove: (quizId) => apiRequest(`/instructor/quizzes/${id(quizId)}`, { method: 'DELETE' }),
  publication: (quizId, isPublished) => apiRequest(`/instructor/quizzes/${id(quizId)}/publication`, { method: 'PATCH', body: { isPublished } }),
  createQuestion: (quizId, question) => apiRequest(`/instructor/quizzes/${id(quizId)}/questions`, { method: 'POST', body: question }),
  updateQuestion: (questionId, question) => apiRequest(`/instructor/quiz-questions/${id(questionId)}`, { method: 'PATCH', body: question }),
  removeQuestion: (questionId) => apiRequest(`/instructor/quiz-questions/${id(questionId)}`, { method: 'DELETE' }),
  createOption: (questionId, option) => apiRequest(`/instructor/quiz-questions/${id(questionId)}/options`, { method: 'POST', body: option }),
  updateOption: (optionId, option) => apiRequest(`/instructor/quiz-options/${id(optionId)}`, { method: 'PATCH', body: option }),
  removeOption: (optionId) => apiRequest(`/instructor/quiz-options/${id(optionId)}`, { method: 'DELETE' }),
}
