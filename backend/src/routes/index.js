import { Router } from 'express'

import adminRouter from './admin.routes.js'
import authRouter from './auth.routes.js'
import instructorAnalyticsRouter from './instructor-analytics.routes.js'
import instructorCourseRouter from './instructor-course.routes.js'
import instructorQuizRouter from './instructor-quiz.routes.js'
import instructorSubmissionRouter from './instructor-submission.routes.js'
import studentCourseRouter from './student-course.routes.js'
import studentAnalyticsRouter from './student-analytics.routes.js'
import studentBadgeRouter from './student-badge.routes.js'
import studentLeaderboardRouter from './student-leaderboard.routes.js'
import studentQuizRouter from './student-quiz.routes.js'
import studentSubmissionRouter from './student-submission.routes.js'

const router = Router()

router.use('/admin', adminRouter)
router.use('/auth', authRouter)
router.use('/instructor', instructorAnalyticsRouter)
router.use('/instructor/submissions', instructorSubmissionRouter)
router.use('/instructor', instructorQuizRouter)
router.use('/instructor', instructorCourseRouter)
router.use('/courses', studentCourseRouter)
router.use('/analytics', studentAnalyticsRouter)
router.use('/badges', studentBadgeRouter)
router.use('/leaderboard', studentLeaderboardRouter)
router.use('/quizzes', studentQuizRouter)
router.use('/submissions', studentSubmissionRouter)

export default router
