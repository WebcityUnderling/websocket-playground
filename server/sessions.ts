import { randomUUID } from "node:crypto";
import type { Position, BroadcastableSessions } from "../shared/messages";
import { Sessions, Session, SessionStatus, Client } from "./types";
import { connection } from "websocket";

const sessions: Sessions = {};
let sessionsChanged = false;

export const consumeSessionsChanged = (): boolean => {
  const changed = sessionsChanged;
  sessionsChanged = false;
  return changed;
};

export const createSession = (id: string, connection: connection) => {
  sessions[id] = {
    broadcast_id: randomUUID(),
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

export const formatBroadcastableSessions = (): BroadcastableSessions => {
  const publicSessions: BroadcastableSessions = {};
  for (const session of Object.values(sessions)) {
    if (session.status !== "joined" || !session.client) continue;
    const { name, avatar, position } = session.client;
    publicSessions[session.broadcast_id] = {
      name,
      avatar,
      position: { x: position.x, y: position.y },
    };
  }
  return publicSessions;
};

export const removeSession = (id: string) => {
  if (sessions[id]) {
    if (sessions[id].status === "joined") sessionsChanged = true;
    delete sessions[id];
  }
};

export const updateSessionStatus = (id: string, status: SessionStatus) => {
  if (sessions[id] && sessions[id].status !== status) {
    sessionsChanged = true;
    sessions[id].status = status;
  }
};

export const initSessionClient = (id: string, client: Client) => {
  if (sessions[id]) {
    sessions[id].client = client;
    if (sessions[id].status === "joined") sessionsChanged = true;
  }
};

export const updateSessionPosition = (id: string, position: Position) => {
  const session = sessions[id];
  if (!session || session.status !== "joined" || !session.client) return;
  const current = session.client.position;
  if (current.x === position.x && current.y === position.y) return;
  session.client.position = { x: position.x, y: position.y };
  sessionsChanged = true;
};
