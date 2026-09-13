import { Sessions, Session, SessionStatus } from "./types";
import { connection } from "websocket";

const sessions: Sessions = {};

export const createSession = (id: string, connection: connection) => {
  sessions[id] = {
    status: "pending",
    connection,
  };
};

export const getSession = (id: string): Session | null => {
  return sessions[id] ?? null;
};

export const getSessions = (): Sessions => {
  return sessions;
};

export const removeSession = (id: string) => {
  if (sessions[id]) delete sessions[id];
};

export const updateSessionStatus = (id: string, status: SessionStatus) => {
  if (sessions[id]) {
    sessions[id].status = status;
  }
};
