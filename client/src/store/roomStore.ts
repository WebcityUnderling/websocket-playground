import { defineStore } from "pinia";
import { connect, disconnect } from "../services/roomConnection";
import type { JoinDetails } from "../services/roomConnection";

interface RoomState {
  status: "disconnected" | "joined" | "error";
  error: null | string;
}

export const useRoomStore = defineStore("room", {
  state: (): RoomState => ({ status: "disconnected", error: null }),

  actions: {
    joinRoom(details: JoinDetails) {
      this.status = "connecting";
      this.error = null;

      const connection = connect(details);

      connection.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const { success, error } = message.content;
        if (success) this.status = "joined";
        if (error) this.error = error;
      };
    },
    leaveRoom() {
      this.status = "disconnected";
      disconnect();
    },
  },
});
