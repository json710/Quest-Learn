import { Router } from 'express'

import {
  createOption,
  createQuestion,
  createQuiz,
  deleteOption,
  deleteQuestion,
  deleteQuiz,
  getQuiz,
  listQuizzes,
  updateOption,
  updatePublication,
  updateQuestion,
  updateQuiz,
} from '../controllers/instructor-quiz.controller.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import { validateBody, validateParams } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import {
  courseQuizParamsSchema,
  createOptionSchema,
  createQuestionSchema,
  createQuizSchema,
  optionParamsSchema,
  questionParamsSchema,
  quizParamsSchema,
  quizPublicationSchema,
  updateOptionSchema,
  updateQuestionSchema,
  updateQuizSchema,
} from '../validation/quiz.schemas.js'

const router = Router()
router.use(authenticate, authorizeRoles('INSTRUCTOR'))

router.route('/courses/:courseId/quizzes')
  .all(validateParams(courseQuizParamsSchema))
  .get(asyncHandler(listQuizzes))
  .post(validateBody(createQuizSchema), asyncHandler(createQuiz))

router.route('/quizzes/:quizId')
  .all(validateParams(quizParamsSchema))
  .get(asyncHandler(getQuiz))
  .patch(validateBody(updateQuizSchema), asyncHandler(updateQuiz))
  .delete(asyncHandler(deleteQuiz))

router.patch('/quizzes/:quizId/publication', validateParams(quizParamsSchema), validateBody(quizPublicationSchema), asyncHandler(updatePublication))
router.post('/quizzes/:quizId/questions', validateParams(quizParamsSchema), validateBody(createQuestionSchema), asyncHandler(createQuestion))

router.route('/quiz-questions/:questionId')
  .all(validateParams(questionParamsSchema))
  .patch(validateBody(updateQuestionSchema), asyncHandler(updateQuestion))
  .delete(asyncHandler(deleteQuestion))

router.post('/quiz-questions/:questionId/options', validateParams(questionParamsSchema), validateBody(createOptionSchema), asyncHandler(createOption))

router.route('/quiz-options/:optionId')
  .all(validateParams(optionParamsSchema))
  .patch(validateBody(updateOptionSchema), asyncHandler(updateOption))
  .delete(asyncHandler(deleteOption))

export default router
