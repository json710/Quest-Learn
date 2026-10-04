import {
  getInstructorSubmission,
  listTaskSubmissions,
  reviewSubmission as reviewSubmissionService,
} from '../services/submission.service.js'

export const listSubmissionsForTask = async (request, response) => {
  const submissions = await listTaskSubmissions(
    request.user.id,
    request.validatedParams.taskId,
  )
  return response.json({ data: { submissions } })
}

export const getSubmission = async (request, response) => {
  const submission = await getInstructorSubmission(
    request.user.id,
    request.validatedParams.submissionId,
  )
  return response.json({ data: { submission } })
}

export const reviewSubmission = async (request, response) => {
  const submission = await reviewSubmissionService(
    request.user.id,
    request.validatedParams.submissionId,
    request.validatedBody,
  )

  return response.json({
    message: 'Submission reviewed successfully',
    data: { submission },
  })
}
