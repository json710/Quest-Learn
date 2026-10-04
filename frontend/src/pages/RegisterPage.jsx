import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Alert } from '../components/Alert.jsx'
import { Button } from '../components/Button.jsx'
import { FormField } from '../components/FormField.jsx'
import { useAuth } from '../hooks/useAuth.js'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      navigate('/student', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const updateField = (field) => (event) =>
    setForm({ ...form, [field]: event.target.value })

  return (
    <div>
      <p className="text-sm font-black uppercase tracking-[0.2em] text-violet-600">
        Student registration
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        New registrations start with the student role.
      </p>

      <form className="surface-card mt-8 space-y-5 p-5 sm:p-6" onSubmit={handleSubmit}>
        <Alert>{error}</Alert>
        <FormField label="Full name">
          <input
            className="form-input"
            autoComplete="name"
            minLength={2}
            required
            value={form.name}
            onChange={updateField('name')}
          />
        </FormField>
        <FormField label="Email address">
          <input
            className="form-input"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={updateField('email')}
          />
        </FormField>
        <FormField label="Password" hint="Use at least 8 characters.">
          <input
            className="form-input"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={form.password}
            onChange={updateField('password')}
          />
        </FormField>
        <FormField label="Confirm password">
          <input
            className="form-input"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={form.confirmPassword}
            onChange={updateField('confirmPassword')}
          />
        </FormField>
        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-600">
        Already registered?{' '}
        <Link className="font-bold text-violet-700 hover:text-violet-900" to="/login">
          Sign in
        </Link>
      </p>
    </div>
  )
}
