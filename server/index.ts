import * as http from "node:http";
import { randomUUID } from "node:crypto";
import { server as WebSocketServer } from "websocket";

import type { ClientMessage } from "../shared/messages";

import {
  broadcastSessionChanges,
  errorMessageConnection,
  messageAllSessions,
  messageConnection,
} from "./broadcasts";
import {
  createSession,
  getSession,
  removeSession,
  updateSessionStatus,
  initSessionClient,
  updateSessionPosition,
  formatBroadcastableSessions,
} from "./sessions";

const ROOMCODE = "MEGAPORT";

//Server setup
const httpServer = http.createServer();
const wsServer = new WebSocketServer({
  httpServer: httpServer,
});
const broadcastTimer = setInterval(broadcastSessionChanges, 20);
broadcastTimer.unref();
httpServer.on("close", () => clearInterval(broadcastTimer));
httpServer.listen(8080);

// Websocket connections
wsServer.on("request", (request) => {
  const id = randomUUID();

  createSession(id, request.accept(null, request.origin));

  getSession(id)?.connection.on("message", (message) => {
    const session = getSession(id);
    if (!session) return;
    if (message.type !== "utf8") {
      errorMessageConnection("Malformed request", session.connection);
      getSession(id)?.connection.close();
      return;
    }

    const payload = JSON.parse(message.utf8Data) as ClientMessage;
    // later; Change to action map
    if (payload.action === "join") {
      handleJoin(id, payload);
    }
    if (payload.action === "update") {
      handleUpdate(id, payload);
    }
    // other actions here
  });

  getSession(id)?.connection.on("close", () => {
    handleClose(id);
  });
});

type JoinMessage = Extract<ClientMessage, { action: "join" }>;
type UpdateMessage = Extract<ClientMessage, { action: "update" }>;

function handleJoin(id: string, payload: JoinMessage) {
  const { content } = payload;
  const session = getSession(id);

  if (!session) return;

  if (content.roomCode == ROOMCODE) {
    if (session.status === "joined") return;

    updateSessionStatus(id, "joined");
    initSessionClient(id, {
      name: content.name,
      avatar: content.avatar,
      position: { x: 0, y: 0 },
    });
    messageConnection(
      {
        action: "user_join",
        content: {
          success: true,
          broadcast_id: session.broadcast_id,
          sessions: formatBroadcastableSessions(),
        },
      },
      session.connection,
    );
    // Broadcast join to other connections
  } else {
    errorMessageConnection(
      "Enter a valid room code to continue.",
      session.connection,
    );
    session?.connection.close();
  }
}

function handleUpdate(id: string, payload: UpdateMessage) {
  const session = getSession(id);

  if (!session) return;
  updateSessionPosition(id, payload.content);
}

function handleClose(id: string) {
  const session = getSession(id);
  removeSession(id);
  if (session && session?.status == "joined") {
    messageAllSessions({
      action: "user_remove",
      from: session.broadcast_id,
      content: session.broadcast_id,
    });
  }
}
