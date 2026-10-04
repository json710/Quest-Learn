import { Router } from 'express'

import {
  getUser,
  listUsers,
  overview,
  updateUserRole,
  updateUserStatus,
} from '../controllers/admin.controller.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import {
  adminUserListQuerySchema,
  adminUserParamsSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from '../validation/admin.schemas.js'

const router = Router()

router.use(authenticate, authorizeRoles('ADMIN'))
router.get('/overview', asyncHandler(overview))
router.get(
  '/users',
  validateQuery(adminUserListQuerySchema),
  asyncHandler(listUsers),
)
router.get(
  '/users/:userId',
  validateParams(adminUserParamsSchema),
  asyncHandler(getUser),
)
router.patch(
  '/users/:userId/role',
  validateParams(adminUserParamsSchema),
  validateBody(updateUserRoleSchema),
  asyncHandler(updateUserRole),
)
router.patch(
  '/users/:userId/status',
  validateParams(adminUserParamsSchema),
  validateBody(updateUserStatusSchema),
  asyncHandler(updateUserStatus),
)

export default router
