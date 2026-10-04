import { useEffect, useState } from 'react'

import { Alert } from '../../components/Alert.jsx'
import { CourseCard } from '../../components/CourseCard.jsx'
import { EmptyState } from '../../components/EmptyState.jsx'
import { PageHeader } from '../../components/PageHeader.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { studentCourseApi } from '../../services/course.service.js'

export function BrowseCoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    studentCourseApi
      .browse()
      .then((response) => setCourses(response.data.courses))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader label="Loading available courses..." />

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Course catalog"
        title="Browse courses"
        description="Explore published courses and enroll when you are ready."
      />
      <Alert>{error}</Alert>
      {courses.length === 0 ? (
        <EmptyState
          title="No courses available"
          message="Published courses from instructors will appear here."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              to={`/student/courses/${course.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
