# QuestLearn

## Online demo deployment (Render)

The root `render.yaml` creates one Express web service serving both the built
React app and `/api`, plus a separate PostgreSQL database. Database credentials
are injected by Render and the JWT secret is generated automatically. Your local
`.env` and local users/courses are not uploaded or copied to this new database.

1. Sign in at https://dashboard.render.com/ using your GitHub account.
2. Select **New > Blueprint** and connect `json710/Quest-Learn`, branch `main`.
3. Review `questlearn` and `questlearn-db`; both should show the **Free** plan.
   If a paid plan is shown, stop and review the price before deploying.
4. Deploy the Blueprint and wait for the database and web service to become ready.
   The build installs dependencies, generates Prisma Client, and builds React.
   Startup applies the checked-in migrations before starting Express.
5. Open the web service's actual Render URL, register a student, and test login,
   refresh, and logout. `/health` should return `{ "status": "ok" }`.

Free Render PostgreSQL expires after 30 days; do not use it for long-term data.
Free web services sleep after inactivity, so the first visit may take a minute.
See https://render.com/docs/free for current limits. Upgrading costs money.
This demo starts with no users or courses. Registration creates students only;
instructor/admin roles must be assigned deliberately by a database owner or an
existing administrator. Do not expose Prisma Studio as a public admin interface.

Local development still uses `npm run dev` and the separate localhost API.
To run the production app locally, build the frontend, generate Prisma Client,
apply migrations to the intended database, set `NODE_ENV=production`, and start
the backend. The frontend uses `/api` unless `VITE_API_URL` overrides it.

QuestLearn is a full-stack learning application scaffold. The current backend
implements authentication, course management, enrollment, lessons, and learning
tasks, plus text-based submissions, quizzes, XP/level progression, and student
badges, an XP-based student leaderboard, read-only student/instructor analytics,
and basic administrator account management. File uploads, leaderboard seasons,
streaks, shops, predictive analytics, exports, and advanced admin analytics are
intentionally not implemented yet.

## Stack

- Frontend: React 19, Vite 8, and Tailwind CSS 4
- Backend: Node.js and Express 5
- Database: PostgreSQL with Prisma ORM 6
- Authentication: bcrypt password hashing and JWT Bearer tokens

## Project structure

```text
quest-learn/
|-- frontend/
|   |-- public/
|   `-- src/
|       |-- assets/
|       |-- components/
|       |-- hooks/
|       |-- layouts/
|       |-- pages/
|       `-- services/
|-- backend/
|   |-- prisma/
|   |   |-- migrations/
|   |   `-- schema.prisma
|   |-- scripts/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   `-- validation/
|   `-- test/
`-- package.json
```

## Prerequisites

- Node.js 20.19 or newer
- npm
- PostgreSQL

## Installation

Install all root, frontend, and backend dependencies:

```bash
npm run install:all
```

Copy the backend environment template:

```powershell
Copy-Item backend/.env.example backend/.env
```

On macOS or Linux:

```bash
cp backend/.env.example backend/.env
```

Set these values in `backend/.env`:

```dotenv
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/questlearn?schema=public"
JWT_SECRET="replace-with-a-random-secret-at-least-32-characters-long"
JWT_EXPIRES_IN="7d"
BCRYPT_SALT_ROUNDS=12
```

Use a strong, private `JWT_SECRET` outside local development.

## Database setup

Create a PostgreSQL database named `questlearn`, then apply the checked-in
migration and generate Prisma Client:

```bash
npm --prefix backend run prisma:deploy
npm --prefix backend run prisma:generate
```

During local schema development, create future migrations with:

```bash
npm --prefix backend run prisma:migrate -- --name descriptive_migration_name
```

The initial schema contains:

- `Role`: `STUDENT`, `INSTRUCTOR`, and `ADMIN`
- `User`: identity, hashed password, role, active status, XP, level, and timestamps
- Unique user emails
- Defaults of `STUDENT`, active status, `0` XP, and level `1`
- `Course`: instructor-owned course metadata and publication state
- `Enrollment`: one enrollment per student and course
- `Lesson` and `LearningTask`: ordered learning content belonging to a course
- `Submission`: one text submission per student and learning task, with review
  status, score, feedback, and timestamps
- `Quiz`, `QuizQuestion`, `QuizOption`, `QuizAttempt`, and `QuizAnswer`:
  multiple-choice quizzes and student results
- `XpReward`: idempotent XP awards linked to quiz attempts or reviewed tasks
- `Badge` and `UserBadge`: the achievement catalog and one award per user/badge

Open Prisma Studio when database inspection is needed:

```bash
npm --prefix backend run prisma:studio
```

## Development

Start both development servers from the repository root:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

Run them separately with `npm run dev:frontend` and `npm run dev:backend`.

## Frontend usage

The React application reads its API base URL from `frontend/.env`. For local
development, copy the example if an environment file does not already exist:

```powershell
Copy-Item frontend/.env.example frontend/.env
```

On macOS or Linux, use `cp frontend/.env.example frontend/.env`. The local value
is:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

