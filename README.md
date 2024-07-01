# @thanhhoa/websocket

@thanhhoa/websocket is a powerful WebSocket library built on top of Bun's native WebSocket implementation. It provides an easy-to-use API for creating WebSocket servers with advanced features such as routing, event handling, and pub/sub functionality.

## Features

- Easy-to-use API for creating WebSocket servers
- Route-based WebSocket handling
- Built-in event emitter for custom events
- Support for WebSocket subscriptions and publishing
- Middleware-like headers handling
- Fully typed with TypeScript

## Installation

```bash
bun add @thanhhoa/websocket
```

## Quick Start
Here's a simple example to get you started:

```ts
import { ThanhHoaWebSocket } from "@thanhhoa/websocket";

const wsServer = new ThanhHoaWebSocket({ port: 3000 });

wsServer.addRoute("/chat", {
  onOpen: (ws) => {
    console.log("New connection");
    ws.send("Welcome to the chat!");
  },
  onMessage: (ws, message) => {
    console.log("Received:", message);
    ws.send(`You said: ${message}`);
  },
  onClose: (ws, code, reason) => {
    console.log(`Connection closed: ${code} - ${reason}`);
  },
});

wsServer.listen();
```
## Events
The ThanhHoaWebSocket class extends EventEmitter, allowing you to listen for various events:

- 'open': Emitted when a new WebSocket connection is established.
- 'message': Emitted when a message is received.
- 'close': Emitted when a WebSocket connection is closed.
- 'drain': Emitted when the WebSocket's write buffer becomes empty.

## License
[MIT License](https://github.com/thanhhoajs/websocket?tab=MIT-1-ov-file/)