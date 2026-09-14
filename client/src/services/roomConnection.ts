import type {
  ClientMessage,
  JoinDetails,
  Position,
} from "../../../shared/messages";

let socket: WebSocket | null = null;

export function connect(details: JoinDetails) {
  const connection = new WebSocket("ws://localhost:8080/");
  socket = connection;

  connection.onopen = () => {
    const payload: ClientMessage = { action: "join", content: details };
    connection.send(JSON.stringify(payload));
  };

  return connection;
}

export function broadcastCoords(position: Position) {
  message({ action: "update", content: position });
}

export function message(payload: ClientMessage) {
  socket?.send(JSON.stringify(payload));
}

export function disconnect() {
  socket?.close();
  socket = null;
}
