# QazWorld V2 — backend foundation

This phase adds a Cloudflare Worker API, D1 account/progress storage, and Durable Object WebSocket rooms.

## Included
- Email/password registration and login endpoints.
- PBKDF2-SHA-256 password hashing and signed expiring HMAC tokens.
- D1 schema for users, avatar settings, coins, inventory, and house layout.
- Authenticated progress read/write endpoints.
- WebSocket room relay for presence, movement events, and chat.
- Frontend API helper in src/api.js.

## Cloudflare setup
1. Copy wrangler.example.toml to wrangler.toml.
2. Create D1: npx wrangler d1 create qazworld-db
3. Put the returned database ID into wrangler.toml.
4. Apply the schema: npx wrangler d1 migrations apply qazworld-db --remote
5. Set the secret: npx wrangler secret put JWT_SECRET
6. Build and deploy: npm run build && npx wrangler deploy

The D1 migration must be applied before registration/login. A Worker deployment needs Durable Objects enabled for this app.

## API
- POST /api/auth/register — email, password, username
- POST /api/auth/login — email, password
- GET /api/me — current account
- GET /api/progress — saved progress
- PUT /api/progress — coins, inventory, house, avatar
- WebSocket /api/rooms/:room/ws — authenticated room relay

## Before public launch
Set a strict allowed origin, add per-IP/email rate limiting, email verification and account recovery. The progress write endpoint persists client-supplied coin values and is not yet a secure economy/transaction system; move rewards and purchases to validated server-side actions before public launch. The WebSocket relay is a foundation and needs client-side position synchronization/rendering to display other players. The account and house editor UI still needs wiring to these APIs.
