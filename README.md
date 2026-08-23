# Node Express Starter

A production-ready, highly structured REST API starter template built with **Express 5**, **TypeScript**, **PostgreSQL**, and **Drizzle ORM**.

---

## Highlights

- **Express 5 + TypeScript**: Modern backend architecture with native async routing and strict typing.
- **PostgreSQL & Drizzle ORM**: Type-safe relational database modeling, connection pooling, and automated migrations.
- **Containerized Stack (Docker & Podman)**: One-command infrastructure for **PostgreSQL 16**, **Redis 7**, and **MinIO (S3 object storage)**.
- **Automated OpenAPI Documentation**: Live dual interactive API docs with **Scalar UI** (`/scaler`) and **Swagger UI** (`/swagger`) generated directly from Zod schemas.
- **Module Generator CLI**: Scaffold new API domain modules (routes, schemas, OpenAPI contracts, and services) with `pnpm generate:module`.
- **Production-Ready Features**:
  - JWT Authentication & RBAC (Role-based access control + ownership verification)
  - Unified `ApiResponse<T>` envelope & centralized PostgreSQL error translation
  - Winston multi-transport rotating logs & colorized Morgan HTTP access logger
  - Multer disk storage for image uploads (`/uploads`)
  - Nodemailer email transport integration

---

## Quick Start

### 1. Clone & Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

### 3. Start Local Infrastructure
Use either **Podman** or **Docker**:

```bash
# Using Podman
pnpm podman:up

# Or using Docker
pnpm docker:up
```

### 4. Push Database Schema
```bash
pnpm db:push
```

### 5. Start Development Server
```bash
pnpm dev
```

Server runs at `http://localhost:4000`.

---

## Interactive Documentation & Tools

| Interface | URL / Command | Description |
|---|---|---|
| **Scalar UI** | `http://localhost:4000/scaler` | Modern interactive API documentation |
| **Swagger UI** | `http://localhost:4000/swagger` | OpenAPI Swagger documentation |
| **OpenAPI Spec** | `http://localhost:4000/api-docs.json` | Raw OpenAPI 3.0 JSON specification |
| **Drizzle Studio** | `pnpm db:studio` | Visual database browser & manager |
| **MinIO Console** | `http://localhost:9001` | S3 storage web UI (`minioadmin` / `minioadminpassword`) |

---

## Project Structure

```
src/
├── api/            # Self-contained domain API modules (routes, schemas, services)
├── common/         # Centralized APP_CONFIG metadata, openAPITags & constants
├── data/           # Static seed and lookup data
├── db/             # Drizzle ORM client, pool, and table schemas (src/db/schema/)
├── helpers/        # ResponseHandler envelope and PostgreSQL dbErrorHandler
├── lib/            # Utilities (JWT, Winston logger, Multer, Nodemailer, OpenAPI)
└── middleware/     # Auth, RBAC, Zod validation, and global error handlers
```

---

## Useful Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server with hot-reload |
| `pnpm build` | Bundle application for production with `tsdown` |
| `pnpm start` | Run compiled production bundle |
| `pnpm generate:module` | Scaffold a new API domain module |
| `pnpm db:push` | Push schema directly to PostgreSQL (prototyping) |
| `pnpm db:generate` | Generate SQL migration files |
| `pnpm db:migrate` | Apply pending SQL migrations |
| `pnpm db:studio` | Launch Drizzle Studio web GUI |
| `pnpm check-types` | Run TypeScript type-check |
| `pnpm check` | Run fast semantic linting with Oxlint |
| `pnpm format` | Format code with Biome |

---

## License

MIT
