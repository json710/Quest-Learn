import {
  changePassword,
  loginUser,
  registerUser,
  updateProfile,
} from '../services/auth.service.js'

export const register = async (request, response) => {
  const result = await registerUser(request.validatedBody)

  return response.status(201).json({
    message: 'Registration successful',
    data: result,
  })
}

export const login = async (request, response) => {
  const result = await loginUser(request.validatedBody)

  return response.json({
    message: 'Login successful',
    data: result,
  })
}

export const getCurrentUser = (request, response) =>
  response.json({ data: { user: request.user } })

export const updateCurrentProfile = async (request, response) => {
  const user = await updateProfile(request.user.id, request.validatedBody)
  return response.json({
    message: 'Profile updated successfully',
    data: { user },
  })
}

export const changeCurrentPassword = async (request, response) => {
  const user = await changePassword(request.user.id, request.validatedBody)
  return response.json({
    message: 'Password changed successfully',
    data: { user },
  })
}
