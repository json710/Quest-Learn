import {
  listAvailableBadges,
  listEarnedBadges,
} from '../services/badge.service.js'

export const listBadges = async (_request, response) => {
  const badges = await listAvailableBadges()
  return response.json({ data: { badges } })
}

export const listMyBadges = async (request, response) => {
  const badges = await listEarnedBadges(request.user.id)
  return response.json({ data: { badges } })
}
