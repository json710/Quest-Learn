export const homeForRole = (role) => {
  if (role === 'ADMIN') return '/admin'
  if (role === 'INSTRUCTOR') return '/instructor'
  if (role === 'STUDENT') return '/student'
  return '/unauthorized'
}
