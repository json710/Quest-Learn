export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  xp: true,
  level: true,
  createdAt: true,
  updatedAt: true,
}

export const toPublicUser = ({ password: _password, ...user }) => user
