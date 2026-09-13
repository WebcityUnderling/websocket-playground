import { connection } from "websocket";

export interface Client {
  id: string;
  name: string | null;
  avatar: string | null;
  position: { x: number; y: number };
}

export type Clients = Record<string, Client>;

export type SessionStatus = "pending" | "joined";

export interface Session {
  status: SessionStatus;
  connection: connection;
  client?: Client;
}

export type Sessions = Record<string, Session>;

export type ClientMessage =
  | {
      action: "join";
      content: { roomCode: string; name: string; avatar: string };
    }
  | {
      action: "user_update";
      from: string;
      content: { position: Client["position"] };
    };

export type BroadcastMessage =
  | { action: "user_remove"; from: string; content: string }
  | { action: "user_join"; content: Record<string, string | boolean> }
  | { action: "user_error"; content: Record<string, string | boolean> };
