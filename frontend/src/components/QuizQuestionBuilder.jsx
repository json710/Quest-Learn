import { useState } from 'react'

import { instructorQuizApi } from '../services/quiz.service.js'
import { Alert } from './Alert.jsx'
import { Button } from './Button.jsx'
import { EmptyState } from './EmptyState.jsx'
import { FormField } from './FormField.jsx'
import { Icon } from './Icon.jsx'

export function QuizQuestionBuilder({ quiz, onRefresh }) {
  const [form, setForm] = useState({ text: '', order: quiz.questions.length })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addQuestion = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.text.trim()) {
      setError('Question text is required.')
      return
    }
    setSaving(true)
    try {
      await instructorQuizApi.createQuestion(quiz.id, { text: form.text, order: Number(form.order) })
      setForm({ text: '', order: quiz.questions.length + 1 })
      await onRefresh()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200/80 bg-slate-100/40 p-4 sm:p-6">
      <div><p className="text-xs font-black uppercase tracking-wide text-violet-600">Question builder</p><h2 className="mt-1 text-2xl font-black text-slate-950">Multiple-choice questions</h2><p className="mt-2 text-sm text-slate-500">Each published question needs at least two options and exactly one correct answer.</p></div>
      <Alert>{error}</Alert>
      {quiz.questions.length === 0 ? <EmptyState title="No questions yet" message="Add the first question below, then create its answer options." icon="quiz" /> : <div className="space-y-5">{quiz.questions.map((question, index) => <QuestionEditor key={question.id + JSON.stringify(question.options)} question={question} number={index + 1} onRefresh={onRefresh} />)}</div>}
      <form className="surface-card space-y-4 p-5 sm:p-6" onSubmit={addQuestion}>
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-700"><Icon name="plus" className="h-5 w-5" /></span><h3 className="font-black text-slate-950">Add question</h3></div>
        <FormField label="Question text"><textarea className="form-input min-h-28 resize-y" maxLength={5000} required value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} /></FormField>
        <FormField label="Order"><input className="form-input max-w-28" type="number" min="0" step="1" required value={form.order} onChange={(event) => setForm({ ...form, order: event.target.value })} /></FormField>
        <div className="flex justify-end"><Button type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add question'}</Button></div>
      </form>
    </section>
  )
}

function QuestionEditor({ question, number, onRefresh }) {
  const [form, setForm] = useState({ text: question.text, order: question.order })
  const [drafts, setDrafts] = useState(
    Object.fromEntries(question.options.map((option) => [option.id, option.text])),
  )
  const [newOption, setNewOption] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const run = async (operation, message) => {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await operation()
      await onRefresh()
      setSuccess(message)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const saveQuestion = (event) => {
    event.preventDefault()
    return run(() => instructorQuizApi.updateQuestion(question.id, { text: form.text, order: Number(form.order) }), 'Question updated.')
  }

  const deleteQuestion = async () => {
    if (!window.confirm('Delete this question and its options?')) return
    await run(() => instructorQuizApi.removeQuestion(question.id), 'Question deleted.')
  }

  const addOption = async (event) => {
    event.preventDefault()
    if (!newOption.trim()) {
      setError('Option text is required.')
      return
    }
    const hasCorrect = question.options.some((option) => option.isCorrect)
    await run(() => instructorQuizApi.createOption(question.id, { text: newOption, isCorrect: !hasCorrect }), 'Option added.')
    setNewOption('')
  }

  const saveOption = (option) => run(() => instructorQuizApi.updateOption(option.id, { text: drafts[option.id] }), 'Option updated.')
  const markCorrect = (option) => run(() => instructorQuizApi.updateOption(option.id, { isCorrect: true }), 'Correct answer updated.')
  const deleteOption = async (option) => {
    if (!window.confirm('Delete this answer option?')) return
    await run(() => instructorQuizApi.removeOption(option.id), 'Option deleted.')
  }

  const ready = question.options.length >= 2 && question.options.filter((option) => option.isCorrect).length === 1

  return (
    <article className="surface-card overflow-hidden">
      <form className="border-b border-slate-100 p-5 sm:p-6" onSubmit={saveQuestion}>
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100 text-sm font-black text-violet-700">{number}</span><div><p className="font-black text-slate-950">Question {number}</p><p className={'text-xs font-bold ' + (ready ? 'text-emerald-600' : 'text-amber-600')}>{ready ? 'Ready to publish' : 'Needs valid options'}</p></div></div><Button type="button" variant="danger" onClick={deleteQuestion} disabled={saving}>Delete</Button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_110px]"><FormField label="Question text"><textarea className="form-input min-h-24 resize-y" required value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} /></FormField><FormField label="Order"><input className="form-input" type="number" min="0" step="1" required value={form.order} onChange={(event) => setForm({ ...form, order: event.target.value })} /></FormField></div>
        <div className="mt-4 flex justify-end"><Button type="submit" variant="secondary" disabled={saving}>Save question</Button></div>
      </form>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wide text-violet-600">Answer options</p><p className="mt-1 text-xs text-slate-500">Select the radio button for the one correct answer.</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{question.options.length} options</span></div>
        <Alert>{error}</Alert><Alert type="success">{success}</Alert>
        <div className="mt-4 space-y-3">{question.options.map((option) => (
          <div key={option.id} className={'flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center ' + (option.isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white')}>
            <label className="flex shrink-0 items-center gap-2 text-xs font-black text-slate-600"><input className="h-4 w-4 accent-emerald-600" type="radio" name={'correct-' + question.id} checked={option.isCorrect} onChange={() => markCorrect(option)} disabled={saving} />Correct</label>
            <input className="form-input flex-1" value={drafts[option.id] ?? ''} onChange={(event) => setDrafts({ ...drafts, [option.id]: event.target.value })} />
            <div className="flex gap-2"><Button type="button" variant="secondary" onClick={() => saveOption(option)} disabled={saving}>Save</Button><Button type="button" variant="danger" onClick={() => deleteOption(option)} disabled={saving}>Delete</Button></div>
          </div>
        ))}</div>
        <form className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-3 sm:flex-row" onSubmit={addOption}><input className="form-input flex-1" placeholder="New answer option" maxLength={1000} value={newOption} onChange={(event) => setNewOption(event.target.value)} /><Button type="submit" disabled={saving}>Add option</Button></form>
      </div>
    </article>
  )
}
