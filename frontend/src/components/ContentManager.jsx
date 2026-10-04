import { useState } from 'react'

import { Alert } from './Alert.jsx'
import { Button } from './Button.jsx'
import { EmptyState } from './EmptyState.jsx'
import { FormField } from './FormField.jsx'

const emptyForm = { title: '', body: '', position: 0 }

export function ContentManager({
  title,
  singular,
  bodyLabel,
  bodyKey,
  items,
  onCreate,
  onUpdate,
  onDelete,
  renderAction,
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
    setError('')
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setForm({ title: item.title, body: item[bodyKey], position: item.position })
    setFormOpen(true)
    setError('')
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.title.trim().length < 3 || !form.body.trim()) {
      setError(`Enter a ${singular.toLowerCase()} title and ${bodyLabel.toLowerCase()}.`)
      return
    }

    setSaving(true)
    const payload = {
      title: form.title,
      [bodyKey]: form.body,
      position: Number(form.position),
    }

    try {
      if (editingId) await onUpdate(editingId, payload)
      else await onCreate(payload)
      setSuccess(`${singular} ${editingId ? 'updated' : 'created'}.`)
      closeForm()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return
    setError('')
    setSuccess('')
    try {
      await onDelete(item.id)
      setSuccess(`${singular} deleted.`)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200/80 bg-slate-100/40 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Course content</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>
        </div>
        <Button variant="secondary" onClick={startCreate}>Add {singular.toLowerCase()}</Button>
      </div>
      <Alert>{error}</Alert>
      <Alert type="success">{success}</Alert>

      {formOpen && (
        <form className="space-y-4 rounded-2xl border border-violet-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
          <h3 className="font-bold text-slate-950">{editingId ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}</h3>
          <FormField label="Title">
            <input className="form-input" required minLength={3} maxLength={150} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </FormField>
          <FormField label={bodyLabel}>
            <textarea className="form-input min-h-32 resize-y" required value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} />
          </FormField>
          <FormField label="Position" hint="Lower numbers appear first.">
            <input className="form-input max-w-32" type="number" min="0" step="1" required value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} />
          </FormField>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeForm}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <EmptyState title={`No ${title.toLowerCase()} yet`} message={`Add the first ${singular.toLowerCase()} for this course.`} />
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <article key={item.id} className="surface-card p-5 transition hover:border-violet-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-wide text-violet-600">{singular} {index + 1}</p>
                  <h3 className="mt-1 font-black text-slate-950">{item.title}</h3>
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item[bodyKey]}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {renderAction?.(item)}
                  <Button variant="secondary" onClick={() => startEdit(item)}>Edit</Button>
                  <Button variant="danger" onClick={() => handleDelete(item)}>Delete</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
