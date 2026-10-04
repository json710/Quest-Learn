import { getStudentLeaderboard } from '../services/leaderboard.service.js'

export const getLeaderboard = async (request, response) => {
  const leaderboard = await getStudentLeaderboard(request.user.id)
  return response.json({ data: leaderboard })
}
