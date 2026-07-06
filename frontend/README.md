# Task Manager — Frontend

Next.js + TypeScript frontend for the Task Manager & Image Annotation app.

## Tech Stack

- Node.js 24
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- @dnd-kit (drag and drop)
- Axios (API client)
- date-fns (date manipulation)

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local  # configure NEXT_PUBLIC_API_URL
npm run dev
```

### Environment variables

| Variable               | Default                       | Description          |
|------------------------|-------------------------------|----------------------|
| NEXT_PUBLIC_API_URL    | http://localhost:8000/api      | Backend API base URL |

## Features

- **Kanban board**: Drag-and-drop tasks between To Do / In Progress / Done columns, persists to database
- **Date filtering**: Navigate by date to see tasks for a specific day
- **Image annotation**: Upload images, draw polygons, delete individual polygons
- **JWT auth**: Login via email/password, automatic token refresh

## Pages

- `/login` — Email + password login
- `/tasks` — Kanban board with date selector
- `/annotate` — Image upload and polygon annotation

## Difficulties encountered

- **@dnd-kit with Zustand**: Keeping the drag-and-drop sortable state in sync with the Zustand store required careful optimistic updates and rollback on API failure.
- **Middleware vs Proxy**: Next.js 16 deprecated the `middleware.ts` convention in favor of `proxy`, but middleware still works for route guarding.
- **SVG viewBox for annotation**: Mapping between display coordinates and natural image dimensions required computing the `viewBox` dynamically based on the loaded image's natural width/height.
- **Normalized coordinates**: Storing polygon points as 0–1 normalized values simplified rendering at any display size but required careful conversion on both save and load.
