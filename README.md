# pul.se

**pul.se** is an open-source, self-hosted live streaming platform. Broadcasters push a video stream via RTMP (from OBS, ffmpeg, or any compatible encoder), and viewers watch it live or on-demand through the web UI. All recordings are stored automatically and available as VOD after the broadcast ends.

---

## 🚀 Quick Start

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

The web UI is served on `http://localhost:8080`. The RustFS storage console is available at `http://localhost:9001`.

### Running in Production

```bash
# 1. Export environment variables
export PULSE_HOSTNAME=https://example.com
# ... set all variables

# 2. Build and start
docker compose up --build -d
```

### Applying Database Migrations

Run migrations after first boot and after any schema changes:

```bash
npm run migrate
```

---

## 🏗️ Architecture

### Services Overview

| Service | Language / Runtime | Role |
|---|---|---|
| **ingress** | Caddy 2.11 | Reverse proxy, TLS termination, and path-based routing. |
| **web** | Node.js 24 + React 19 | SSR frontend and management dashboard. |
| **auth** | Node.js 24 + Express | Google OAuth 2.0 and JWT issuance (RS256). |
| **graphql** | Node.js 24 + Express | API for stream data, sessions, and user settings. |
| **buckets** | Node.js 24 + Express | Proxies HLS files from S3-compatible storage to the browser. |
| **remuxer** | Rust + GStreamer | RTMP server, HLS transcoder, and S3 uploader. |
| **storage** | RustFS | S3-compatible object store for HLS segments and playlists. |
| **postgres** | PostgreSQL 16 | Relational database for users, streams, and session events. |

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

---

## 📦 Components

### `remuxer/`
A high-performance RTMP server built in Rust. It uses GStreamer to transcode incoming RTMP bitstreams into HLS segments (`.ts`) and playlists (`.m3u8`). It handles:
- **RTMP Ingest**: Listening on port 1935.
- **Transcoding**: Hardware-accelerated (NVIDIA) HLS segmenting.
- **S3 Uploads**: Writing segments directly to the `storage` service.
- **State Management**: Recording `PLAY` and `STOP` events in PostgreSQL.

### `@pul.se/web`
The main frontend application built with React 19 and served with SSR. It includes:
- **Landing Page**: Information for new users.
- **Dashboard**: For managing streams, keys, and RTMP endpoints.
- **Theater**: A custom HLS player (using `hls.js`) for watching live and archived content.

### `@pul.se/graphql`
The data API layer. It provides a GraphQL schema for querying:
- **Live Streams**: Active broadcast sessions.
- **VODs**: Archived recordings.
- **User Streams**: Stream configurations (keys, names, apps).

### `@pul.se/auth`
Handles authentication via Google OAuth 2.0. It issues RS256-signed JWTs stored in `httpOnly` cookies, which are then verified by other services using the public key.

### `@pul.se/buckets`
A proxy service that fetches HLS files from the private `storage` service and streams them to the browser. This prevents direct exposure of the storage service and allows for future access control.

### `@pul.se/postgres`
A shared internal package that manages the PostgreSQL connection pool using `pg`.

### `@pul.se/client`
A shared HTTP client wrapper that handles fetch requests, JSON parsing, and GraphQL error normalization.

---

## 🔄 Workflows

### Going Live
1. Encoder (OBS) connects to `remuxer` on port 1935.
2. `remuxer` validates the stream key against `postgres`.
3. GStreamer pipeline starts, uploading segments to `s3://streams/<session_uid>/`.
4. A `PLAY` event is inserted into the `events` table.
5. The stream appears as "Live" in the web dashboard.

### Watching a Stream
1. Browser fetches active sessions via GraphQL.
2. Theater page loads the HLS playlist through the `/buckets/` proxy.
3. `HLS.js` manages segment fetching and playback.

---

## 🗄️ Database Schema

### `users`
- `uid` (UUID): Primary key.
- `email` (TEXT): Unique user email.

### `streams`
- `app` (UUID): Unique stream identifier used in the RTMP path.
- `key` (UUID): Private stream key for encoder authentication.
- `name` (TEXT): Display name for the stream.
- `owner` (UUID): FK to `users.uid`.
- `deleted` (BOOL): Soft-delete flag.

### `events`
- `uid` (UUID): Session identifier for a specific broadcast.
- `app` (UUID): FK to `streams.app`.
- `name` (TEXT): Title of the broadcast session.
- `event` (TEXT): Event type (`PLAY` | `STOP`).
- `timestamp` (TIMESTAMP): Time of the event.

### `sessions` (View)
A convenience view that aggregates `events` by `app` and `uid`, joining with `streams` to provide a unified broadcast record.

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines to ensure a smooth process.

### 📝 Reporting Issues & Planning
- **All code changes must be linked to an issue.**
- Before starting work, please open an issue to discuss your proposed changes or report a bug.
- Pull requests that do not reference an open issue will be closed.

### 🎨 Code Style

#### JavaScript & React
- **Declarative Functions**: Use `function` declarations and expressions. **No arrow functions** (`const x = () => ...`).
- **Explicit JSX Control Flow**: Use `if` guard clauses. **No ternary operators** (`a ? b : c`) or **short-circuits** (`a && b`) inside JSX.
- **Strict Comparisons**: Always use explicit comparisons (`=== true`, `!== null`, `=== undefined`). No truthy/falsy coercion.
- **Hooks**: Always list all dependencies in `useCallback` and `useMemo`.
- **Data Fetching**: Use the `@pul.se/client` wrapper or the provided `useGraphql`/`useAuth` hooks.

#### Rust
- Adhere to standard `rustfmt` and `clippy` conventions.
- Maintain strict modularity: keep S3, DB, and GStreamer logic in their respective modules.

### 🚀 Making Changes
1. **Fork** the repository and create a feature branch.
2. Ensure your changes are focused and well-documented.
3. **Link to an issue** in your commit messages (e.g., `Fixes #123`).
4. **Build and Test**:
   - Web services: `npm run build --workspace=@pul.se/<service>`
   - Remuxer: `cd remuxer && cargo build`
   - Run the full stack with `npm run develop` to verify changes end-to-end.
5. Open a **Pull Request** against `master`.
