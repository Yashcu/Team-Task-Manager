# Team Task Manager

A full-stack task management system built for teams. Admins create projects, invite members, and assign tasks. Members pick up their work and move it forward. That's it — simple by design, solid under the hood.

**Live:** [Frontend](https://your-frontend.vercel.app) · [Backend API](https://your-backend.onrender.com)

---

## Why I Built This

Most task managers try to do everything. I wanted to build one that does the basics *really well* — clean role separation, a strict task workflow, and a UI that stays out of your way. The goal was to write production-quality code, not just a demo.

---

## Tech Stack

| Layer       | Technology                                           |
|-------------|------------------------------------------------------|
| Frontend    | React 19, TypeScript, Vite, Tailwind CSS 4           |
| State       | TanStack React Query (server state + caching)        |
| Backend     | Node.js, Express 5, TypeScript                       |
| Database    | PostgreSQL (Neon) with Prisma ORM                    |
| Auth        | JWT via HTTP-only cookies, bcrypt password hashing    |
| Validation  | Zod (shared schemas on the backend)                  |
| Deployment  | Vercel (frontend), Render (backend)                  |

---

## How It Works

### Authentication
Users sign up, log in, and the server drops a signed JWT into an HTTP-only cookie. No tokens in localStorage, no Authorization headers to manage on the client. The `authenticate` middleware reads the cookie on every request and attaches the user to `req.user`. Simple, secure, stateless.

### Projects & Roles
When you create a project, you automatically become its **Admin**. You can then invite other registered users by email they join as **Members**. This is handled through a `ProjectMember` junction table with a composite unique constraint on `(projectId, userId)`, so duplicate invites are caught at the database level.

Every project-scoped route runs through two middleware layers:
- `requireProjectMember` — looks up the caller's membership and attaches their role to the request.
- `requireProjectAdmin` — gates destructive operations (create/edit/delete tasks, invite members, modify project) to Admins only.

This means **authorization is enforced per-project, not globally**. A user can be an Admin on one project and a Member on another.

### Task Lifecycle
Tasks follow a strict forward-only workflow:

```
PENDING → IN_PROGRESS → COMPLETED
```

There's no jumping from Pending to Completed, and no going backwards. The backend validates this with a `forwardStatus` map if the requested transition doesn't match the next valid state, the API rejects it. This was a deliberate choice to keep task history meaningful.

**Who can do what:**
- **Admins** create, edit, delete, and assign tasks. They see all tasks in the project.
- **Members** only see tasks assigned to them. Only the assigned user can advance a task's status.
- **Completed tasks are immutable** can't be edited, deleted, or status-changed. They're done.

### Dashboard
The dashboard pulls all tasks assigned to the logged-in user across every project. It calculates stats (active count, due today, overdue) and sorts tasks with overdue items surfaced first. This is done with a dedicated `/api/tasks/me` endpoint so the query isn't scoped to a single project.

---

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers (thin — delegate to services)
│   ├── services/        # Business logic (validation, DB queries, rules)
│   ├── middleware/       # authenticate, projectAuth, validate, errorHandler
│   ├── schemas/          # Zod validation schemas
│   ├── routes/           # Express route definitions
│   ├── lib/              # Prisma client, JWT helpers, custom errors
│   └── types/            # Express type augmentation
├── prisma/
│   └── schema.prisma     # Data model
└── package.json

frontend/
├── src/
│   ├── pages/            # DashboardPage, ProjectPage, Login, Signup
│   ├── components/       # TaskCard, Modal, Layout, ProtectedRoute
│   ├── hooks/            # useAuth, useProjects, useTasks (React Query)
│   └── lib/              # Axios instance, utilities
└── package.json
```

---

## Data Model

Four tables, no bloat:

- **Users** — id, name, email, hashed password.
- **Projects** — id, name, description, owner reference.
- **ProjectMembers** — junction table linking users to projects with a role (`ADMIN` or `MEMBER`). Composite unique on `(projectId, userId)`.
- **Tasks** — title, description, status, priority, due date, assignee, creator. Foreign keys to both the project and the assigned user. Cascade deletes on project removal.

Indexes on `ownerId`, `projectId`, and `assigneeId` for fast lookups.

---

## Implementation Details Worth Noting

**Request validation** — Every mutation route has a Zod schema applied via a `validate` middleware. Schemas use `.strict()` so unknown fields are rejected, not silently ignored.

**Error handling** — A custom `AppError` class carries an HTTP status code. The global `errorHandler` middleware catches these and returns structured JSON. Unrecognized errors get a generic 500 without leaking stack traces.

**Service layer** — Controllers don't touch Prisma directly. All database logic lives in service files. This keeps controllers thin and makes the business rules testable in isolation.

**Atomic project creation** — Creating a project and adding the creator as an Admin member happens inside a Prisma `$transaction`. If either operation fails, neither persists.

**Caching strategy** — React Query is configured with a 5-minute `staleTime` on task queries. Mutations invalidate relevant query keys so the UI updates immediately without refetching everything on every render.

**Task status transitions** — The backend enforces a forward-only state machine. The frontend mirrors this by only showing the "next" action button on the TaskCard (arrow icon for Pending → In Progress, checkmark for In Progress → Completed).

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or a [Neon](https://neon.tech) free tier)

### Backend
```bash
cd backend
npm install
```

Create a `.env` file:
```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
```

Run migrations and start:
```bash
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

---

## API Overview

| Method   | Endpoint                               | Access        | Description              |
|----------|----------------------------------------|---------------|--------------------------|
| POST     | `/api/auth/signup`                     | Public        | Register a new user      |
| POST     | `/api/auth/login`                      | Public        | Log in, receive cookie   |
| POST     | `/api/auth/logout`                     | Authenticated | Clear auth cookie        |
| GET      | `/api/auth/me`                         | Authenticated | Get current user         |
| POST     | `/api/projects`                        | Authenticated | Create project           |
| GET      | `/api/projects`                        | Authenticated | List user's projects     |
| GET      | `/api/projects/:id`                    | Member        | Get project details      |
| PATCH    | `/api/projects/:id`                    | Admin         | Update project           |
| DELETE   | `/api/projects/:id`                    | Admin         | Delete project           |
| POST     | `/api/projects/:id/members`            | Admin         | Invite member by email   |
| GET      | `/api/projects/:id/tasks`              | Member        | Get tasks (role-filtered)|
| POST     | `/api/projects/:id/tasks`              | Admin         | Create task              |
| PATCH    | `/api/projects/:id/tasks/:taskId`      | Admin         | Edit task details        |
| DELETE   | `/api/projects/:id/tasks/:taskId`      | Admin         | Delete task              |
| PATCH    | `/api/tasks/:taskId/status`            | Assignee      | Advance task status      |
| GET      | `/api/tasks/me`                        | Authenticated | Get all assigned tasks   |

---

## What I'd Add Next

- WebSocket notifications when a task is assigned or completed
- Activity log per project (who did what, when)
- File attachments on tasks
- Search and filtering across projects

---

*Built by Yash Garg for ethara-ai assessment*
