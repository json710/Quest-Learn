import {
  createOption as createOptionService,
  createQuestion as createQuestionService,
  createQuiz as createQuizService,
  deleteOption as deleteOptionService,
  deleteQuestion as deleteQuestionService,
  deleteQuiz as deleteQuizService,
  getInstructorQuiz,
  listInstructorQuizzes,
  setQuizPublication,
  updateOption as updateOptionService,
  updateQuestion as updateQuestionService,
  updateQuiz as updateQuizService,
} from '../services/instructor-quiz.service.js'

export const listQuizzes = async (request, response) => {
  const quizzes = await listInstructorQuizzes(request.validatedParams.courseId, request.user.id)
  return response.json({ data: { quizzes } })
}

export const createQuiz = async (request, response) => {
  const quiz = await createQuizService(request.validatedParams.courseId, request.user.id, request.validatedBody)
  return response.status(201).json({ data: { quiz } })
}

export const getQuiz = async (request, response) => {
  const quiz = await getInstructorQuiz(request.validatedParams.quizId, request.user.id)
  return response.json({ data: { quiz } })
}

export const updateQuiz = async (request, response) => {
  const quiz = await updateQuizService(request.validatedParams.quizId, request.user.id, request.validatedBody)
  return response.json({ data: { quiz } })
}

export const deleteQuiz = async (request, response) => {
  await deleteQuizService(request.validatedParams.quizId, request.user.id)
  return response.status(204).send()
}

export const updatePublication = async (request, response) => {
  const quiz = await setQuizPublication(request.validatedParams.quizId, request.user.id, request.validatedBody.isPublished)
  return response.json({ data: { quiz } })
}

export const createQuestion = async (request, response) => {
  const question = await createQuestionService(request.validatedParams.quizId, request.user.id, request.validatedBody)
  return response.status(201).json({ data: { question } })
}

export const updateQuestion = async (request, response) => {
  const question = await updateQuestionService(request.validatedParams.questionId, request.user.id, request.validatedBody)
  return response.json({ data: { question } })
}

export const deleteQuestion = async (request, response) => {
  await deleteQuestionService(request.validatedParams.questionId, request.user.id)
  return response.status(204).send()
}

export const createOption = async (request, response) => {
  const option = await createOptionService(request.validatedParams.questionId, request.user.id, request.validatedBody)
  return response.status(201).json({ data: { option } })
}

export const updateOption = async (request, response) => {
  const option = await updateOptionService(request.validatedParams.optionId, request.user.id, request.validatedBody)
  return response.json({ data: { option } })
}

export const deleteOption = async (request, response) => {
  await deleteOptionService(request.validatedParams.optionId, request.user.id)
  return response.status(204).send()
}
