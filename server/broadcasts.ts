import type { BroadcastMessage } from "../shared/messages";
import { type connection } from "websocket";
import {
  getSessions,
  consumeSessionsChanged,
  formatBroadcastableSessions,
} from "./sessions";

export const messageConnection = (
  message: BroadcastMessage,
  connection: connection,
) => {
  connection.send(JSON.stringify(message));
};

export const errorMessageConnection = (
  error: string,
  connection: connection,
) => {
  messageConnection(
    {
      action: "user_error",
      content: {
        success: false,
        error: error,
      },
    },
    connection,
  );
};

export const messageAllSessions = (message: BroadcastMessage) => {
  const serialized = JSON.stringify(message);
  for (const session of Object.values(getSessions())) {
    if (session.status === "joined" && session.connection.connected) {
      session.connection.send(serialized);
    }
  }
};

export const broadcastSessionChanges = () => {
  if (!consumeSessionsChanged()) return;
  messageAllSessions({
    action: "sessions_update",
    content: formatBroadcastableSessions(),
  });
};
