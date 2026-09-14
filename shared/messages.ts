export interface Position {
  x: number;
  y: number;
}

export interface JoinDetails {
  roomCode: string;
  name: string;
  avatar: string;
}

export interface PublicSession {
  name: string | null;
  avatar: string | null;
  position: Position;
}

// Keys are public broadcast IDs, never internal session IDs.
export type BroadcastableSessions = Record<string, PublicSession>;

export type ClientMessage =
  | { action: "join"; content: JoinDetails }
  | { action: "update"; content: Position };

export type BroadcastMessage =
  | { action: "sessions_update"; content: BroadcastableSessions }
  | { action: "user_remove"; from: string; content: string }
  | {
      action: "user_join";
      content: {
        success: true;
        broadcast_id: string;
        sessions: BroadcastableSessions;
      };
    }
  | { action: "user_error"; content: { success: false; error: string } }
  | { action: "sessions_positions"; content: Record<string, Position> };
