import { Router } from 'express'

import {
  createCourse,
  createLearningTask,
  createLesson,
  deleteCourse,
  deleteLearningTask,
  deleteLesson,
  getCourse,
  getLearningTask,
  getLesson,
  listCourses,
  listLearningTasks,
  listLessons,
  updateCourse,
  updateLearningTask,
  updateLesson,
} from '../controllers/instructor-course.controller.js'
import { authenticate } from '../middleware/authenticate.middleware.js'
import { authorizeRoles } from '../middleware/authorize.middleware.js'
import {
  validateBody,
  validateParams,
} from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import {
  courseIdParamsSchema,
  createCourseSchema,
  createLearningTaskSchema,
  createLessonSchema,
  lessonIdParamsSchema,
  taskIdParamsSchema,
  updateCourseSchema,
  updateLearningTaskSchema,
  updateLessonSchema,
} from '../validation/course.schemas.js'

const router = Router()

router.use(authenticate, authorizeRoles('INSTRUCTOR'))

router
  .route('/courses')
  .post(validateBody(createCourseSchema), asyncHandler(createCourse))
  .get(asyncHandler(listCourses))

router
  .route('/courses/:courseId')
  .all(validateParams(courseIdParamsSchema))
  .get(asyncHandler(getCourse))
  .patch(validateBody(updateCourseSchema), asyncHandler(updateCourse))
  .delete(asyncHandler(deleteCourse))

router
  .route('/courses/:courseId/lessons')
  .all(validateParams(courseIdParamsSchema))
  .post(validateBody(createLessonSchema), asyncHandler(createLesson))
  .get(asyncHandler(listLessons))

router
  .route('/lessons/:lessonId')
  .all(validateParams(lessonIdParamsSchema))
  .get(asyncHandler(getLesson))
  .patch(validateBody(updateLessonSchema), asyncHandler(updateLesson))
  .delete(asyncHandler(deleteLesson))

router
  .route('/courses/:courseId/learning-tasks')
  .all(validateParams(courseIdParamsSchema))
  .post(validateBody(createLearningTaskSchema), asyncHandler(createLearningTask))
  .get(asyncHandler(listLearningTasks))

router
  .route('/learning-tasks/:taskId')
  .all(validateParams(taskIdParamsSchema))
  .get(asyncHandler(getLearningTask))
  .patch(
    validateBody(updateLearningTaskSchema),
    asyncHandler(updateLearningTask),
  )
  .delete(asyncHandler(deleteLearningTask))

export default router
