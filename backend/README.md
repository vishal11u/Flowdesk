# FlowDesk AI Backend

FlowDesk AI Backend is a NestJS REST API for niche client communication workflows. It supports user signup/login with JWT authentication, enriched client records, client message history, and AI-assisted reply workflows for real estate agents and B2B SaaS support agencies.

## Tech Stack

- Node.js + NestJS 11
- TypeScript
- PostgreSQL
- TypeORM
- JWT authentication with Passport
- DTO validation with `class-validator`
- Package manager: `pnpm`

## Project Structure

```text
src/
  ai/          AI reply generation endpoint and service
  auth/        Signup, login, refresh tokens, JWT module, and JWT strategy
  clients/     Client CRUD-style read/create module
  common/      Global auth guard, public decorator, response interceptor, exception filter
  integrations/ Normalized WhatsApp, Gmail, Slack, CRM, calendar, and invoice integration layer
  messages/    Client message create/read module
  organizations/ Workspace/tenant ownership module
  users/       User entity/service plus simple demo controller
```

## Main Features

- Register a user with an email, password, name, and organization.
- Login with email/password and receive access and refresh tokens.
- Protect all non-auth endpoints with `Authorization: Bearer <token>`.
- Create and list enriched clients with niche, status, source, notes, and metadata.
- Create incoming/outgoing messages for a client.
- Read message history for a client in ascending timestamp order.
- Generate AI workflow intelligence: intent, urgency, sentiment, tags, next actions, follow-up timing, and professional/friendly/assertive replies.
- Use OpenAI Responses API when `OPENAI_API_KEY` is configured, with a deterministic local fallback when it is not.
- Normalize integration connections and inbound events for WhatsApp, Gmail, Slack, CRM, calendar, and invoice tools.
- Scope clients and messages by organization so workspaces cannot read each other's records.
- Include refresh-token rotation, rate limiting, audit logs, CORS, and migrations.

## Product Positioning

FlowDesk is designed to become useful in two focused niches instead of competing as a generic CRM:

- `real_estate`: qualify leads, coordinate property viewings, capture budget/location/timeline, and recommend next follow-up actions.
- `b2b_saas_support`: triage support or billing messages, detect urgency, protect SLA workflows, and suggest account-aware replies.

This makes the project more 2026-ready because it moves beyond simple stored messages and into workflow intelligence around a specific business context.

## Environment Variables

Create a `.env` file in the project root.

```env
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
TOKEN_EXPIRY=3600s
REFRESH_TOKEN_EXPIRY=7d
PORT=3100

DB_HOST=localhost
DB_PORT=5434
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=flowdesk_ai
DB_SYNC=false
DB_MIGRATIONS_RUN=true

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=120
CORS_ORIGIN=http://localhost:3000

# Optional: enables real AI generation. Without this, FlowDesk uses local fallback logic.
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.4-mini
```

Use `DB_SYNC=false` for production-style development and run migrations instead of relying on automatic schema sync.

## Installation

```bash
pnpm install
```

## Run The App

```bash
# development
pnpm run start

# watch mode
pnpm run start:dev

# production
pnpm run build
pnpm run start:prod
```

Default local URL:

```text
http://localhost:3100
```

## Validation And Response Format

The app uses a global `ValidationPipe` with:

- `whitelist: true`: only DTO-defined fields are accepted.
- `forbidNonWhitelisted: true`: unknown fields cause a validation error.
- `transform: true`: route parameters and payload values can be transformed to expected types.

Successful responses are wrapped by `TransformInterceptor`:

```json
{
  "code": 200,
  "message": "Success",
  "data": {}
}
```

Errors are wrapped by `AllExceptionsFilter`:

```json
{
  "code": 400,
  "message": "Validation or error message",
  "data": null
}
```

## Authentication

