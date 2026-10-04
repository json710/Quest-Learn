import { Router } from 'express'

import {
  createSubmission,
  getTaskSubmission,
  listSubmissions,
  updateSubmission,
} from '../controllers/student-submission.controller.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import {
  validateBody,
  validateParams,
} from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import {
  submissionIdParamsSchema,
  submitWorkSchema,
  taskSubmissionParamsSchema,
  updateSubmissionSchema,
} from '../validation/submission.schemas.js'

const router = Router()

router.use(authenticate, authorizeRoles('STUDENT'))

router.get('/', asyncHandler(listSubmissions))
router
  .route('/tasks/:taskId')
  .all(validateParams(taskSubmissionParamsSchema))
  .post(validateBody(submitWorkSchema), asyncHandler(createSubmission))
  .get(asyncHandler(getTaskSubmission))
router.patch(
  '/:submissionId',
  validateParams(submissionIdParamsSchema),
  validateBody(updateSubmissionSchema),
  asyncHandler(updateSubmission),
)

export default router
