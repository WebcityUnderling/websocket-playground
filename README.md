# WebSocket Playground

A real-time shared cursor playground built with Vue, TypeScript, and a Node.js WebSocket server. Join a room with a name and avatar, then see other participants move around the same stage.

This project explores the pieces behind a small multiplayer interface: responsive local input, reactive shared state, typed messages, and server-managed connection lifecycles.

## Try it locally

Use Node.js 22 (the version specified in `.nvmrc`) and npm.

Install the client and server dependencies from the repository root:

```bash
npm ci --prefix server
npm ci --prefix client
```

Start the server:

```bash
npm start --prefix server
```

In a second terminal, start the client:

```bash
npm run dev --prefix client
```

Open the local URL printed by Vite in two browser windows. Enter the room code **MEGAPORT**, choose different names and avatars, and move the mouse inside each stage. Leaving the room removes that participant from the other window.

The server listens on port **8080**. The client currently connects to `ws://localhost:8080/`, so this setup is intended for local use. `npm start` compiles the server before running it; restart it after changing server code.

## Features

- Shared stage displaying each participant's name, avatar, and cursor position.
- Immediate local cursor movement, independent of network round trips.
- Initial session snapshot on a successful join, followed by updates as the room changes.
- Pinia state for the current user and remote sessions.
- Shared TypeScript message definitions for the client and server.
- Separate public broadcast IDs so internal session IDs and socket objects stay on the server.
- Lobby form state preserved with Vue's `KeepAlive` when returning from the room.

## How it works

1. The server accepts a WebSocket connection and creates a pending session with an internal ID and a separate public `broadcast_id`.
2. The client sends its room code, name, and avatar. After validating the code, the server sends the public ID and a snapshot of joined sessions.
3. A cursor engine publishes mouse coordinates to the stage. The stage converts them to local pixel coordinates and only updates its position while the mouse is within its bounds.
4. Local movement renders immediately. Outgoing position messages are throttled to one every **20ms**, including a trailing update.
5. Session changes mark the server state as dirty. One server-wide timer checks every **20ms**, builds and serializes a public snapshot once, and sends it to joined, connected clients. Unchanged state produces no snapshot broadcasts.
6. The client replaces its session map in Pinia. Vue renders remote users from that map, excluding the current user's public ID so its local cursor remains independent of server updates.

Disconnects remove the session, notify the remaining participants, and mark the next snapshot as changed.

### Design choices

**Local state for immediate input; Pinia for shared room state.** The local cursor does not wait for a server response. Other participants' positions come from the server's snapshots.

**Full snapshots for a small room.** Replacing the session map keeps joins, movement, and removals straightforward. Sending only changed positions would reduce traffic for larger rooms.

**Explicit public data.** The snapshot formatter copies only names, avatars, and positions, keyed by public broadcast ID. It also excludes sessions that have not joined.

**Shared message unions.** `ClientMessage` and `BroadcastMessage` use the `action` field to distinguish payload types. These provide compile-time checks; they do not validate incoming JSON at runtime.

## Project layout

```text
client/src/
  components/           Lobby, stage, user display, and form components
  services/             WebSocket connection and outgoing messages
  store/                Pinia room state and incoming message handling
  utils/cursorEngine.ts Mouse tracking and animation-frame subscriptions
  data/avatars.ts       Available avatar aliases and icons
server/
  index.ts              Connection lifecycle and message handlers
  sessions.ts           Session state and public snapshot formatting
  broadcasts.ts         Message delivery and batched session broadcasts
  types.ts              Server-only session and connection types
shared/
  messages.ts           Client/server messages and public payload types
```

## Checks and builds

Run these from the repository root:

```bash
# Check server TypeScript without emitting files
npm run typecheck --prefix server

# Compile the server to server/dist/
npm run build --prefix server

# Build the client to client/dist/
npm run build --prefix client
```

The server entry point is `server/dist/server/index.js`. The client build uses Vite and does not perform a full Vue TypeScript check. There is currently no committed automated test suite.

For repository formatting, install the root development dependencies with `npm ci`, then run `npm run format:check` or `npm run format`.

## MVP scope and next steps

The current version is a single-room, in-memory prototype. Restarting the server clears all sessions, and reconnecting creates a new identity. The room code is a demo gate, not user authentication.

Useful next steps include:

- Runtime validation of incoming messages and graceful handling of malformed JSON.
- Connection error handling and reconnection behaviour.
- Configurable WebSocket URL and room settings for deployment.
- Normalized coordinates so positions line up across different stage sizes.
- Automated coverage for joins, movement, disconnects, and public snapshot contents.
- Full client type checking as part of the build workflow.

## Development

Built as a hands-on Vue and TypeScript learning project. AI assistance was used for guidance, debugging, and parts of the MVP implementation, with the resulting code reviewed and understood by the author.
