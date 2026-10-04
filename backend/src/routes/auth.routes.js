import { Router } from 'express'

import {
  changeCurrentPassword,
  getCurrentUser,
  login,
  register,
  updateCurrentProfile,
} from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import { validateBody } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '../validation/auth.schemas.js'

const router = Router()

router.post('/register', validateBody(registerSchema), asyncHandler(register))
router.post('/login', validateBody(loginSchema), asyncHandler(login))
router.get('/me', authenticate, getCurrentUser)
router.patch(
  '/profile',
  authenticate,
  authorizeRoles('STUDENT', 'INSTRUCTOR'),
  validateBody(updateProfileSchema),
  asyncHandler(updateCurrentProfile),
)
router.patch(
  '/password',
  authenticate,
  authorizeRoles('STUDENT', 'INSTRUCTOR'),
  validateBody(changePasswordSchema),
  asyncHandler(changeCurrentPassword),
)

export default router
