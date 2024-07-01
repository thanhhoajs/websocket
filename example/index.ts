import { ThanhHoaWebSocket } from "@thanhhoa/websocket";

const wss = new ThanhHoaWebSocket({
  port: 3001,
  websocket: {
    perMessageDeflate: true,
    idleTimeout: 60,
    maxPayloadLength: 1024 * 1024, // 1 MB
  },
});

wss.addRoute("/chat", {
  handleHeaders: (headers) => {
    const authToken = headers.get("Authorization");
    const xToken = headers.get("X-Token");

    if (authToken === "valid-token" && xToken === "valid-x-token") {
      return true;
    }
    return false;
  },
  onOpen: (ws) => {
    console.log("New chat connection");
    wss.subscribe(ws, "chat");
  },
  onMessage: async (ws, message) => {
    console.log("Received chat message:", message.toString());
    wss.publish("chat", message, true); // Compress the message
  },
  onClose: (ws, code, reason) => {
    console.log(`Chat connection closed: code=${code}, reason=${reason}`);
    wss.unsubscribe(ws, "chat");
  },
});

wss.on("open", ({ path, remoteAddress }, ws) => {
  console.log(`New connection on path: ${path} from ${remoteAddress}`);
});

wss.on("message", ({ path, message }, ws) => {
  console.log(`Received message on path ${path}:`, message.toString());
});

wss.on("close", ({ path, code, reason }, ws) => {
  console.log(
    `Connection closed on path ${path}: code=${code}, reason=${reason}`
  );
});

wss.on("drain", ({ path }, ws) => {
  console.log(`WebSocket on path ${path} is ready to receive more data`);
});

const server = wss.listen();

console.log(`Server running at ${server.hostname}:${server.port}`);