Open `http://localhost:5173` after running `npm run dev`. New accounts created
through the registration screen are students. Instructor accounts must already
have the `INSTRUCTOR` role in PostgreSQL.

The frontend includes:

- Login, student registration, logout, and session restoration through
  `GET /api/auth/me`
- Role-protected student, instructor, and administrator routes
- Student course browsing, enrollment, lessons, task submissions, submission
  updates, reviewed score/feedback display, quizzes, XP progress, badges, and
  leaderboard and analytics views
- Instructor course, lesson, and learning-task management
- Instructor submission lists, review forms, scores, and feedback
- Instructor-owned course analytics with participation, score, completion, and
  top-student summaries
- Shared student/instructor profile information and password settings
- Administrator system overview, user directory, role management, and account
  activation controls
- Responsive shared navigation, loading states, empty states, and structured API
  error messages

For this student project, the JWT is stored in browser `localStorage` under
`questlearn_token` and attached as a Bearer token by the shared API client. A
production deployment should evaluate an HTTP-only cookie strategy alongside
its CSRF and deployment requirements.

Useful frontend commands:

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix frontend run dev
```

## Authentication API

All request and response bodies use JSON. Successful registration and login
responses include `data.user` and `data.token`. Password hashes are never
returned.

### Register

`POST /api/auth/register`

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "a-secure-password"
}
```

Public registration does not accept a role. Every new account uses the Prisma
default role of `STUDENT`.

### Login

`POST /api/auth/login`

```json
{
  "email": "ada@example.com",
  "password": "a-secure-password"
}
```

### Current user

`GET /api/auth/me`

Send the JWT returned by registration or login:

```http
Authorization: Bearer <access-token>
```

Example with curl:

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <access-token>"
```

### Profile settings

Students and instructors can update only their own name and email:

```bash
curl -X PATCH http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","email":"updated@example.com"}'
```

Email addresses are normalized to lowercase and remain unique. Strict request
validation rejects protected fields such as role, XP, level, and active status.

Change the authenticated account password with:

```bash
curl -X PATCH http://localhost:3000/api/auth/password \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"current-password","newPassword":"new-secure-password"}'
```

The current password is verified with bcrypt and the new password uses the same
validation and `BCRYPT_SALT_ROUNDS` hashing configuration as registration.
Password hashes are never returned.

Authentication middleware verifies the token and reloads the current user from
PostgreSQL. `authorizeRoles(...roles)` is available for future protected routes;
it checks the database-backed role and returns HTTP 403 when access is denied.
Inactive accounts cannot log in, and existing tokens receive HTTP 401 on their
next authenticated request after an administrator deactivates the account.

Errors use a consistent structure with a stable code and clear message:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Email must be a valid email address" }
    ]
  }
}
```

## Course management API

All course endpoints require the same JWT Bearer token used by `/api/auth/me`.
Instructor endpoints require the `INSTRUCTOR` role and student endpoints require
the `STUDENT` role.

### Instructor course endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/instructor/courses` | Create a course |
| `GET` | `/api/instructor/courses` | List the instructor's courses |
| `GET` | `/api/instructor/courses/:courseId` | View an owned course and its content |
| `PATCH` | `/api/instructor/courses/:courseId` | Update an owned course |
| `DELETE` | `/api/instructor/courses/:courseId` | Delete an owned course |

Create a course:

```bash
curl -X POST http://localhost:3000/api/instructor/courses \
  -H "Authorization: Bearer <instructor-token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Web Fundamentals","description":"Learn the foundations of the web.","isPublished":true}'
```

Only published courses appear in the student course browser. Instructors can
change `title`, `description`, and `isPublished` with `PATCH`. Ownership is
checked before every read, update, delete, or child-content mutation.

### Instructor lesson endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/instructor/courses/:courseId/lessons` | Create a lesson |
| `GET` | `/api/instructor/courses/:courseId/lessons` | List course lessons |
| `GET` | `/api/instructor/lessons/:lessonId` | View a lesson |
| `PATCH` | `/api/instructor/lessons/:lessonId` | Update a lesson |
| `DELETE` | `/api/instructor/lessons/:lessonId` | Delete a lesson |

Lesson create/update fields are `title`, `content`, and an optional non-negative
integer `position`.

### Instructor learning-task endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/instructor/courses/:courseId/learning-tasks` | Create a task |
| `GET` | `/api/instructor/courses/:courseId/learning-tasks` | List course tasks |
| `GET` | `/api/instructor/learning-tasks/:taskId` | View a task |
| `PATCH` | `/api/instructor/learning-tasks/:taskId` | Update a task |
| `DELETE` | `/api/instructor/learning-tasks/:taskId` | Delete a task |

Learning-task create/update fields are `title`, `description`, and an optional
non-negative integer `position`.

### Student course endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/courses` | Browse published courses |
| `GET` | `/api/courses/:courseId` | View published course details |
| `POST` | `/api/courses/:courseId/enrollments` | Enroll in a published course |
| `GET` | `/api/courses/enrolled` | View the student's enrollments |
| `GET` | `/api/courses/:courseId/learning` | Access enrolled lessons and tasks |

