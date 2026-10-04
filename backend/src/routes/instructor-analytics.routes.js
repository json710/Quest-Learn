import { Router } from 'express'

import {
  instructorAnalytics,
  instructorCourseAnalytics,
} from '../controllers/analytics.controller.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import { validateParams } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import { courseIdParamsSchema } from '../validation/course.schemas.js'

const router = Router()

router.use(authenticate, authorizeRoles('INSTRUCTOR'))
router.get('/analytics', asyncHandler(instructorAnalytics))
router.get(
  '/courses/:courseId/analytics',
  validateParams(courseIdParamsSchema),
  asyncHandler(instructorCourseAnalytics),
)

export default router
