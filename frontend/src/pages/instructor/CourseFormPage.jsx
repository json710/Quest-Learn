import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { Button } from '../../components/Button.jsx'
import { FormField } from '../../components/FormField.jsx'
import { PageHeader } from '../../components/PageHeader.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { instructorCourseApi } from '../../services/course.service.js'

export function CourseFormPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(courseId)
  const [form, setForm] = useState({ title: '', description: '', isPublished: false })
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editing) return
    instructorCourseApi
      .details(courseId)
      .then((response) => {
        const course = response.data.course
        setForm({
          title: course.title,
          description: course.description,
          isPublished: course.isPublished,
        })
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [courseId, editing])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (form.title.trim().length < 3 || !form.description.trim()) {
      setError('Enter a title of at least 3 characters and a description.')
      return
    }

    setSaving(true)
    try {
      const response = editing
        ? await instructorCourseApi.update(courseId, form)
        : await instructorCourseApi.create(form)
      navigate(`/instructor/courses/${response.data.course.id}`, { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader label="Loading course..." />

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <PageHeader
        eyebrow="Course management"
        title={editing ? 'Edit course' : 'Create course'}
        description="Keep the course information clear and concise."
      />
      <form className="surface-card space-y-6 p-6 sm:p-8" onSubmit={handleSubmit}>
        <Alert>{error}</Alert>
        <FormField label="Course title">
          <input className="form-input" required minLength={3} maxLength={150} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </FormField>
        <FormField label="Description">
          <textarea className="form-input min-h-44 resize-y" required maxLength={10000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </FormField>
        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-violet-200">
          <input className="mt-1 h-4 w-4 accent-violet-600" type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} />
          <span>
            <span className="block text-sm font-semibold text-slate-800">Publish this course</span>
            <span className="mt-1 block text-xs text-slate-500">Published courses are visible in the student catalog.</span>
          </span>
        </label>
        <div className="flex justify-end gap-3">
          <Link className="btn-secondary" to={editing ? `/instructor/courses/${courseId}` : '/instructor/courses'}>Cancel</Link>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Create course'}</Button>
        </div>
      </form>
    </div>
  )
}
