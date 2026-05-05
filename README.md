# Forked

A recipe-sharing web app where you can create, publish, fork, and collaborate on recipes.

## Features

- **Recipes** — Create recipes with ingredients and step-by-step instructions (with optional images and timers per step)
- **Cook Mode** — Full-screen, step-by-step cooking interface with text-to-speech and a built-in timer
- **Forking** — Fork any public recipe into your own collection and track fork counts
- **Recipe Books** — Organize recipes into collaborative books with Owner/Collaborator roles
- **Public profiles** — Browse other users' public recipes and profile pages
- **The Pool** — Discover all public recipes in one place
- **GitHub OAuth** — Sign in with GitHub via NextAuth.js

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js v5 (GitHub OAuth) |
| ORM | Prisma v7 |
| Database | SQLite (libSQL / Turso-compatible) |

## Getting Started

### Prerequisites

- Node.js 20+
- A GitHub OAuth app ([create one here](https://github.com/settings/developers))

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# NextAuth
AUTH_SECRET=a_random_secret_string

# Database (defaults to local SQLite if omitted)
DATABASE_URL=file:./prisma/dev.db
```

### 3. Run database migrations

```bash
npm run db:migrate
```

### 4. (Optional) Seed the database

```bash
npm run seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run seed` | Seed the database with sample data |

## Project Structure

```
app/              # Next.js App Router pages and API routes
components/       # Shared UI components
lib/              # Auth and Prisma client setup
prisma/           # Schema, migrations, and seed script
types/            # Shared TypeScript types
utils/            # Utility helpers
public/uploads/   # Uploaded images
```
