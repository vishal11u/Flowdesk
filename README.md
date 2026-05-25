# FlowDesk

A SaaS platform for niche client communication workflows with AI-assisted reply generation, supporting real estate agents and B2B SaaS support agencies.

## Project Structure

```text
flowdesk/
├── backend/       # NestJS REST API with AI, auth, clients, integrations, etc.
└── frontend/      # Vite + React dashboard with Tailwind CSS
```

## Tech Stack

### Backend

- Node.js + NestJS 11
- TypeScript
- PostgreSQL + TypeORM
- JWT authentication with Passport
- OpenAI Responses API integration (with local fallback)

### Frontend

- React 19 + Vite
- TypeScript
- Tailwind CSS
- React Query (TanStack Query)

## Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- pnpm (for backend) or npm (for frontend)
- (Optional) OpenAI API key for real AI generation

### Backend Setup

1. Navigate to backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file in `backend/` (see [backend README](./backend/README.md) for full environment variables):

   ```env
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   PORT=3100
   DB_HOST=localhost
   DB_PORT=5434
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=flowdesk_ai
   DB_SYNC=false
   DB_MIGRATIONS_RUN=true
   CORS_ORIGIN=http://localhost:3000
   # Optional:
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Run backend in development mode:
   ```bash
   pnpm run start:dev
   ```

### Frontend Setup

1. Navigate to frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run frontend in development mode:
   ```bash
   npm run dev
   ```

## Usage

- Backend API: http://localhost:3100
- Frontend dashboard: http://localhost:3000

For more details, see the [backend README](./backend/README.md) and [frontend README](./frontend/README.md).
