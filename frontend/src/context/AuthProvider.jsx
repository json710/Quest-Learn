import { useCallback, useEffect, useMemo, useState } from 'react'

import { authApi } from '../services/auth.service.js'
import { TOKEN_KEY } from '../services/api.js'
import { AuthContext } from './auth-context.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    const restoreSession = async () => {
      if (!localStorage.getItem(TOKEN_KEY)) {
        setLoading(false)
        return
      }

      try {
        const response = await authApi.me()
        setUser(response.data.user)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  useEffect(() => {
    window.addEventListener('questlearn:unauthorized', logout)
    return () => window.removeEventListener('questlearn:unauthorized', logout)
  }, [logout])

  const authenticate = useCallback((response) => {
    localStorage.setItem(TOKEN_KEY, response.data.token)
    setUser(response.data.user)
    return response.data.user
  }, [])

  const refreshUser = useCallback(async () => {
    const response = await authApi.me()
    setUser(response.data.user)
    return response.data.user
  }, [])

  const login = useCallback(
    async (credentials) => authenticate(await authApi.login(credentials)),
    [authenticate],
  )

  const register = useCallback(
    async (details) => authenticate(await authApi.register(details)),
    [authenticate],
  )

  const updateProfile = useCallback(async (profile) => {
    const response = await authApi.updateProfile(profile)
    setUser(response.data.user)
    return response.data.user
  }, [])

  const changePassword = useCallback(
    async (passwords) => authApi.changePassword(passwords),
    [],
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
      changePassword,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
      changePassword,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
