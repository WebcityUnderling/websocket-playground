import { defineStore } from "pinia";
import { connect } from "../services/roomConnection";
import type { JoinDetails } from "../services/roomConnection";

interface RoomState {
  status: "disconnected" | "connecting" | "joining" | "joined" | "error";
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

        if (message.action === "join") {
          this.status = "joined";
          // Store the returned user ID and room data here.
        }
      };
    },
  },
});
