# QazWorld

A mobile-friendly virtual-world prototype built with React, Vite, Three.js, and React Three Fiber.

## Included in V1
- Interactive stylized 3D town square with orbit camera
- Responsive dashboard and mobile navigation
- Avatar outfit selection through the shop
- Demo profile editing
- Demo coins, daily bonus, inventory, and purchases
- Browser persistence via localStorage

## Run locally
```bash
npm install
npm run dev
``

## Build
```bash
npm run build
``

## Deploy to Cloudflare Pages
Connect this repository to Cloudflare Pages with:
- Build command: `npm run build`
- Build output directory: `dist`

## Important scope note
This is the first front-end prototype. Profile, coins, and inventory are currently stored locally in the browser; they are not secure accounts or shared multiplayer data. The next backend phase should add authenticated Cloudflare Workers/Pages Functions, D1 migrations, server-side validation for currency and purchases, and Durable Objects/WebSockets for live rooms.
