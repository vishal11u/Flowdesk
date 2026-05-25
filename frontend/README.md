# FlowDesk Frontend

Vite + React dashboard for the FlowDesk SaaS MVP. The frontend is organized
around feature components, typed API helpers, React Query server state, and
Tailwind CSS utility styling.

## Run locally

```bash
npm install
npm run dev
```

The dashboard defaults to the backend API at `http://localhost:3100`. You can
change the API endpoint from the dashboard sidebar, or set it before build time:

```bash
VITE_API_URL=http://localhost:3100 npm run dev
```

## Current dashboard scope

- Login and signup through the Nest `auth` endpoints.
- Workspace metrics for channels, clients, and selected conversation volume.
- Gmail, WhatsApp, and Slack integration connection cards.
- Provider send queue through `POST /integrations/send`.
- Inbound provider event simulation through `POST /integrations/ingest`.
- Client creation and pipeline selection.
- Single client inspection through `GET /clients/:id`.
- Conversation timeline for the selected client.
- Manual incoming/outgoing message creation through `POST /messages`.
- AI reply drafting through `POST /ai/generate-reply`.
- Outgoing reply persistence through `POST /messages`.
- Session refresh and backend logout through `POST /auth/refresh` and
  `POST /auth/logout`.
- User/session inspection through `/users/me`, plus the demo `/users`
  endpoints exposed by the backend.

## Frontend architecture

- `src/lib`: shared types, API client, constants, storage helpers, query client.
- `src/hooks`: session state and React Query hooks/mutations.
- `src/components`: reusable layout and UI primitives.
- `src/features`: dashboard feature sections for auth, clients, inbox,
  integrations, overview, and backend tooling.
- `src/App.tsx`: thin orchestration layer that composes feature modules.

## Backend expectations

Start the backend on port `3100` before using live mode. The frontend also shows
demo preview data when no authenticated workspace has been loaded yet.
