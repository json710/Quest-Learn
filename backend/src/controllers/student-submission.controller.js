import {
  getStudentSubmissionForTask,
  listStudentSubmissions,
  submitWork,
  updateStudentSubmission,
} from '../services/submission.service.js'

export const createSubmission = async (request, response) => {
  const submission = await submitWork(
    request.user.id,
    request.validatedParams.taskId,
    request.validatedBody,
  )

  return response.status(201).json({
    message: 'Submission created successfully',
    data: { submission },
  })
}

export const updateSubmission = async (request, response) => {
  const submission = await updateStudentSubmission(
    request.user.id,
    request.validatedParams.submissionId,
    request.validatedBody,
  )

  return response.json({
    message: 'Submission updated successfully',
    data: { submission },
  })
}

export const getTaskSubmission = async (request, response) => {
  const submission = await getStudentSubmissionForTask(
    request.user.id,
    request.validatedParams.taskId,
  )
  return response.json({ data: { submission } })
}

export const listSubmissions = async (request, response) => {
  const submissions = await listStudentSubmissions(request.user.id)
  return response.json({ data: { submissions } })
}
