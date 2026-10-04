import { Router } from 'express'

import {
  getAttemptResult,
  getQuiz,
  listAttempts,
  listQuizzes,
  startAttempt,
  submitAttempt,
} from '../controllers/student-quiz.controller.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import { validateBody, validateParams } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import { attemptParamsSchema, quizParamsSchema, submitAttemptSchema } from '../validation/quiz.schemas.js'

const router = Router()
router.use(authenticate, authorizeRoles('STUDENT'))

router.get('/', asyncHandler(listQuizzes))
router.get('/attempts', asyncHandler(listAttempts))
router.get('/attempts/:attemptId', validateParams(attemptParamsSchema), asyncHandler(getAttemptResult))
router.post('/attempts/:attemptId/submission', validateParams(attemptParamsSchema), validateBody(submitAttemptSchema), asyncHandler(submitAttempt))
router.get('/:quizId', validateParams(quizParamsSchema), asyncHandler(getQuiz))
router.post('/:quizId/attempts', validateParams(quizParamsSchema), asyncHandler(startAttempt))

export default router
