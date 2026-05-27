# Trello Clone — Full-Stack Kanban Board

A production-ready Trello clone with drag-and-drop, dark mode, card templates, labels, checklists, due dates, comments, and search filters.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, DnD Kit, Axios, date-fns |
| Styling | Vanilla CSS variables + Tailwind utilities |
| Backend | Express.js, Prisma ORM |
| Database | PostgreSQL via [Neon](https://neon.tech) (cloud, serverless) |

## Features

- ✅ **Boards, Lists, Cards** — full CRUD
- ✅ **Drag & Drop** — reorder cards and lists (cross-list move)
- ✅ **Dark / Light Mode** — persisted in localStorage, no FOUC
- ✅ **Card Templates** — pre-populated cards with labels + checklists
- ✅ **Card Modal** — description, labels, checklist, due date, comments, members, cover
- ✅ **Search & Filters** — by title, label, member, due date
- ✅ **Toast Notifications** — success/error feedback
- ✅ **Error Boundary** — no blank white pages on crashes
- ✅ **Responsive** — mobile, tablet, desktop

## Local Development

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) free account (database)

### 1. Clone & Install

```bash
git clone <your-repo>
cd trello-clone

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2. Database Setup (Neon)

1. Go to [neon.tech](https://neon.tech) → Create project
2. Copy the connection string
3. Create `server/.env`:

```env
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require&channel_binding=require"
NODE_ENV=development
PORT=5000
```

### 3. Run Migrations & Seed

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
node prisma/seed.js
```

### 4. Start Servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# → http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# → http://localhost:5173
```

---

## Deployment

### Backend → Render

1. New Web Service → Connect repo → Select `server/` as root
2. Build Command: `npm install && npx prisma generate`
3. Start Command: `node index.js`
4. Add same environment variables as above

### Frontend → Vercel (recommended, free)

1. Install Vercel CLI: `npm i -g vercel`
2. Update `client/.env.production`:
   ```
   VITE_API_URL=https://YOUR_RAILWAY_URL/api
   ```
3. Deploy:
   ```bash
   cd client
   npm run build  # verify build passes first
   vercel --prod
   ```
4. In Vercel dashboard → Settings → Environment Variables → add:
   ```
   VITE_API_URL = https://YOUR_RAILWAY_URL/api
   ```


---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/boards` | List all boards |
| POST | `/api/boards` | Create board |
| GET | `/api/boards/:id` | Board with lists+cards |
| PUT | `/api/boards/:id` | Update board |
| DELETE | `/api/boards/:id` | Delete board |
| POST | `/api/lists` | Create list |
| PUT | `/api/lists/:id` | Update list |
| DELETE | `/api/lists/:id` | Delete list |
| PATCH | `/api/lists/reorder` | Reorder lists |
| GET | `/api/cards/:id` | Full card details |
| POST | `/api/cards` | Create card |
| PUT | `/api/cards/:id` | Update card |
| DELETE | `/api/cards/:id` | Delete card |
| PATCH | `/api/cards/reorder` | Reorder cards |
| PATCH | `/api/cards/:id/move` | Move to list |
| POST | `/api/labels` | Add label |
| DELETE | `/api/labels/:id` | Remove label |
| POST | `/api/checklist` | Add checklist item |
| PATCH | `/api/checklist/:id` | Toggle/update item |
| DELETE | `/api/checklist/:id` | Remove item |
| GET | `/api/members` | List members |
| POST | `/api/members` | Create member |
| GET | `/api/comments/cards/:cardId` | Card comments |
| POST | `/api/comments/cards/:cardId` | Add comment |
| DELETE | `/api/comments/:id` | Delete comment |
| GET | `/api/search` | Search with filters |

---

## Environment Variables

### Server (`server/.env`)
| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `PORT` | ❌ | Server port (default: 5000) |
| `NODE_ENV` | ❌ | `development` or `production` |

### Client (`client/.env` or Vercel env)
| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend API base URL (e.g., `https://your-server.railway.app/api`) |

---

## Database (Neon)

- **Free tier**: 0.5 GB storage, auto-suspend after inactivity (wakes in ~5s)
- **Connection pooling**: Enable in Neon dashboard → Project Settings → Pooling for better performance
- **Backups**: Automatic point-in-time restore available on paid plans
- **Branches**: Create a `production` branch separate from `main` for safety

---

## Scripts

```bash
# Backend
npm run dev          # Nodemon dev server
npm run start        # Production start
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio UI

# Frontend
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
```
