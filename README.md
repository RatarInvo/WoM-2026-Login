# WoM-2026 Login API

Authentication service for the Notes App. It provides user registration, username/password login, and JWT tokens used by the Notes REST API and WebSocket service.

The deployed service is available at:

```text
https://wom-2026-login.onrender.com/
```

The root URL serves the interactive API documentation. A JSON service status response is available at `/health`.

## Features

- Register users with a bcrypt-hashed password
- Authenticate users with username and password
- Issue JWT tokens that expire after 30 days
- Include the user ID, username, and role in each token
- PostgreSQL persistence through Prisma
- CORS support for the Notes frontend
- Docker support for local development and deployment

## Requirements

- Node.js 24 or later
- PostgreSQL database
- npm

## Configuration

Create a `.env` file in the project root. Keep real database credentials and secrets out of version control.

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
JWT_SECRET="replace-with-the-secret-shared-by-the-other-services"
PORT=3000
MODE=development
```

`JWT_SECRET` must be identical in this service and in the Notes REST API. The Notes API uses the `sub`, `name`, and `role` claims issued at login.

## Installation

```bash
npm install
npx prisma generate
```

Apply the Prisma schema to a development database when needed:

```bash
npx prisma db push
```

## Running locally

Start the server:

```bash
npm start
```

Start the development server with Nodemon:

```bash
npm run dev
```

The service listens on `http://localhost:3000/`.

## API endpoints

### Documentation

```http
GET /
```

Serves the interactive API documentation page.

### Health/status

```http
GET /health
```

Response:

```json
{
  "msg": "login API",
  "version": "0.1"
}
```

### List users

```http
GET /login
GET /register
```

Returns users ordered by ID. The current implementation returns the stored user records, including database fields. Production clients should avoid exposing password hashes.

### Get one user

```http
GET /login/:id
```

Returns a user by UUID, or `404` if no matching user exists.

### Register

```http
POST /register
Content-Type: application/json
```

Request:

```json
{
  "username": "Albin",
  "password_hash": "password123",
  "role": "user",
  "email": "albin@example.com"
}
```

The `password_hash` request field contains the plain-text password supplied by the client; the service hashes it with bcrypt before storing it. The response does not return the password hash:

```json
{
  "msg": "user created",
  "id": "user-uuid"
}
```

### Login

```http
POST /login
Content-Type: application/json
```

Request:

```json
{
  "username": "Albin",
  "password_hash": "password123"
}
```

Successful response:

```json
{
  "msg": "Login successful",
  "id": "user-uuid",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

The JWT is signed with `JWT_SECRET` and expires after 30 days. Failed usernames and passwords return:

```json
{
  "msg": "Authentication failed"
}
```

with status `401`.

## Using the JWT

Pass the token to protected services as a Bearer token:

```http
Authorization: Bearer <your-jwt>
```

Example request to the Notes API:

```bash
curl https://wom-2026-rest-api.onrender.com/boards \
  -H "Authorization: Bearer <your-jwt>"
```

The token payload issued by this service contains:

```json
{
  "sub": "user-uuid",
  "name": "Albin",
  "role": "user"
}
```

## Error responses

| Status | Meaning |
| --- | --- |
| `401` | Missing, invalid, or incorrect login credentials |
| `404` | Requested user does not exist |
| `500` | Unexpected database or server error |

## Docker

Build and start the service with Docker Compose:

```bash
docker compose up --build
```

The container exposes port `3000`. Provide `DATABASE_URL`, `JWT_SECRET`, and `MODE` through the environment used by Docker Compose.

## Project structure

```text
src/
├── middleware/authorize.js   JWT verification middleware
├── routes/login.js           Login and user lookup routes
├── routes/register.js        Registration routes
├── server.js                 Express server entry point
└── static/index.html         API documentation page
prisma/schema.prisma          User database schema
```

## Related services

- Login API: `https://wom-2026-login.onrender.com`
- Notes API: `https://wom-2026-rest-api.onrender.com`
- Notes API WebSocket: `wss://wom-2026-rest-api.onrender.com/?token=<your-jwt>`