Enroll in a course:

```bash
curl -X POST http://localhost:3000/api/courses/<course-id>/enrollments \
  -H "Authorization: Bearer <student-token>"
```

The database and service layer both prevent duplicate enrollment. Lesson and
learning-task content is returned only when the authenticated student has an
enrollment for that course.

## Task submission API

Submission endpoints require JWT authentication. Student endpoints require the
`STUDENT` role, and instructor review endpoints require the `INSTRUCTOR` role.
Only text content is supported; file uploads are not implemented.

### Student submission endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/submissions/tasks/:taskId` | Submit work for an enrolled course task |
| `GET` | `/api/submissions/tasks/:taskId` | View the student's submission for a task |
| `PATCH` | `/api/submissions/:submissionId` | Update an unreviewed submission |
| `GET` | `/api/submissions` | List the student's submissions |

Submit text work:

```bash
curl -X POST http://localhost:3000/api/submissions/tasks/<task-id> \
  -H "Authorization: Bearer <student-token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"My written response to the learning task."}'
```

Update before review:

```bash
curl -X PATCH http://localhost:3000/api/submissions/<submission-id> \
  -H "Authorization: Bearer <student-token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"My revised written response."}'
```

A student must be enrolled in the task's course before submitting. Each student
can create only one submission per learning task. Once its status becomes
`REVIEWED`, the student can no longer change it.

### Instructor review endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/instructor/submissions/learning-tasks/:taskId` | List task submissions |
| `GET` | `/api/instructor/submissions/:submissionId` | View a submission |
| `PATCH` | `/api/instructor/submissions/:submissionId/review` | Score and review a submission |

Review a submission:

```bash
curl -X PATCH http://localhost:3000/api/instructor/submissions/<submission-id>/review \
  -H "Authorization: Bearer <instructor-token>" \
  -H "Content-Type: application/json" \
  -d '{"score":85,"feedback":"Clear explanation. Add one more example next time."}'
```

Scores must be whole numbers from `0` through `100`, and feedback is required.
Instructors can list, view, or review submissions only when they own the course
containing the learning task. A successful review sets status to `REVIEWED` and
records `reviewedAt`.

## Badge API

Badge endpoints require a student JWT. The initial catalog contains
`FIRST_QUIZ`, `QUIZ_MASTER`, `FIRST_TASK_REVIEWED`, and `LEVEL_2`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/badges` | List the complete badge catalog |
| `GET` | `/api/badges/earned` | List the authenticated student's earned badges |

```bash
curl http://localhost:3000/api/badges/earned \
  -H "Authorization: Bearer <student-token>"
```

Badge awards are stored with a unique user/badge key, so retries cannot create
duplicates. Quiz submission, first task review, and shared XP/level progression
perform their badge checks in the same database transaction as the underlying
event. Badges do not award additional XP.

## Leaderboard API

`GET /api/leaderboard` requires a student JWT. It returns `leaders` containing
the top 10 students and `currentUser` containing the authenticated student's
rank, including when that student is outside the top 10. Rankings use total XP
descending, then account creation time and user ID for deterministic ties.
Email addresses and password hashes are never selected or returned.

## Analytics API

Analytics endpoints are read-only and use the authenticated user's database
identity and role.

| Role | Method | Endpoint | Purpose |
| --- | --- | --- | --- |
| Student | `GET` | `/api/analytics` | Personal learning totals, quiz scores, and course progress |
| Instructor | `GET` | `/api/instructor/analytics` | Per-course analytics overview for owned courses |
| Instructor | `GET` | `/api/instructor/courses/:courseId/analytics` | One owned course plus top enrolled students |

Student course progress counts submitted learning tasks and distinct completed
published quizzes against the available trackable activities. Instructor task
completion is calculated as submissions divided by the product of enrolled
students and available learning tasks, with zero returned when no completion
opportunity exists. No analytics data is duplicated in a separate table.

## Admin API

All admin endpoints require an authenticated user with the `ADMIN` role.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/overview` | System-wide user and learning-content totals |
| `GET` | `/api/admin/users` | Paginated user directory with role, status, and search filters |
| `GET` | `/api/admin/users/:userId` | Password-free user details and basic activity counts |
| `PATCH` | `/api/admin/users/:userId/role` | Change a user role |
| `PATCH` | `/api/admin/users/:userId/status` | Activate or deactivate an account |

User listing query parameters are `page`, `limit`, `role`, `status`, and
`search`. An administrator cannot remove their own admin role or deactivate
their own account. Deactivation preserves all related courses, enrollments,
submissions, XP rewards, and badges.

Public registration remains student-only. Bootstrap the first administrator by
changing a trusted existing user's role to `ADMIN` with Prisma Studio or a
direct PostgreSQL update, then sign in normally through the frontend.

## Verification commands

```bash
npm run check
npm --prefix backend run prisma:validate
npm --prefix backend test
```

The root check lints and builds the frontend, then lints, syntax-checks, and
tests the backend.
