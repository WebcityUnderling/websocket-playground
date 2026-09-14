import { defineStore } from "pinia";
import { connect, disconnect } from "../services/roomConnection";
import type {
  JoinDetails,
  BroadcastMessage,
  BroadcastableSessions,
} from "../../../shared/messages";
import { usableAvatars } from "../data/avatars";

interface RoomState {
  status: "disconnected" | "joined" | "error";
  error: null | string;
  broadcastId: string | null;
  sessions: BroadcastableSessions;
  userData: { name: string; avatar: string } | null;
}

export const useRoomStore = defineStore("room", {
  state: (): RoomState => ({
    status: "disconnected",
    error: null,
    userData: null,
    broadcastId: null,
    sessions: {},
  }),

  actions: {
    joinRoom(details: JoinDetails) {
      this.status = "disconnected";
      this.error = null;
      this.broadcastId = null;
      this.sessions = {};

      const connection = connect(details);

      connection.onmessage = (event) => {
        const message = JSON.parse(event.data) as BroadcastMessage;
        if (message.action === "user_join") {
          const { success } = message.content;
          if (success) {
            const avatardisplay =
              usableAvatars.find((avatar) => avatar.alias === details.avatar)
                ?.icon ?? "";
            this.broadcastId = message.content.broadcast_id;
            this.sessions = message.content.sessions;
            this.status = "joined";
            this.userData = { name: details.name, avatar: avatardisplay };
          }
        }
        if (message.action === "user_error") {
          this.error = message.content.error;
          this.status = "error";
        }
        if (message.action === "sessions_update") {
          this.sessions = message.content;
        }
        if (message.action === "user_remove") {
          delete this.sessions[message.content];
        }
      };
    },
    leaveRoom() {
      this.status = "disconnected";
      this.sessions = {};
      this.broadcastId = null;
      disconnect();
    },
  },
});
