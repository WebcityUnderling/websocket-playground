import { BroadcastMessage } from "./types";
import { type connection } from "websocket";
import { getSessions } from "./sessions";

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
  const sessions = getSessions();
  Object.values(sessions).forEach((session) => {
    messageConnection(message, session.connection);
  });
};
