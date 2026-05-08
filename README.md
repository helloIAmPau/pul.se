# pul.se

**pul.se** is an open-source, self-hosted live streaming platform. Broadcasters push a video stream via RTMP (from OBS, ffmpeg, or any compatible encoder), and viewers watch it live or on-demand through the web UI. All recordings are stored automatically and available as VOD after the broadcast ends.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Architecture](#architecture)
  - [Services Overview](#services-overview)
  - [Network Topology](#network-topology)
  - [How Services Communicate](#how-services-communicate)
- [Workflows](#workflows)
  - [User Login](#user-login)
  - [Going Live](#going-live)
  - [Watching a Stream](#watching-a-stream)
  - [Watching a Recording (VOD)](#watching-a-recording-vod)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running in Development](#running-in-development)
  - [Running in Production](#running-in-production)
  - [Applying Database Migrations](#applying-database-migrations)
- [Contributing](#contributing)
  - [Repository Layout](#repository-layout)
  - [Code Style](#code-style)
  - [Making Changes](#making-changes)

---

## What It Does

- **Live streaming**: accept RTMP streams from any compatible encoder (OBS Studio, ffmpeg, etc.)
- **HLS delivery**: convert live RTMP to HLS segments served via CDN-friendly URLs
- **Automatic recording**: every broadcast is saved as a VOD automatically
- **Multi-user**: each user owns their own streams and recordings
- **Authentication**: sign in with Google OAuth; sessions secured with RS256 JWT cookies
- **Web dashboard**: manage streams, copy RTMP endpoints, watch live and archived content

---

## Architecture

### Services Overview

| Service | Language / Runtime | Role | Port (external) |
|---|---|---|---|
| **ingress** | Caddy 2.11 | Reverse proxy, TLS termination | 80 / 443 |
| **web** | Node.js 24 + React 19 | SSR frontend and management dashboard | — (behind ingress) |
| **auth** | Node.js 24 + Express | Google OAuth and JWT issuance | — (behind ingress) |
| **graphql** | Node.js 24 + Express | GraphQL API for stream data | — (behind ingress) |
| **buckets** | Node.js 24 + Express | Proxies HLS files from object storage | — (behind ingress) |
| **remuxer** | Rust + GStreamer | RTMP server, converts to HLS, writes to S3 | 1935 (TCP) |
| **storage** | RustFS | S3-compatible object store (HLS segments + playlists) | — (internal) |
| **postgres** | PostgreSQL 16 | Relational database (users, streams, sessions) | — (internal) |

### Network Topology

```
                          Internet
                              │
                 ┌────────────▼────────────┐
                 │         ingress          │  :80 / :443
                 │       (Caddy 2.11)       │  :1935 RTMP (remuxer direct)
                 └──┬───────┬──────┬───────┘
                    │       │      │
           /auth/*  │  /graphql    │ /buckets/*    (everything else)
                    │       │      │                      │
              ┌─────▼─┐ ┌──▼──┐ ┌─▼──────┐         ┌────▼───┐
              │ auth  │ │graph│ │buckets │         │  web   │
              │       │ │ql   │ │        │         │        │
              └───┬───┘ └──┬──┘ └───┬────┘         └────────┘
                  │        │        │
         ─────────┴────────┴────────┴─────── backend network
                  │        │        │
              ┌───▼────────▼────────▼───┐
              │        postgres          │
              └──────────────────────────┘
              ┌──────────────────────────┐
              │         storage           │  (S3-compatible, RustFS)
              └──────────────────────────┘
                         ▲
              ┌──────────┴───────────┐
              │       remuxer         │  :1935
              └──────────────────────┘
```

### How Services Communicate

**Ingress (Caddy)** routes HTTP traffic based on path prefix:

| Path | Upstream |
|---|---|
| `/auth/*` | `http://auth` |
| `/graphql` | `http://graphql` |
| `/buckets/*` | `http://buckets` |
| everything else | `http://web` |

**auth** talks to **postgres** to upsert users on login.

**graphql** talks to **postgres** to query streams and sessions. It reads the JWT public key from the environment to authenticate requests. Every GraphQL query/mutation is scoped to the calling user via their JWT.

**buckets** talks to **storage** (S3 API at `http://storage:9000`) to fetch HLS playlists and segments, and streams them back to the browser.

**remuxer** receives RTMP connections on port 1935 directly (not through Caddy). It writes HLS segments to **storage** over S3 and records `PLAY` / `STOP` session events to **postgres**.

**web** is a React 19 SSR app. The browser talks to `/auth/valid` (via `auth`) to check login state, to `/graphql` (via `graphql`) for all data, and to `/buckets/streams/:session/:file` (via `buckets`) for HLS video.

---

## Workflows

### User Login

1. Browser visits `/` (landing page).
2. User clicks "Sign in with Google".
3. Browser calls `GET /auth/providers/google` — receives the Google OAuth authorization URL.
4. Browser redirects to Google consent screen.
5. Google redirects to `GET /auth/callback?code=…&state=…`.
6. **auth** exchanges the code for an access token, fetches the user's email from Google.
7. User is inserted into `users` table (or updated if already exists).
8. A signed RS256 JWT is set as an `httpOnly` `ACCESS_TOKEN` cookie.
9. Browser is redirected back to the original URL.

### Going Live

1. User opens the dashboard, copies their RTMP URL (`rtmp://<hostname>/<app>`) and stream key.
2. User configures OBS (or any RTMP encoder) with those values.
3. Encoder connects to **remuxer** on port 1935.
4. **remuxer** validates the stream key against **postgres**.
5. GStreamer pipeline converts the RTMP bitstream to HLS:
   - `.ts` segments uploaded to `s3://streams/<session_uid>/<segment>.ts`
   - `playlist.m3u8` updated continuously
6. A `PLAY` session event is inserted into **postgres**.
7. The dashboard shows the stream in the "Live Now" carousel.

### Watching a Stream

1. Browser queries `GET /graphql` → `live` → returns all active sessions with their HLS URLs.
2. `StreamPreview` cards appear in the "Live Now" section.
3. User navigates to `/theater/<app>`.
4. Browser queries `streamSession(app)` → gets the HLS playlist URL (`/buckets/streams/<session>/playlist.m3u8`).
5. `HLS.js` fetches the playlist and individual `.ts` segments through **buckets**, which proxies them from **storage**.

### Watching a Recording (VOD)

1. Broadcast ends; **remuxer** writes a `STOP` session event to **postgres**.
2. HLS segments remain in **storage** permanently.
3. User navigates to `/streams/<app>` (stream settings).
4. Browser queries `vods(app)` → returns all past sessions with state `STOP`.
5. `VodTable` lists the recordings; user clicks one to watch using the same HLS player.

---

## Database Schema

```
users
  uid       UUID   PK  (auto-generated)
  email     TEXT       (unique)

streams
  key       UUID       (RTMP stream key, auto-generated)
  app       UUID       (stream ID, used in RTMP path, auto-generated)
  name      TEXT       (display name)
  owner     UUID  FK → users.uid
  deleted   BOOL       (soft-delete flag)

sessions
  uid       UUID   PK  (session ID, auto-generated)
  app       UUID  FK → streams.app
  event     TEXT       ('PLAY' | 'STOP')
  timestamp TIMESTAMP  (auto: now())

-- View: stream_sessions
-- Joins sessions + streams, exposes: uid, app, name, state, timestamp, owner
-- Ordered by timestamp DESC
```

Every stream broadcast creates two session rows: one `PLAY` (on connect) and one `STOP` (on disconnect). The session `uid` is used as the S3 prefix for that broadcast's HLS files, making VOD lookup trivial.

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) (v2)
- An NVIDIA GPU with the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) (required by **remuxer** for hardware-accelerated encoding)
- A [Google Cloud project](https://console.cloud.google.com/) with OAuth 2.0 credentials (Client ID + Secret)
- An RSA key pair for JWT signing (see below)

**Generate an RSA key pair:**

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out private.pem
openssl rsa -pubout -in private.pem -out public.pem

# Base64-encode them for the environment variables:
base64 -w 0 private.pem   # → JWT_PRIVATE_KEY
base64 -w 0 public.pem    # → JWT_PUBLIC_KEY
```

### Environment Variables

Copy `.env.develop` as a starting point and fill in every value:

| Variable | Description |
|---|---|
| `PULSE_HOSTNAME` | Public base URL of the deployment (e.g. `https://example.com`) |
| `PULSE_CDN` | Base URL for HLS files (e.g. `https://example.com/buckets/streams`) |
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | PostgreSQL database name |
| `STORAGE_ACCESS_KEY` | S3 access key for RustFS |
| `STORAGE_SECRET_KEY` | S3 secret key for RustFS |
| `JWT_PRIVATE_KEY` | Base64-encoded RSA private key (for signing JWTs) |
| `JWT_PUBLIC_KEY` | Base64-encoded RSA public key (for verifying JWTs) |
| `GOOGLE_OAUTH_CLIENTID` | Google OAuth 2.0 client ID |
| `GOOGLE_OAUTH_CLIENTSECRET` | Google OAuth 2.0 client secret |

In Google Cloud Console, add `<PULSE_HOSTNAME>/auth/callback` as an authorised redirect URI for your OAuth client.

### Running in Development

```bash
# 1. Copy and edit the environment file
cp .env.develop .env.local
# edit .env.local with your values

# 2. Source the environment and start all services with hot reload
source .env.local
npm run develop
```

Development mode (`docker-compose.develop.yml`) mounts the source directories into the containers and runs each service in watch mode. The web UI is served on `http://localhost:8080`.

The RustFS storage console is available at `http://localhost:9001` in development.

### Running in Production

```bash
# 1. Export environment variables (or use a secrets manager)
export PULSE_HOSTNAME=https://example.com
# ... set all variables listed above

# 2. Build and start
docker compose up --build -d
```

The stack listens on ports `80` and `443` (Caddy handles TLS automatically via ACME if `PULSE_HOSTNAME` uses `https://`). RTMP is on port `1935`.

### Applying Database Migrations

Run migrations after first boot and after any schema changes:

```bash
npm run migrate
```

This pipes `migrations.sql` into the running `postgres` container. The script is idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE VIEW`).

---

## Contributing

### Repository Layout

```
/
├── workspaces/@pul.se/
│   ├── web/          # React 19 SSR app (Express + esbuild)
│   ├── auth/         # OAuth + JWT service (Express)
│   ├── graphql/      # GraphQL API (Express + graphql-http)
│   ├── buckets/      # S3 file proxy (Express + AWS SDK)
│   ├── client/       # Shared HTTP fetch wrapper
│   └── postgres/     # Shared PostgreSQL pool
├── remuxer/          # Rust RTMP server + GStreamer pipeline
│   └── src/
│       ├── main.rs       # Bootstrap: S3 bucket, GStreamer init, DB pool, RTMP server
│       ├── protocol.rs   # RTMP connection/stream lifecycle
│       ├── stream.rs     # GStreamer HLS pipeline
│       ├── storage.rs    # S3 upload client
│       └── postgres.rs   # Session event recording
├── data/             # Docker volumes (postgres, rustfs) — not committed
├── migrations.sql    # Database schema (idempotent)
├── Dockerfile        # Multi-stage build for all Node.js services
├── docker-compose.yml
├── docker-compose.develop.yml
└── package.json      # npm workspace root
```

### Code Style

**JavaScript / React**

- Use `function` declarations and expressions — no arrow functions.
- No ternary operators or `&&` short-circuits in JSX — use `if` guard clauses.
- Always use explicit comparisons (`=== true`, `!== null`) — no truthy/falsy coercion.
- List all dependencies in `useCallback` and `useMemo`.
- Make HTTP requests through the `@pul.se/client` wrapper; in React components use the `useGraphql` or `useAuth` hooks.

**Rust**

- Follow standard `rustfmt` and `clippy` conventions.
- Keep S3, PostgreSQL, and GStreamer concerns in their respective modules (`storage.rs`, `postgres.rs`, `stream.rs`).

### Making Changes

1. **Fork** the repository and create a feature branch from `master`.
2. Make your changes, keeping each commit focused on a single concern.
3. For Node.js services, verify the build:
   ```bash
   npm run build --workspace=@pul.se/<service>
   ```
4. For the remuxer:
   ```bash
   cd remuxer && cargo build
   ```
5. Run the full stack locally with `npm run develop` and test your changes end-to-end.
6. Open a pull request against `master` with a clear description of what changed and why.

For significant changes (new features, schema changes, new services) open an issue first to discuss the approach before writing code.
