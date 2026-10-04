const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

export const TOKEN_KEY = 'questlearn_token'

export class ApiError extends Error {
  constructor(message, status, code, details = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = new Headers(options.headers)

  headers.set('Accept', 'application/json')
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError(
      'Unable to connect to the QuestLearn API. Is the backend running?',
      0,
      'NETWORK_ERROR',
    )
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    const error = payload?.error

    if (response.status === 401 && token) {
      window.dispatchEvent(new Event('questlearn:unauthorized'))
    }

    throw new ApiError(
      error?.message || `Request failed with status ${response.status}`,
      response.status,
      error?.code || 'REQUEST_FAILED',
      error?.details || [],
    )
  }

  return payload
}

export const apiUrl = API_URL
