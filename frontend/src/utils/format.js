export const formatDate = (value) =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(new Date(value))

export const excerpt = (value, length = 140) =>
  value.length > length ? `${value.slice(0, length).trim()}...` : value
