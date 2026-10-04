import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { ContentManager } from '../../components/ContentManager.jsx'
import { Icon } from '../../components/Icon.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { StatusBadge } from '../../components/StatusBadge.jsx'
import { instructorCourseApi } from '../../services/course.service.js'

export function InstructorCourseDetailsPage() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshCourse = async () => {
    const response = await instructorCourseApi.details(courseId)
    setCourse(response.data.course)
  }

  useEffect(() => {
    instructorCourseApi.details(courseId).then((response) => setCourse(response.data.course)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false))
  }, [courseId])

  const mutate = (operation) => async (...args) => {
    await operation(...args)
    await refreshCourse()
  }

  if (loading) return <PageLoader label="Loading course workspace..." />
  if (!course) return <Alert>{error || 'Course was not found.'}</Alert>

  return (
    <div className="space-y-7">
      <section className="surface-card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-violet-600" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <Link className="back-link" to="/instructor/courses"><Icon name="arrowLeft" className="h-4 w-4" />My courses</Link>
            <div className="mt-5 flex flex-wrap items-center gap-3"><StatusBadge status={course.isPublished ? 'PUBLISHED' : 'DRAFT'}>{course.isPublished ? 'Published' : 'Draft'}</StatusBadge><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Icon name="users" className="h-4 w-4" />{course._count.enrollments} enrolled students</span></div>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">{course.title}</h1>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">{course.description}</p>
            <div className="mt-5 flex gap-3 text-xs font-bold text-slate-500"><span>{course._count.lessons} lessons</span><span>·</span><span>{course._count.learningTasks} tasks</span></div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link className="btn-primary" to={`/instructor/courses/${course.id}/quizzes/new`}>Create quiz</Link>
            <Link className="btn-secondary" to={`/instructor/courses/${course.id}/edit`}>Edit course</Link>
          </div>
        </div>
      </section>
      <Alert>{error}</Alert>

      <ContentManager title="Lessons" singular="Lesson" bodyLabel="Lesson content" bodyKey="content" items={course.lessons} onCreate={mutate((payload) => instructorCourseApi.createLesson(course.id, payload))} onUpdate={mutate(instructorCourseApi.updateLesson)} onDelete={mutate(instructorCourseApi.removeLesson)} />
      <ContentManager title="Learning tasks" singular="Learning task" bodyLabel="Task description" bodyKey="description" items={course.learningTasks} onCreate={mutate((payload) => instructorCourseApi.createTask(course.id, payload))} onUpdate={mutate(instructorCourseApi.updateTask)} onDelete={mutate(instructorCourseApi.removeTask)} renderAction={(task) => <Link className="btn-secondary" to={`/instructor/tasks/${task.id}/submissions`}>Submissions</Link>} />
    </div>
  )
}
