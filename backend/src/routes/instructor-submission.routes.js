import { Router } from 'express'

import {
  getSubmission,
  listSubmissionsForTask,
  reviewSubmission,
} from '../controllers/instructor-submission.controller.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import {
  validateBody,
  validateParams,
} from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import {
  reviewSubmissionSchema,
  submissionIdParamsSchema,
  taskSubmissionParamsSchema,
} from '../validation/submission.schemas.js'

const router = Router()

router.use(authenticate, authorizeRoles('INSTRUCTOR'))

router.get(
  '/learning-tasks/:taskId',
  validateParams(taskSubmissionParamsSchema),
  asyncHandler(listSubmissionsForTask),
)
router.get(
  '/:submissionId',
  validateParams(submissionIdParamsSchema),
  asyncHandler(getSubmission),
)
router.patch(
  '/:submissionId/review',
  validateParams(submissionIdParamsSchema),
  validateBody(reviewSubmissionSchema),
  asyncHandler(reviewSubmission),
)

export default router
