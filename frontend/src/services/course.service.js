import { apiRequest } from './api.js'

const id = encodeURIComponent

export const studentCourseApi = {
  browse: () => apiRequest('/courses'),
  details: (courseId) => apiRequest(`/courses/${id(courseId)}`),
  enroll: (courseId) =>
    apiRequest(`/courses/${id(courseId)}/enrollments`, { method: 'POST' }),
  enrolled: () => apiRequest('/courses/enrolled'),
  learning: (courseId) => apiRequest(`/courses/${id(courseId)}/learning`),
}

export const instructorCourseApi = {
  list: () => apiRequest('/instructor/courses'),
  details: (courseId) => apiRequest(`/instructor/courses/${id(courseId)}`),
  create: (course) =>
    apiRequest('/instructor/courses', { method: 'POST', body: course }),
  update: (courseId, course) =>
    apiRequest(`/instructor/courses/${id(courseId)}`, {
      method: 'PATCH',
      body: course,
    }),
  remove: (courseId) =>
    apiRequest(`/instructor/courses/${id(courseId)}`, { method: 'DELETE' }),
  createLesson: (courseId, lesson) =>
    apiRequest(`/instructor/courses/${id(courseId)}/lessons`, {
      method: 'POST',
      body: lesson,
    }),
  updateLesson: (lessonId, lesson) =>
    apiRequest(`/instructor/lessons/${id(lessonId)}`, {
      method: 'PATCH',
      body: lesson,
    }),
  removeLesson: (lessonId) =>
    apiRequest(`/instructor/lessons/${id(lessonId)}`, { method: 'DELETE' }),
  createTask: (courseId, task) =>
    apiRequest(`/instructor/courses/${id(courseId)}/learning-tasks`, {
      method: 'POST',
      body: task,
    }),
  updateTask: (taskId, task) =>
    apiRequest(`/instructor/learning-tasks/${id(taskId)}`, {
      method: 'PATCH',
      body: task,
    }),
  removeTask: (taskId) =>
    apiRequest(`/instructor/learning-tasks/${id(taskId)}`, {
      method: 'DELETE',
    }),
  taskDetails: (taskId) =>
    apiRequest(`/instructor/learning-tasks/${id(taskId)}`),
}
