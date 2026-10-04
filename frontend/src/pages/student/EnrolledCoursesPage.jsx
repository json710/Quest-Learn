import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { CourseCard } from '../../components/CourseCard.jsx'
import { EmptyState } from '../../components/EmptyState.jsx'
import { PageHeader } from '../../components/PageHeader.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { studentCourseApi } from '../../services/course.service.js'

export function EnrolledCoursesPage() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    studentCourseApi
      .enrolled()
      .then((response) => setEnrollments(response.data.enrollments))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader label="Loading your courses..." />

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="My learning"
        title="Enrolled courses"
        description="Open a course to view lessons, tasks, and your work."
      />
      <Alert>{error}</Alert>
      {enrollments.length === 0 ? (
        <EmptyState
          title="You are not enrolled yet"
          message="Choose a published course from the catalog to begin."
          action={<Link className="btn-primary" to="/student/courses">Browse courses</Link>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
          {enrollments.map((enrollment) => (
            <CourseCard
              key={enrollment.id}
              course={enrollment.course}
              label="Continue learning"
              to={`/student/courses/${enrollment.course.id}/learning`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
