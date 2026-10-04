import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { Button } from '../../components/Button.jsx'
import { FormField } from '../../components/FormField.jsx'
import { Icon } from '../../components/Icon.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { QuizQuestionBuilder } from '../../components/QuizQuestionBuilder.jsx'
import { StatusBadge } from '../../components/StatusBadge.jsx'
import { instructorCourseApi } from '../../services/course.service.js'
import { instructorQuizApi } from '../../services/quiz.service.js'

const emptyForm = { title: '', description: '', lessonId: '' }

export function QuizEditorPage() {
  const { courseId, quizId } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(quizId)
  const [course, setCourse] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const refreshQuiz = async () => {
    const response = await instructorQuizApi.details(quizId)
    setQuiz(response.data.quiz)
  }

  useEffect(() => {
    const load = async () => {
      if (editing) {
        const quizResponse = await instructorQuizApi.details(quizId)
        const loadedQuiz = quizResponse.data.quiz
        const courseResponse = await instructorCourseApi.details(loadedQuiz.courseId)
        setQuiz(loadedQuiz)
        setCourse(courseResponse.data.course)
        setForm({ title: loadedQuiz.title, description: loadedQuiz.description, lessonId: loadedQuiz.lessonId ?? '' })
      } else {
        const courseResponse = await instructorCourseApi.details(courseId)
        setCourse(courseResponse.data.course)
      }
    }
    load().catch((requestError) => setError(requestError.message)).finally(() => setLoading(false))
  }, [courseId, editing, quizId])

  const saveQuiz = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (form.title.trim().length < 3 || !form.description.trim()) {
      setError('Enter a title of at least 3 characters and a description.')
      return
    }
    const payload = { title: form.title, description: form.description, lessonId: form.lessonId || null }
    setSaving(true)
    try {
      if (editing) {
        const response = await instructorQuizApi.update(quizId, payload)
        setQuiz(response.data.quiz)
        setSuccess('Quiz details updated.')
      } else {
        const response = await instructorQuizApi.create(courseId, payload)
        navigate('/instructor/quizzes/' + response.data.quiz.id + '/edit', { replace: true })
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const changePublication = async () => {
    const nextState = !quiz.isPublished
    if (nextState && !window.confirm('Publish this quiz for enrolled students?')) return
    setError('')
    setSuccess('')
    setPublishing(true)
    try {
      const response = await instructorQuizApi.publication(quiz.id, nextState)
      setQuiz(response.data.quiz)
      setSuccess(nextState ? 'Quiz published.' : 'Quiz unpublished.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setPublishing(false)
    }
  }

  if (loading) return <PageLoader label="Loading quiz builder..." />
  if (!course) return <Alert>{error || 'Course was not found.'}</Alert>

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <Link className="back-link" to="/instructor/quizzes"><Icon name="arrowLeft" className="h-4 w-4" />All quizzes</Link>
      <header className="surface-card flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
        <div><p className="text-xs font-black uppercase tracking-wide text-violet-600">{course.title}</p><h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">{editing ? 'Quiz builder' : 'Create quiz'}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{editing ? 'Manage quiz details, questions, answer options, and publication.' : 'Create the quiz details first, then add questions and options.'}</p></div>
        {quiz && <div className="flex flex-wrap items-center gap-3"><StatusBadge status={quiz.isPublished ? 'PUBLISHED' : 'DRAFT'}>{quiz.isPublished ? 'Published' : 'Draft'}</StatusBadge><Button variant={quiz.isPublished ? 'secondary' : 'primary'} onClick={changePublication} disabled={publishing}>{publishing ? 'Updating...' : quiz.isPublished ? 'Unpublish' : 'Publish quiz'}</Button></div>}
      </header>
      <Alert>{error}</Alert><Alert type="success">{success}</Alert>
      <form className="surface-card space-y-5 p-6 sm:p-8" onSubmit={saveQuiz}>
        <div><p className="text-xs font-black uppercase tracking-wide text-violet-600">Quiz details</p><h2 className="mt-1 text-xl font-black text-slate-950">Overview</h2></div>
        <FormField label="Quiz title"><input className="form-input" required minLength={3} maxLength={150} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></FormField>
        <FormField label="Description"><textarea className="form-input min-h-32 resize-y" required maxLength={10000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></FormField>
        <FormField label="Related lesson" hint="Optional. Students still access the quiz through its course."><select className="form-input" value={form.lessonId} onChange={(event) => setForm({ ...form, lessonId: event.target.value })}><option value="">No specific lesson</option>{course.lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}</select></FormField>
        <div className="flex justify-end"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save details' : 'Create quiz'}</Button></div>
      </form>
      {quiz && <QuizQuestionBuilder quiz={quiz} onRefresh={refreshQuiz} />}
    </div>
  )
}
