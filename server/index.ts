import * as http from "node:http";
import { randomUUID } from "node:crypto";
import { server as WebSocketServer } from "websocket";

import { ClientMessage } from "./types";

import {
  errorMessageConnection,
  messageAllSessions,
  messageConnection,
} from "./broadcasts";
import {
  createSession,
  getSession,
  removeSession,
  updateSessionStatus,
} from "./sessions";

const ROOMCODE = "MEGAPORT";

//Server setup
const httpServer = http.createServer();
const wsServer = new WebSocketServer({
  httpServer: httpServer,
});
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
    // other actions here
  });

  getSession(id)?.connection.on("close", () => {
    handleClose(id);
  });
});

type JoinMessage = Extract<ClientMessage, { action: "join" }>;

function handleJoin(id: string, payload: JoinMessage) {
  const { content } = payload;
  const session = getSession(id);

  if (!session) return;

  if (content.roomCode == ROOMCODE) {
    if (session.status === "joined") return;

    updateSessionStatus(id, "joined");
    messageConnection(
      { action: "user_join", content: { success: true } },
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

function handleClose(id: string) {
  const session = getSession(id);
  if (session && session?.status == "joined") {
    messageAllSessions({
      action: "user_remove",
      from: id,
      content: id,
    });
    removeSession(id);
  }
}
