import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { EmptyState } from '../../components/EmptyState.jsx'
import { Icon } from '../../components/Icon.jsx'
import { PageHeader } from '../../components/PageHeader.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { QuizCard } from '../../components/QuizCard.jsx'
import { instructorCourseApi } from '../../services/course.service.js'
import { instructorQuizApi } from '../../services/quiz.service.js'

export function InstructorQuizzesPage() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchQuizGroups = async () => {
    const courseResponse = await instructorCourseApi.list()
    const courseGroups = await Promise.all(courseResponse.data.courses.map(async (course) => {
      const quizResponse = await instructorQuizApi.listForCourse(course.id)
      return { course, quizzes: quizResponse.data.quizzes.map((quiz) => ({ ...quiz, course })) }
    }))
    return courseGroups
  }

  const loadQuizzes = async () => {
    setGroups(await fetchQuizGroups())
  }

  useEffect(() => {
    fetchQuizGroups().then(setGroups).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false))
  }, [])

  const removeQuiz = async (quiz) => {
    if (!window.confirm('Delete "' + quiz.title + '" and all of its attempts?')) return
    setError('')
    setSuccess('')
    try {
      await instructorQuizApi.remove(quiz.id)
      await loadQuizzes()
      setSuccess('Quiz deleted.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  if (loading) return <PageLoader label="Loading quizzes..." />
  const quizCount = groups.reduce((total, group) => total + group.quizzes.length, 0)

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Assessment builder" title="Quizzes" description="Build multiple-choice quizzes for your courses and control when students can access them." />
      <Alert>{error}</Alert><Alert type="success">{success}</Alert>
      {groups.length === 0 ? (
        <EmptyState title="Create a course first" message="Quizzes belong to one of your courses." icon="book" action={<Link className="btn-primary" to="/instructor/courses/new">Create course</Link>} />
      ) : (
        <div className="space-y-9">
          {groups.map(({ course, quizzes }) => (
            <section key={course.id}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-wide text-violet-600">Course</p><h2 className="mt-1 text-xl font-black text-slate-950">{course.title}</h2></div><Link className="btn-primary gap-2" to={'/instructor/courses/' + course.id + '/quizzes/new'}><Icon name="plus" className="h-4 w-4" />Create quiz</Link></div>
              {quizzes.length === 0 ? <EmptyState title="No quizzes for this course" message="Create the first knowledge check for your students." icon="quiz" /> : <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">{quizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} to={'/instructor/quizzes/' + quiz.id + '/edit'} actionLabel="Manage quiz" onDelete={removeQuiz} />)}</div>}
            </section>
          ))}
        </div>
      )}
      {quizCount > 0 && <p className="text-center text-xs font-semibold text-slate-400">{quizCount} total {quizCount === 1 ? 'quiz' : 'quizzes'}</p>}
    </div>
  )
}
