import { Router } from 'express'

import {
  browseCourses,
  enroll,
  viewCourse,
  viewEnrolledCourses,
  viewLearningContent,
} from '../controllers/student-course.controller.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import { validateParams } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import { courseIdParamsSchema } from '../validation/course.schemas.js'

const router = Router()

router.use(authenticate, authorizeRoles('STUDENT'))

router.get('/', asyncHandler(browseCourses))
router.get('/enrolled', asyncHandler(viewEnrolledCourses))
router.get(
  '/:courseId',
  validateParams(courseIdParamsSchema),
  asyncHandler(viewCourse),
)
router.post(
  '/:courseId/enrollments',
  validateParams(courseIdParamsSchema),
  asyncHandler(enroll),
)
router.get(
  '/:courseId/learning',
  validateParams(courseIdParamsSchema),
  asyncHandler(viewLearningContent),
)

export default router
