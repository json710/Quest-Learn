import { Router } from 'express'

import {
  listBadges,
  listMyBadges,
} from '../controllers/student-badge.controller.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

const router = Router()

router.use(authenticate, authorizeRoles('STUDENT'))
router.get('/', asyncHandler(listBadges))
router.get('/earned', asyncHandler(listMyBadges))

export default router
