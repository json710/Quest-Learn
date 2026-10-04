import { useEffect, useMemo, useState } from 'react'

import { Alert } from '../../components/Alert.jsx'
import { AnalyticsBarChart } from '../../components/AnalyticsBarChart.jsx'
import { EmptyState } from '../../components/EmptyState.jsx'
import { LeaderboardRow } from '../../components/LeaderboardRow.jsx'
import { PageHeader } from '../../components/PageHeader.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { StatCard } from '../../components/StatCard.jsx'
import { instructorAnalyticsApi } from '../../services/analytics.service.js'

export function InstructorAnalyticsPage() {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [courseAnalytics, setCourseAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [courseLoading, setCourseLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    instructorAnalyticsApi
      .overview()
      .then(async (response) => {
        const courseList = response.data.courses
        const initialCourseId = courseList[0]?.courseId ?? ''
        setCourses(courseList)
        setSelectedCourseId(initialCourseId)
        if (initialCourseId) {
          const courseResponse = await instructorAnalyticsApi.course(initialCourseId)
          setCourseAnalytics(courseResponse.data)
        }
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  const handleCourseChange = async (event) => {
    const courseId = event.target.value
    setSelectedCourseId(courseId)
    setCourseLoading(true)
    setError('')
    try {
      const response = await instructorAnalyticsApi.course(courseId)
      setCourseAnalytics(response.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setCourseLoading(false)
    }
  }

  const overview = useMemo(() => courses.reduce(
    (totals, course) => ({
      enrollments: totals.enrollments + course.enrolledStudentCount,
      attempts: totals.attempts + course.quizAttempts,
      submissions: totals.submissions + course.submissionCount,
    }),
    { enrollments: 0, attempts: 0, submissions: 0 },
  ), [courses])

  if (loading) return <PageLoader label="Loading course analytics..." />

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Course insights"
        title="Instructor analytics"
        description="Read-only participation and completion summaries for courses you own."
        action={courses.length > 0 && <label className="block text-sm font-bold text-slate-700">Course<select className="form-input mt-1 min-w-64" value={selectedCourseId} onChange={handleCourseChange}>{courses.map((course) => <option key={course.courseId} value={course.courseId}>{course.title}</option>)}</select></label>}
      />
      <Alert>{error}</Alert>

      {courses.length === 0 ? (
        <EmptyState icon="chart" title="No course analytics yet" message="Create a course to begin collecting participation and completion data." />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Owned courses" value={courses.length} icon="layers" accent="violet" />
            <StatCard label="Total enrollments" value={overview.enrollments} icon="users" accent="blue" />
            <StatCard label="Quiz attempts" value={overview.attempts} icon="quiz" accent="emerald" />
            <StatCard label="Task submissions" value={overview.submissions} icon="clipboard" accent="amber" />
          </section>

          <div className="grid gap-5 xl:grid-cols-2">
            <section className="surface-card p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Quiz performance</p><h2 className="mt-1 text-xl font-black text-slate-950">Average score by course</h2><div className="mt-6"><AnalyticsBarChart data={courses} labelKey="title" valueKey="averageQuizScore" maxValue={100} suffix="%" /></div></section>
            <section className="surface-card p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Task participation</p><h2 className="mt-1 text-xl font-black text-slate-950">Submission completion</h2><div className="mt-6"><AnalyticsBarChart data={courses} labelKey="title" valueKey="submissionCompletionRate" maxValue={100} suffix="%" /></div></section>
          </div>

          {courseLoading ? <PageLoader label="Loading selected course..." /> : courseAnalytics && <CourseAnalyticsDetails analytics={courseAnalytics} />}
        </>
      )}
    </div>
  )
}

function CourseAnalyticsDetails({ analytics }) {
  const { course, topStudents } = analytics

  return (
    <section className="space-y-5 border-t border-slate-200 pt-7">
      <div><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Selected course</p><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{course.title}</h2></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Enrolled students" value={course.enrolledStudentCount} icon="users" accent="blue" />
        <StatCard label="Total quizzes" value={course.totalQuizzes} icon="quiz" accent="violet" />
        <StatCard label="Quiz attempts" value={course.quizAttempts} icon="chart" accent="emerald" />
        <StatCard label="Average quiz score" value={`${course.averageQuizScore}%`} icon="trophy" accent="amber" />
        <StatCard label="Learning tasks" value={course.totalLearningTasks} icon="target" accent="violet" />
        <StatCard label="Submissions" value={course.submissionCount} icon="clipboard" accent="blue" />
        <StatCard label="Reviewed" value={course.reviewedSubmissionCount} icon="check" accent="emerald" />
        <StatCard label="Completion rate" value={`${course.submissionCompletionRate}%`} icon="chart" accent="amber" />
      </div>
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-violet-600">Top enrolled students by XP</p>
        {topStudents.length === 0 ? <EmptyState icon="users" title="No enrolled students" message="Top performers will appear after students enroll." /> : <div className="surface-card space-y-2 p-3 sm:p-4">{topStudents.map((student) => <LeaderboardRow key={student.id} entry={student} compact />)}</div>}
      </div>
    </section>
  )
}
