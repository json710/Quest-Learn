import { useEffect, useState } from 'react'

import { Alert } from '../../components/Alert.jsx'
import { Button } from '../../components/Button.jsx'
import { EmptyState } from '../../components/EmptyState.jsx'
import { PageHeader } from '../../components/PageHeader.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { StatusBadge } from '../../components/StatusBadge.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { adminApi } from '../../services/admin.service.js'
import { formatDate } from '../../utils/format.js'

const roles = ['STUDENT', 'INSTRUCTOR', 'ADMIN']

export function AdminUsersPage() {
  const { user: currentAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState({ page: 1, limit: 20, role: '', status: '', search: '' })
  const [searchDraft, setSearchDraft] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false
    adminApi
      .users(filters)
      .then((response) => {
        if (cancelled) return
        setUsers(response.data.users)
        setPagination(response.data.pagination)
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [filters])

  const applyFilters = (changes) => {
    setLoading(true)
    setError('')
    setFilters((current) => ({ ...current, ...changes }))
  }

  const handleSearch = (event) => {
    event.preventDefault()
    applyFilters({ page: 1, search: searchDraft.trim() })
  }

  const updateVisibleUser = (updatedUser) => {
    setUsers((current) => current.map((user) => user.id === updatedUser.id ? updatedUser : user))
    setSelectedUser((current) => current?.id === updatedUser.id ? { ...current, ...updatedUser } : current)
  }

  const handleRoleChange = async (user, role) => {
    if (role === user.role) return
    if (!window.confirm(`Change ${user.name}'s role from ${user.role} to ${role}?`)) return

    setUpdatingId(user.id)
    setError('')
    setSuccess('')
    try {
      const response = await adminApi.updateRole(user.id, role)
      updateVisibleUser(response.data.user)
      setSuccess(`${user.name}'s role was updated.`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdatingId('')
    }
  }

  const handleStatusChange = async (user) => {
    const nextStatus = !user.isActive
    const action = nextStatus ? 'reactivate' : 'deactivate'
    if (!window.confirm(`${action[0].toUpperCase() + action.slice(1)} ${user.name}'s account?`)) return

    setUpdatingId(user.id)
    setError('')
    setSuccess('')
    try {
      const response = await adminApi.updateStatus(user.id, nextStatus)
      updateVisibleUser(response.data.user)
      setSuccess(`${user.name}'s account was ${nextStatus ? 'reactivated' : 'deactivated'}.`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdatingId('')
    }
  }

  const showDetails = async (userId) => {
    setError('')
    try {
      const response = await adminApi.user(userId)
      setSelectedUser(response.data.user)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Administration" title="User management" description="Review accounts, change roles, and safely activate or deactivate access." />
      <Alert>{error}</Alert>
      <Alert type="success">{success}</Alert>

      <section className="surface-card p-4 sm:p-5">
        <form className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px_auto]" onSubmit={handleSearch}>
          <input className="form-input" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search name or email" aria-label="Search users" />
          <select className="form-input" value={filters.role} onChange={(event) => applyFilters({ page: 1, role: event.target.value })} aria-label="Filter by role"><option value="">All roles</option>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select>
          <select className="form-input" value={filters.status} onChange={(event) => applyFilters({ page: 1, status: event.target.value })} aria-label="Filter by status"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
          <Button type="submit">Search</Button>
        </form>
      </section>

      {selectedUser && <UserDetails user={selectedUser} onClose={() => setSelectedUser(null)} />}

      {loading ? <PageLoader label="Loading users..." /> : users.length === 0 ? (
        <EmptyState icon="users" title="No users found" message="Try changing the current role, status, or search filters." />
      ) : (
        <section className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">User</th><th className="px-4 py-4">Role</th><th className="px-4 py-4">Level</th><th className="px-4 py-4">XP</th><th className="px-4 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isSelf = user.id === currentAdmin.id
                  const updating = updatingId === user.id
                  return <tr key={user.id} className={isSelf ? 'bg-violet-50/60' : 'bg-white'}><td className="px-5 py-4"><p className="font-black text-slate-950">{user.name}{isSelf && <span className="ml-2 text-xs text-violet-600">You</span>}</p><p className="mt-0.5 text-xs text-slate-500">{user.email}</p></td><td className="px-4 py-4"><select className="form-input min-w-36 py-2" value={user.role} disabled={isSelf || updating} onChange={(event) => handleRoleChange(user, event.target.value)}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></td><td className="px-4 py-4 font-bold text-slate-700">{user.level}</td><td className="px-4 py-4 font-black text-violet-700">{user.xp.toLocaleString()}</td><td className="px-4 py-4"><StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'}>{user.isActive ? 'Active' : 'Inactive'}</StatusBadge></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => showDetails(user.id)}>Details</Button><Button variant={user.isActive ? 'danger' : 'secondary'} disabled={isSelf || updating} onClick={() => handleStatusChange(user)}>{updating ? 'Saving...' : user.isActive ? 'Deactivate' : 'Reactivate'}</Button></div></td></tr>
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-slate-500">{pagination.total} users · Page {pagination.page} of {Math.max(1, pagination.totalPages)}</p><div className="flex gap-2"><Button variant="secondary" disabled={pagination.page <= 1} onClick={() => applyFilters({ page: pagination.page - 1 })}>Previous</Button><Button variant="secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => applyFilters({ page: pagination.page + 1 })}>Next</Button></div></div>
        </section>
      )}
    </div>
  )
}

function UserDetails({ user, onClose }) {
  const counts = user._count
  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Account details</p><h2 className="mt-1 text-xl font-black text-slate-950">{user.name}</h2><p className="mt-1 text-sm text-slate-500">{user.email} · Joined {formatDate(user.createdAt)}</p></div><Button variant="ghost" onClick={onClose}>Close</Button></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[['Courses taught', counts?.taughtCourses], ['Enrollments', counts?.enrollments], ['Submissions', counts?.submissions], ['Quiz attempts', counts?.quizAttempts], ['Badges', counts?.badges]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-xl font-black text-slate-950">{value ?? 0}</p><p className="text-xs font-semibold text-slate-500">{label}</p></div>)}</div>
    </section>
  )
}
