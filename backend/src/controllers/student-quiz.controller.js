import {
  getAvailableQuiz,
  getQuizAttemptResult,
  listAvailableQuizzes,
  listStudentQuizAttempts,
  startQuizAttempt,
  submitQuizAttempt,
} from '../services/student-quiz.service.js'

export const listQuizzes = async (request, response) => {
  const quizzes = await listAvailableQuizzes(request.user.id)
  return response.json({ data: { quizzes } })
}

export const getQuiz = async (request, response) => {
  const quiz = await getAvailableQuiz(request.user.id, request.validatedParams.quizId)
  return response.json({ data: { quiz } })
}

export const startAttempt = async (request, response) => {
  const result = await startQuizAttempt(request.user.id, request.validatedParams.quizId)
  return response.status(201).json({ data: result })
}

export const submitAttempt = async (request, response) => {
  const attempt = await submitQuizAttempt(request.user.id, request.validatedParams.attemptId, request.validatedBody)
  return response.json({ message: 'Quiz submitted successfully', data: { attempt } })
}

export const getAttemptResult = async (request, response) => {
  const attempt = await getQuizAttemptResult(request.user.id, request.validatedParams.attemptId)
  return response.json({ data: { attempt } })
}

export const listAttempts = async (request, response) => {
  const attempts = await listStudentQuizAttempts(request.user.id)
  return response.json({ data: { attempts } })
}
