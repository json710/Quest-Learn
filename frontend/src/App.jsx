import { Navigate, Route, Routes } from 'react-router-dom'

import { PageLoader } from './components/PageLoader.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { useAuth } from './hooks/useAuth.js'
import { AppLayout } from './layouts/AppLayout.jsx'
import { AuthLayout } from './layouts/AuthLayout.jsx'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx'
import { AdminUsersPage } from './pages/admin/AdminUsersPage.jsx'
import { CourseFormPage } from './pages/instructor/CourseFormPage.jsx'
import { InstructorCourseDetailsPage } from './pages/instructor/InstructorCourseDetailsPage.jsx'
import { InstructorCoursesPage } from './pages/instructor/InstructorCoursesPage.jsx'
import { InstructorDashboardPage } from './pages/instructor/InstructorDashboardPage.jsx'
import { InstructorQuizzesPage } from './pages/instructor/InstructorQuizzesPage.jsx'
import { InstructorAnalyticsPage } from './pages/instructor/InstructorAnalyticsPage.jsx'
import { QuizEditorPage } from './pages/instructor/QuizEditorPage.jsx'
import { ReviewSubmissionPage } from './pages/instructor/ReviewSubmissionPage.jsx'
import { TaskSubmissionsPage } from './pages/instructor/TaskSubmissionsPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { ProfileSettingsPage } from './pages/ProfileSettingsPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { BrowseCoursesPage } from './pages/student/BrowseCoursesPage.jsx'
import { CourseDetailsPage } from './pages/student/CourseDetailsPage.jsx'
import { EnrolledCoursesPage } from './pages/student/EnrolledCoursesPage.jsx'
import { LearningPage } from './pages/student/LearningPage.jsx'
import { QuizAttemptPage } from './pages/student/QuizAttemptPage.jsx'
import { QuizResultPage } from './pages/student/QuizResultPage.jsx'
import { StudentBadgesPage } from './pages/student/StudentBadgesPage.jsx'
import { StudentAnalyticsPage } from './pages/student/StudentAnalyticsPage.jsx'
import { StudentQuizzesPage } from './pages/student/StudentQuizzesPage.jsx'
import { StudentDashboardPage } from './pages/student/StudentDashboardPage.jsx'
import { StudentLeaderboardPage } from './pages/student/StudentLeaderboardPage.jsx'
import { StudentSubmissionsPage } from './pages/student/StudentSubmissionsPage.jsx'
import { UnauthorizedPage } from './pages/UnauthorizedPage.jsx'
import { homeForRole } from './utils/routes.js'

function App() {
  return (
    <Routes>
      <Route index element={<HomeRedirect />} />
      <Route element={<AuthLayout />}>
        <Route path="login" element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
      </Route>

      <Route element={<ProtectedRoute roles={['STUDENT']} />}>
        <Route element={<AppLayout />}>
          <Route path="student" element={<StudentDashboardPage />} />
          <Route path="student/courses" element={<BrowseCoursesPage />} />
          <Route path="student/courses/:courseId" element={<CourseDetailsPage />} />
          <Route path="student/courses/:courseId/learning" element={<LearningPage />} />
          <Route path="student/enrolled" element={<EnrolledCoursesPage />} />
          <Route path="student/quizzes" element={<StudentQuizzesPage />} />
          <Route path="student/badges" element={<StudentBadgesPage />} />
          <Route path="student/leaderboard" element={<StudentLeaderboardPage />} />
          <Route path="student/analytics" element={<StudentAnalyticsPage />} />
          <Route path="student/quizzes/:quizId" element={<QuizAttemptPage />} />
          <Route path="student/quiz-attempts/:attemptId" element={<QuizResultPage />} />
          <Route path="student/submissions" element={<StudentSubmissionsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['INSTRUCTOR']} />}>
        <Route element={<AppLayout />}>
          <Route path="instructor" element={<InstructorDashboardPage />} />
          <Route path="instructor/courses" element={<InstructorCoursesPage />} />
          <Route path="instructor/courses/new" element={<CourseFormPage />} />
          <Route path="instructor/courses/:courseId" element={<InstructorCourseDetailsPage />} />
          <Route path="instructor/courses/:courseId/edit" element={<CourseFormPage />} />
          <Route path="instructor/quizzes" element={<InstructorQuizzesPage />} />
          <Route path="instructor/analytics" element={<InstructorAnalyticsPage />} />
          <Route path="instructor/courses/:courseId/quizzes/new" element={<QuizEditorPage />} />
          <Route path="instructor/quizzes/:quizId/edit" element={<QuizEditorPage />} />
          <Route path="instructor/tasks/:taskId/submissions" element={<TaskSubmissionsPage />} />
          <Route path="instructor/submissions/:submissionId" element={<ReviewSubmissionPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route element={<AppLayout />}>
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['STUDENT', 'INSTRUCTOR']} />}>
        <Route element={<AppLayout />}>
          <Route path="profile" element={<ProfileSettingsPage />} />
        </Route>
      </Route>

      <Route path="unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function HomeRedirect() {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader label="Opening QuestLearn..." />
  return <Navigate to={user ? homeForRole(user.role) : '/login'} replace />
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />
  if (user) return <Navigate to={homeForRole(user.role)} replace />
  return children
}

export default App
