import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Alert } from '../components/Alert.jsx'
import { Button } from '../components/Button.jsx'
import { FormField } from '../components/FormField.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { homeForRole } from '../utils/routes.js'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const user = await login(form)
      const requestedPath = location.state?.from?.pathname
      navigate(requestedPath || homeForRole(user.role), { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <p className="text-sm font-black uppercase tracking-[0.2em] text-violet-600">
        Welcome back
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
        Sign in to QuestLearn
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Use your student, instructor, or administrator account.
      </p>

      <form className="surface-card mt-8 space-y-5 p-5 sm:p-6" onSubmit={handleSubmit}>
        <Alert>{error}</Alert>
        <FormField label="Email address">
          <input
            className="form-input"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </FormField>
        <FormField label="Password">
          <input
            className="form-input"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </FormField>
        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-600">
        New student?{' '}
        <Link className="font-bold text-violet-700 hover:text-violet-900" to="/register">
          Create an account
        </Link>
      </p>
    </div>
  )
}
