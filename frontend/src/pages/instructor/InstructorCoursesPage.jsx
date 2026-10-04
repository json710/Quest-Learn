import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { Button } from '../../components/Button.jsx'
import { CourseCard } from '../../components/CourseCard.jsx'
import { EmptyState } from '../../components/EmptyState.jsx'
import { PageHeader } from '../../components/PageHeader.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { instructorCourseApi } from '../../services/course.service.js'

export function InstructorCoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    instructorCourseApi
      .list()
      .then((response) => setCourses(response.data.courses))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}" and all of its content?`)) return

    setError('')
    setSuccess('')
    try {
      await instructorCourseApi.remove(course.id)
      setCourses((current) => current.filter((item) => item.id !== course.id))
      setSuccess('Course deleted.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  if (loading) return <PageLoader label="Loading your courses..." />

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Course management"
        title="My courses"
        description="Manage publication, course content, and student work."
        action={<Link className="btn-primary" to="/instructor/courses/new">Create course</Link>}
      />
      <Alert>{error}</Alert>
      <Alert type="success">{success}</Alert>
      {courses.length === 0 ? (
        <EmptyState title="No courses yet" message="Create a course to begin adding lessons and tasks." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="space-y-3">
              <CourseCard course={course} to={`/instructor/courses/${course.id}`} label="Manage course" />
              <div className="flex gap-2">
                <Link className="btn-secondary flex-1" to={`/instructor/courses/${course.id}/edit`}>Edit</Link>
                <Button variant="danger" className="flex-1" onClick={() => handleDelete(course)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
