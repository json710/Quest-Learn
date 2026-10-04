import {
  getAdminOverview,
  getAdminUser,
  listAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '../services/admin.service.js'

export const overview = async (_request, response) => {
  const summary = await getAdminOverview()
  return response.json({ data: { summary } })
}

export const listUsers = async (request, response) => {
  const result = await listAdminUsers(request.validatedQuery)
  return response.json({ data: result })
}

export const getUser = async (request, response) => {
  const user = await getAdminUser(request.validatedParams.userId)
  return response.json({ data: { user } })
}

export const updateUserRole = async (request, response) => {
  const user = await updateAdminUserRole(
    request.user.id,
    request.validatedParams.userId,
    request.validatedBody.role,
  )
  return response.json({ message: 'User role updated successfully', data: { user } })
}

export const updateUserStatus = async (request, response) => {
  const user = await updateAdminUserStatus(
    request.user.id,
    request.validatedParams.userId,
    request.validatedBody.isActive,
  )
  return response.json({ message: 'User status updated successfully', data: { user } })
}
