# TaskFlow — Frontend

> Next.js 16 + TypeScript frontend for the **Task Manager & Image Annotation** app. Built with a premium dark UI, Kanban drag-and-drop, and an interactive polygon annotation canvas.

---

## 🛠 Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | **v20+** (LTS) | Runtime |
| Next.js | 16.2 (App Router) | Framework |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | v4 | Utility styling |
| Zustand | ^5 | Global state management |
| @dnd-kit | 6.x / 10.x | Drag-and-drop |
| Axios | ^1.18 | API client with JWT interceptors |
| date-fns | ^4 | Date manipulation |

---

## ⚙️ Environment Variables

Create `.env.local` (copy from `.env.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 🚀 Setup & Running

### Prerequisites
- **Node.js v20 or later** (`node --version` to check)
- npm v10+ (bundled with Node 20)
- Backend server running on `http://localhost:8000`

### Steps

```bash
# 1. Clone the repo and enter the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Copy and configure environment
cp .env.example .env.local
# Edit .env.local if your Django backend runs on a different port

# 4. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**

### Build for production

```bash
npm run build
npm run start
```

---

## 📂 Project Structure

```
frontend/
├── app/
│   ├── login/page.tsx       # Auth page (glassmorphism design)
│   ├── tasks/page.tsx       # Kanban board page
│   ├── annotate/page.tsx    # Image annotation page
│   ├── layout.tsx           # Root layout (dark theme)
│   └── globals.css          # Design system (CSS variables, tokens)
├── components/
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── tasks/
│   │   ├── Board.tsx        # DnD context + column orchestration
│   │   ├── Column.tsx       # Droppable column with sortable list
│   │   ├── TaskCard.tsx     # Draggable task card
│   │   ├── TaskModal.tsx    # Add/edit/delete task modal
│   │   └── DateSelector.tsx # Shared date navigation component
│   └── annotate/
│       ├── AnnotationCanvas.tsx  # SVG polygon drawing/selection
│       ├── ImageFilmstrip.tsx    # Scrollable image thumbnail strip
│       └── ImageUploader.tsx     # File upload button
├── stores/
│   ├── taskStore.ts         # Zustand store (tasks CRUD + reorder)
│   ├── dateStore.ts         # Zustand store (selected date)
│   └── authStore.ts         # Zustand store (JWT tokens)
├── lib/
│   └── api.ts               # Axios instance + JWT refresh interceptor
└── middleware.ts             # Route protection (redirects unauthenticated)
```

---

## 🎯 Features

### Task Management (`/tasks`)
- **Kanban Board**: Three columns — *To Do*, *In Progress*, *Done*
- **Drag-and-drop**: Powered by `@dnd-kit`, persists column changes to the API
- **Date Selector**: Navigate by day; tasks filtered by `due_date`; click date label to open native date picker
- **Task Modal**: Create / edit / delete tasks with title, description, priority, due date, and comma-separated tags
- **Optimistic UI**: Reorder updates applied immediately, rolled back if the API call fails

### Image Annotation (`/annotate`)
- **Upload Images**: Multipart upload → Django backend stores to `media/uploads/`
- **Image Filmstrip**: Horizontally scrollable thumbnail strip; click to switch canvas
- **Draw Mode**: Click to place polygon vertices; double-click or "Finish" button to save
- **Select Mode**: Click existing polygons to highlight them; confirm-before-delete flow
- **Color Palette**: Each new polygon automatically gets the next color from a rotating palette
- **Persistence**: All polygons saved to the database with normalized (0-1) coordinates

### Auth
- JWT login via email + password
- Access token attached to every API request via Axios interceptor
- Silent token refresh on 401, with queued retry for concurrent requests
- Route guarding via Next.js middleware (checks cookie) + `useEffect` guard in each page

---

## ⚔️ Difficulties & How I Overcame Them (The Villains)

### Villain 1: `@dnd-kit` + Zustand Optimistic Reorder
**The problem:** `@dnd-kit`'s `SortableContext` expects item IDs to match the rendered order exactly. When a drag ends and we fire the API call, the UI needs to already look correct while the call is in flight. If the API fails, we must roll back.

**How I won:** I kept the full task list in Zustand and applied the status/position change optimistically in `reorder()`. The previous state is captured with `get()` before the mutation, so we can `set({ tasks: prev })` in the catch block.

### Villain 2: SVG viewBox vs. Display Coordinates
**The problem:** The annotation canvas is an `<svg>` overlaid on an `<img>`. The SVG's `viewBox` must match the image's *natural* dimensions so polygon coordinates are consistent regardless of display size. Getting the natural size requires waiting for the `load` event.

**How I won:** I used a `useRef` on the `<img>` and attached a `load` listener to capture `naturalWidth`/`naturalHeight`, then stored those in state to update the `viewBox`. Points are stored normalized (0–1) so they render correctly at any display scale.

### Villain 3: JWT Refresh Race Condition
**The problem:** If multiple API calls fire concurrently and all receive a 401, each interceptor instance would independently try to refresh the token — causing multiple simultaneous `/auth/refresh/` requests, all but one of which would fail with an invalid token.

**How I won:** I used an `isRefreshing` flag and a `failedQueue` array. While a refresh is in progress, any new 401 responses add their `resolve`/`reject` to the queue instead of starting another refresh. Once the refresh succeeds or fails, `processQueue` drains the queue with the new token or the error.

### Villain 4: Next.js 16 `@tailwindcss/postcss` v4
**The problem:** Tailwind CSS v4 completely changed how it's configured — no `tailwind.config.js`, uses CSS `@import "tailwindcss"` directly, and the PostCSS plugin is now `@tailwindcss/postcss`. The old `content` array approach doesn't work.

**How I won:** Switched to the new `@import "tailwindcss"` in `globals.css` and updated `postcss.config.mjs` to use `@tailwindcss/postcss`. Used CSS custom properties (variables) for the design system rather than Tailwind utilities for colors, giving full control over the premium dark theme.

### Villain 5: Middleware Cookie vs. localStorage
**The problem:** Next.js middleware runs on the Edge runtime (server-side) and cannot read `localStorage`. But JWT tokens were stored in `localStorage` for the Axios interceptor.

**How I won:** After login, I write the same auth payload to both `localStorage` (for the Axios interceptor) and a browser cookie (for middleware). The middleware reads the cookie and redirects unauthenticated users to `/login`.

---

## 👤 Demo Credentials

```
Email:    demo@vairad.com
Password: DemoPass123!
```
