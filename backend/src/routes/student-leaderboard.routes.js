import { Router } from 'express'

import { getLeaderboard } from '../controllers/student-leaderboard.controller.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'

const router = Router()

router.use(authenticate, authorizeRoles('STUDENT'))
router.get('/', asyncHandler(getLeaderboard))

export default router