Only these endpoints are public:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`

Every other endpoint is protected by the global `JwtAuthGuard`.

For protected endpoints, send:

```http
Authorization: Bearer <access_token>
```

The JWT payload contains:

```json
{
  "email": "user@example.com",
  "sub": 1,
  "organizationId": 1
}
```

## Database Tables

### users

| Column     | Type   | Notes                      |
| ---------- | ------ | -------------------------- |
| `id`       | number | Auto-generated primary key |
| `email`    | string | Unique                     |
| `password` | string | Hashed with bcrypt         |
| `name`     | string | User display name          |
| `organizationId` | number | Tenant/workspace owner |
| `refreshTokenHash` | string | Hashed active refresh token |

### organizations

| Column      | Type   | Notes                      |
| ----------- | ------ | -------------------------- |
| `id`        | number | Auto-generated primary key |
| `name`      | string | Workspace/company name     |
| `slug`      | string | Unique workspace slug      |
| `createdAt` | Date   | Auto-created timestamp     |
| `updatedAt` | Date   | Auto-updated timestamp     |

### clients

| Column          | Type   | Notes                                    |
| --------------- | ------ | ---------------------------------------- |
| `id`            | number | Auto-generated primary key               |
| `name`          | string | Client name                              |
| `email`         | string | Unique inside one workspace              |
| `organizationId` | number | Tenant/workspace owner                 |
| `phone`         | string | Optional                                 |
| `company`       | string | Optional                                 |
| `niche`         | enum   | `real_estate` or `b2b_saas_support`      |
| `status`        | enum   | `lead`, `active`, `at_risk`, or `closed` |
| `source`        | string | Optional lead/source label               |
| `pipelineStage` | string | Optional workflow stage                  |
| `notes`         | text   | Optional internal notes                  |
| `metadata`      | jsonb  | Optional niche-specific fields           |
| `createdAt`     | Date   | Auto-created timestamp                   |

### messages

| Column      | Type   | Notes                            |
| ----------- | ------ | -------------------------------- |
| `id`        | number | Auto-generated primary key       |
| `clientId`  | number | Client identifier                |
| `message`   | text   | Message body                     |
| `type`      | string | Must be `incoming` or `outgoing` |
| `timestamp` | Date   | Auto-created timestamp           |

### integration_connections

| Column              | Type   | Notes                                             |
| ------------------- | ------ | ------------------------------------------------- |
| `id`                | number | Auto-generated primary key                        |
| `organizationId`    | number | Tenant/workspace owner                            |
| `channel`           | enum   | `whatsapp`, `gmail`, `slack`, `crm`, `calendar`, `invoice` |
| `status`            | enum   | `connected`, `needs_auth`, `disabled`             |
| `externalAccountId` | string | Optional provider account identifier              |
| `settings`          | jsonb  | Optional provider settings                        |
| `credentialsRef`    | jsonb  | External secret reference, not raw secrets         |

### audit_logs

| Column           | Type   | Notes                         |
| ---------------- | ------ | ----------------------------- |
| `id`             | number | Auto-generated primary key    |
| `organizationId` | number | Optional tenant/workspace id  |
| `userId`         | number | Optional actor id             |
| `method`         | string | HTTP method                   |
| `path`           | string | Request path                  |
| `statusCode`     | number | Response status code          |
| `ip`             | string | Request IP                    |
| `metadata`       | jsonb  | Small request metadata        |

## API Endpoints

### Auth

#### Signup

Method: `POST`

URL: `/auth/signup`

Auth: Public

Use case: Create a new user account, hash the password, and return a JWT token.

Payload:

```json
{
  "email": "admin@example.com",
  "password": "secret123",
  "name": "Admin User",
  "organizationName": "Prime Realty"
}
```

Validation:

- `email` must be a valid email.
- `password` is required and must be at least 6 characters.
- `name` is required.
- `organizationName` is required.

Success response data:

```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "organizationId": 1
  }
}
```

Possible errors:

- `409 Conflict`: user already exists.
- `400 Bad Request`: validation failed.

#### Login

Method: `POST`

URL: `/auth/login`

Auth: Public

Use case: Authenticate an existing user and return a JWT token.

Payload:

```json
{
  "email": "admin@example.com",
  "password": "secret123"
}
```

Validation:

- `email` must be a valid email.
- `password` is required.

Success response data:

```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "organizationId": 1
  }
}
```

Possible errors:

- `401 Unauthorized`: invalid credentials.
- `400 Bad Request`: validation failed.

#### Refresh Token

Method: `POST`

URL: `/auth/refresh`

Auth: Public

Payload:

```json
{
  "refreshToken": "refresh_token_here"
}
```

Use case: Rotate and return a fresh access token and refresh token pair.

#### Logout

Method: `POST`

URL: `/auth/logout`

Auth: Required

Use case: Revoke the signed-in user's stored refresh token hash.

### Clients

#### Create Client

Method: `POST`

URL: `/clients`

Auth: Required

Use case: Add a new client/customer record.

Payload:

```json
{
  "name": "Acme Corp",
  "email": "contact@acme.com"
}
```

Validation:

- `name` is required.
- `email` must be a valid email.

Success response data:

```json
{
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "id": 1,
  "createdAt": "2026-05-12T09:30:00.000Z"
}
```

Possible errors:

- `401 Unauthorized`: missing or invalid JWT.
- `400 Bad Request`: validation failed.
- `500 Internal Server Error`: duplicate unique email or database error.

#### Get All Clients

Method: `GET`

URL: `/clients`

Auth: Required

Use case: Fetch all saved clients.

Payload: None

Success response data:

```json
[
  {
    "id": 1,
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "createdAt": "2026-05-12T09:30:00.000Z"
  }
]
```

Possible errors:

- `401 Unauthorized`: missing or invalid JWT.

#### Get Client By ID

Method: `GET`

URL: `/clients/:id`

Auth: Required

Use case: Fetch one client by numeric ID.

Path params:

| Param | Type   | Example |
| ----- | ------ | ------- |
| `id`  | number | `1`     |

Payload: None

Success response data:

```json
{
  "id": 1,
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "createdAt": "2026-05-12T09:30:00.000Z"
}
```

Possible errors:

- `401 Unauthorized`: missing or invalid JWT.
- `400 Bad Request`: `id` is not a number.
- `404 Not Found`: client does not exist.

### Messages

#### Create Message

Method: `POST`

URL: `/messages`

Auth: Required

Use case: Store an incoming or outgoing message for a client.

Payload:

```json
{
  "clientId": 1,
  "message": "Can you share the latest invoice?",
  "type": "incoming"
}
```

Validation:

- `clientId` must be a number.
- `message` is required.
- `type` must be `incoming` or `outgoing`.

Success response data:

```json
{
  "clientId": 1,
  "message": "Can you share the latest invoice?",
  "type": "incoming",
  "id": 1,
  "timestamp": "2026-05-12T09:35:00.000Z"
}
```

Possible errors:

- `401 Unauthorized`: missing or invalid JWT.
- `400 Bad Request`: validation failed.

Current note: `messages.clientId` is linked to `clients.id` with a TypeORM relation and cascade delete.

#### Get Messages By Client

Method: `GET`

URL: `/messages/client/:clientId`

Auth: Required

Use case: Fetch a client's message history, ordered from oldest to newest.

Path params:

| Param      | Type   | Example |
| ---------- | ------ | ------- |
| `clientId` | number | `1`     |

Payload: None

Success response data:

```json
[
  {
    "id": 1,
    "clientId": 1,
    "message": "Can you share the latest invoice?",
    "type": "incoming",
    "timestamp": "2026-05-12T09:35:00.000Z"
  },
  {
    "id": 2,
    "clientId": 1,
    "message": "Sure, I will send it today.",
    "type": "outgoing",
    "timestamp": "2026-05-12T09:36:00.000Z"
  }
]
```

Possible errors:

- `401 Unauthorized`: missing or invalid JWT.
- `400 Bad Request`: `clientId` is not a number.

### AI

#### Generate Reply

Method: `POST`

URL: `/ai/generate-reply`

Auth: Required

Use case: Generate suggested replies and workflow intelligence for a user message. If `OPENAI_API_KEY` exists, the endpoint uses the OpenAI Responses API with structured JSON output. Otherwise it returns deterministic local fallback intelligence for demos and development.

Payload:

```json
{
  "message": "Can you share the latest invoice?",
  "niche": "b2b_saas_support",
  "clientContext": {
    "company": "Acme Corp",
    "plan": "Pro",
    "sla": "business-hours"
  },
  "history": [
    {
      "role": "client",
      "message": "Can you share the latest invoice?"
    }
  ],
  "businessRules": "Do not promise refunds before billing review."
}
```

Validation:

- `message` is required.
- `niche` is optional and must be `real_estate` or `b2b_saas_support`.
- `clientContext` is optional and accepts structured context.
- `history` is optional.
- If provided, `history` must be an array.
- `businessRules` is optional text used by the AI path.

Success response data:

```json
{
  "niche": "b2b_saas_support",
  "source": "openai",
  "intent": "billing-support",
  "urgency": "low",
  "sentiment": "neutral",
  "summary": "Client is asking for the latest invoice.",
  "historySummary": "client: Can you share the latest invoice?",
  "detectedSignals": {
    "unpaidInvoice": false,
    "complaint": false,
    "refundRequest": false,
    "lead": false
  },
  "suggestedTags": ["b2b_saas_support", "billing-support", "low-urgency"],
  "nextActions": [
    "Verify billing permissions before sharing invoice details.",
    "Check account status and latest invoice ID.",
    "Route to billing if payment changes are requested."
  ],
  "followUp": {
    "required": true,
    "dueInHours": 24,
    "reason": "Billing requests should be answered within the next business day."
  },
  "replies": {
    "professional": "Thanks for reaching out. I will verify the billing details and share the latest invoice if your account permissions allow it.",
    "friendly": "Thanks for the note. I will check the billing record and help get the latest invoice to you.",
    "assertive": "I have received your invoice request and will verify the billing record before sharing the correct document."
  }
}
```

Possible errors:

- `401 Unauthorized`: missing or invalid JWT.
- `400 Bad Request`: validation failed.

### Integrations

The integrations module gives FlowDesk a normalized layer for WhatsApp, Gmail, Slack, CRM, calendar, and invoice tools. It stores connection metadata and secret references, not raw provider secrets.

#### Create Connection

Method: `POST`

URL: `/integrations/connections`

Auth: Required

Payload:

```json
{
  "channel": "gmail",
  "status": "connected",
  "externalAccountId": "support@example.com",
  "settings": {
    "label": "Customer Support"
  },
  "credentialsRef": {
    "secretName": "gmail-support-oauth"
  }
}
```

#### List Connections

Method: `GET`

URL: `/integrations/connections`

Auth: Required

#### Send Message

Method: `POST`

URL: `/integrations/send`

Auth: Required

Payload:

```json
{
  "channel": "slack",
  "recipient": "C012345",
  "message": "A high-priority support issue needs review."
}
```

#### Ingest External Event

Method: `POST`

URL: `/integrations/ingest`

Auth: Required

Payload:

```json
{
  "channel": "whatsapp",
  "senderName": "Priya Shah",
  "senderEmail": "priya@example.com",
  "message": "I am interested in viewing the apartment today.",
  "niche": "real_estate",
  "metadata": {
    "externalThreadId": "wa_123"
  }
}
```

Use case: Normalize external messages into tenant-scoped clients and incoming messages.

### Users

The `users` controller currently contains simple demo endpoints. The real user persistence logic is used by `AuthService` through `UsersService`.

#### Get Demo Users

Method: `GET`

URL: `/users`

Auth: Required

Use case: Demo endpoint returning a hard-coded list.

Payload: None

Success response data:

```json
["user1", "user2"]
```

#### Get Demo User By ID

Method: `GET`

URL: `/users/:id`

Auth: Required

Use case: Demo endpoint returning a string for the requested ID.

Path params:

| Param | Type   | Example |
| ----- | ------ | ------- |
| `id`  | string | `1`     |

Payload: None

Success response data:

```text
This is a user with id: 1
```

#### Create Demo User

Method: `POST`

URL: `/users`

Auth: Required

Use case: Demo endpoint that validates and echoes the submitted body. It does not save to the database.

Payload:

```json
{
  "name": "John",
  "age": 30
}
```

Validation:

- `name` must be a string with at least 3 characters.
- `age` must be an integer.

Success response data:

```json
{
  "name": "John",
  "age": 30
}
```

## Recommended API Flow

1. Create an account with `POST /auth/signup`.
2. Save the returned `access_token`.
3. Send the token as `Authorization: Bearer <access_token>` for every other request.
4. Create clients with `POST /clients`.
5. Store messages with `POST /messages`.
6. Read client history with `GET /messages/client/:clientId`.
7. Generate suggested replies with `POST /ai/generate-reply`.

## Example cURL Flow

```bash
curl -X POST http://localhost:3100/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"secret123\",\"name\":\"Admin User\"}"
```

```bash
curl -X POST http://localhost:3100/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d "{\"name\":\"Acme Corp\",\"email\":\"contact@acme.com\"}"
```

```bash
curl -X POST http://localhost:3100/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d "{\"clientId\":1,\"message\":\"Can you share the latest invoice?\",\"type\":\"incoming\"}"
```

```bash
curl -X POST http://localhost:3100/ai/generate-reply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d "{\"message\":\"Can you share the latest invoice?\",\"history\":[]}"
```

## Scripts

```bash
pnpm run build       # Compile TypeScript
pnpm run start       # Start app
pnpm run start:dev   # Start app in watch mode
pnpm run start:prod  # Run compiled app from dist
pnpm run lint        # Run ESLint with auto-fix
pnpm run format      # Format source and test files
pnpm run test        # Run unit tests
pnpm run test:e2e    # Run e2e tests
pnpm run test:cov    # Run tests with coverage
```

## Current Implementation Notes

- `AiService` uses OpenAI when configured and otherwise falls back to deterministic local workflow logic.
- `AI` output includes intent, urgency, sentiment, history summary, invoice/refund/complaint/lead signals, tags, next actions, and follow-up timing.
- `Clients` and `Messages` are tenant-scoped by `organizationId`.
- `Messages` now define a TypeORM relation to `Client`.
- `Auth` now returns refresh tokens and supports refresh/logout.
- `Integrations` provide normalized connection/send/ingest endpoints.
- `Audit logs`, rate limiting, CORS, and migration configuration are included as production hardening foundations.
- `UsersController` includes `/users/me`; the remaining demo endpoints should be replaced before production.
- The global JWT guard means newly added endpoints are protected by default unless decorated with `@Public()`.
- The e2e test now verifies the signup request contract with `organizationName`.
