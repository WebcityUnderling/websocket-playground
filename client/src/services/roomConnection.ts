export interface JoinDetails {
  roomCode: string;
  name: string;
  avatar: string;
}

let socket: WebSocket | null = null;

export function connect(details: JoinDetails) {
  const connection = new WebSocket("ws://localhost:8080/");
  socket = connection;

  connection.onopen = () => {
    connection.send(
      JSON.stringify({
        action: "join",
        content: details,
      }),
    );
  };

  return connection;
}

export function disconnect() {
  socket?.close();
  socket = null;
}
