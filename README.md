# websocket-playground

Just a lil experiment, have fun!

## 1 Setup Server and Client

install packages for both `client` and `server` folders

## 2 Start The Server

From the `server` folder, run `npm start`. This compiles `index.ts` into
`dist/server/index.js` and starts the Node server on port 8080.

Run `npm run typecheck` to check TypeScript without generating files, or
`npm run build` to compile the server separately.

## 3 Start the client

start the client: `npm run dev`

## 4 Open many windows

Open the client in many windows and join the server to see the magic happen.

## Shared message types

`shared/messages.ts` defines `ClientMessage` (client to server) and
`BroadcastMessage` (server to client), plus their shared payload types.
Import these with `import type` in either project. Session and WebSocket
connection types stay in `server/types.ts`.

The `update` payload is `{ x, y }`; the server identifies its sender from
its connection. `users_coords` is a map of session IDs to positions.
Shared types check code at build time; incoming JSON still needs runtime
validation if it is not trusted.
