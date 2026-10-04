import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { Button } from '../../components/Button.jsx'
import { Icon } from '../../components/Icon.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { studentCourseApi } from '../../services/course.service.js'

export function CourseDetailsPage() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    studentCourseApi.details(courseId).then((response) => setCourse(response.data.course)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false))
  }, [courseId])

  const handleEnroll = async () => {
    setError('')
    setSuccess('')
    setEnrolling(true)
    try {
      await studentCourseApi.enroll(courseId)
      setSuccess('Enrollment successful. You can now access the learning content.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <PageLoader label="Loading course details..." />
  if (!course) return <Alert>{error || 'Course was not found.'}</Alert>

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link className="back-link" to="/student/courses"><Icon name="arrowLeft" className="h-4 w-4" />Back to courses</Link>
      <section className="surface-card overflow-hidden">
        <div className="relative overflow-hidden bg-violet-700 px-6 py-8 text-white sm:px-9 sm:py-10">
          <div className="absolute -top-14 -right-12 h-44 w-44 rounded-full border-[28px] border-white/5" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-violet-100 ring-1 ring-white/15"><Icon name="book" className="h-4 w-4" />Published course</div>
            <h1 className="mt-5 text-3xl font-black tracking-[-0.035em] sm:text-4xl">{course.title}</h1>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-violet-100 sm:text-base">{course.description}</p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <Detail icon="users" label="Instructor" value={course.instructor.name} />
            <Detail icon="file" label="Lessons" value={course._count.lessons} />
            <Detail icon="target" label="Learning tasks" value={course._count.learningTasks} />
          </div>
          <div className="mt-7 border-t border-slate-100 pt-6">
            <Alert>{error}</Alert><Alert type="success">{success}</Alert>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={handleEnroll} disabled={enrolling || Boolean(success)}>{enrolling ? 'Enrolling...' : success ? 'Enrolled' : 'Enroll in course'}</Button>
              {success && <Link className="btn-secondary gap-2" to={`/student/courses/${course.id}/learning`}>Start learning <Icon name="arrowRight" className="h-4 w-4" /></Link>}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Detail({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-violet-700 shadow-xs"><Icon name={icon} className="h-5 w-5" /></span>
      <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-0.5 font-black text-slate-900">{value}</p></div>
    </div>
  )
}

