import { useState } from 'react'

import { Alert } from '../components/Alert.jsx'
import { Button } from '../components/Button.jsx'
import { FormField } from '../components/FormField.jsx'
import { Icon } from '../components/Icon.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { useAuth } from '../hooks/useAuth.js'

export function ProfileSettingsPage() {
  const { user, updateProfile, changePassword } = useAuth()
  const [profile, setProfile] = useState({ name: user.name, email: user.email })
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    if (profile.name.trim().length < 2) {
      setProfileError('Name must be at least 2 characters.')
      return
    }

    setProfileSaving(true)
    try {
      const updatedUser = await updateProfile({
        name: profile.name,
        email: profile.email,
      })
      setProfile({ name: updatedUser.name, email: updatedUser.email })
      setProfileSuccess('Profile information updated.')
    } catch (requestError) {
      setProfileError(requestError.message)
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwords.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setPasswordSaving(true)
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordSuccess('Password changed successfully.')
    } catch (requestError) {
      setPasswordError(requestError.message)
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Account" title="Profile settings" description="Update your personal information or choose a new account password." />

      <section className="surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-violet-600 text-lg font-black text-white"><Icon name="settings" className="h-7 w-7" /></span>
        <div><h2 className="text-lg font-black text-slate-950">{user.name}</h2><p className="mt-1 text-sm text-slate-500">{user.email}</p><p className="mt-2 text-xs font-black uppercase tracking-wide text-violet-600">{user.role.toLowerCase()} account</p></div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
        <form className="surface-card space-y-5 p-5 sm:p-6" onSubmit={handleProfileSubmit}>
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Personal details</p><h2 className="mt-1 text-xl font-black text-slate-950">Profile information</h2><p className="mt-1 text-sm text-slate-500">Your role and learning progress cannot be changed here.</p></div>
          <Alert>{profileError}</Alert>
          <Alert type="success">{profileSuccess}</Alert>
          <FormField label="Name"><input className="form-input" autoComplete="name" minLength={2} maxLength={100} required value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></FormField>
          <FormField label="Email"><input className="form-input" type="email" autoComplete="email" maxLength={254} required value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></FormField>
          <Button type="submit" disabled={profileSaving}>{profileSaving ? 'Saving...' : 'Save changes'}</Button>
        </form>

        <form className="surface-card space-y-5 p-5 sm:p-6" onSubmit={handlePasswordSubmit}>
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Security</p><h2 className="mt-1 text-xl font-black text-slate-950">Change password</h2><p className="mt-1 text-sm text-slate-500">Confirm your current password before choosing a new one.</p></div>
          <Alert>{passwordError}</Alert>
          <Alert type="success">{passwordSuccess}</Alert>
          <FormField label="Current password"><input className="form-input" type="password" autoComplete="current-password" required value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} /></FormField>
          <FormField label="New password" hint="Use at least 8 characters."><input className="form-input" type="password" autoComplete="new-password" minLength={8} required value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} /></FormField>
          <FormField label="Confirm new password"><input className="form-input" type="password" autoComplete="new-password" minLength={8} required value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} /></FormField>
          <Button type="submit" disabled={passwordSaving}>{passwordSaving ? 'Changing...' : 'Change password'}</Button>
        </form>
      </div>
    </div>
  )
}
