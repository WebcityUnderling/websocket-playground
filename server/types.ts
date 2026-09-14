import type { Position } from "../shared/messages";
import { connection } from "websocket";

export interface Client {
  name: string | null;
  avatar: string | null;
  position: Position;
}

export type SessionStatus = "pending" | "joined";

export interface Session {
  broadcast_id: string;
  status: SessionStatus;
  connection: connection;
  client?: Client;
}

export type Sessions = Record<string, Session>;
