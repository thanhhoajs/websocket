<p align="center">
  <img src="https://drive.google.com/uc?export=view&id=1_M5tYoaKfXpqsOAPQl3WVWs9u5NWrG76" alt="ThanhHoa Logo" width="300"/>
</p>

# @thanhhoajs/websocket

A high-performance, feature-rich WebSocket library supercharging Bun's native WebSocket implementation. Designed for developers who demand speed, flexibility, and ease of use in their real-time applications.

@thanhhoajs/websocket seamlessly blends the raw power of Bun's WebSocket with an intuitive API, bringing you the best of both worlds. Whether you're building a chat application, a live dashboard, or a complex real-time system, this library provides the tools you need to create robust, scalable WebSocket servers with minimal effort.

Key highlights:

- 🚀 Lightning-fast performance leveraging Bun's speed
- 🛠 Intuitive routing and middleware system
- 📡 Built-in pub/sub functionality for effortless broadcasting
- 🔒 TypeScript support for type-safe development
- 🎛 Fine-grained control over WebSocket lifecycle events
- 🧩 Easily extensible for custom use cases

Embrace the future of real-time web applications with @thanhhoajs/websocket – where performance meets developer productivity.

## Features

- **High Performance**: Built on Bun's native WebSocket implementation for optimal speed and efficiency
- **Easy Setup**: Simple API to quickly create and configure WebSocket servers
- **Routing System**: Flexible routing mechanism to handle different WebSocket endpoints
- **Middleware Support**: Global and route-specific middleware for customizable request/message processing
- **Event-Driven Architecture**: Built-in event system for easy handling of WebSocket lifecycle events
- **Grouping Routes**: Ability to group routes with common prefixes for better organization
- **Pub/Sub Functionality**: Built-in publish/subscribe system for efficient message broadcasting
- **Type Safety**: Full TypeScript support for enhanced developer experience and code reliability
- **Custom Data Handling**: Support for attaching custom data to WebSocket connections
- **Flexible Message Types**: Handle string, Buffer, and various ArrayBuffer types for messages
- **Header Validation**: Option to validate headers before upgrading to WebSocket connection
- **Query and Param Parsing**: Automatic parsing of URL query parameters and route params
- **Broadcast Capability**: Easily send messages to all connected clients
- **Topic-Based Communication**: Subscribe clients to specific topics and publish messages to those topics
- **Connection Management**: Methods to handle WebSocket connections, including subscription status checks
- **Graceful Shutdown**: Ability to stop the WebSocket server cleanly
- **Server Statistics**: Access to server stats like pending connections and route count
- **Compression Support**: Option to compress messages for reduced bandwidth usage
- **Customizable Serve Options**: Flexible configuration options inherited from Bun's WebSocket serve options
- **Error Handling**: Built-in error handling and event emission for various WebSocket scenarios
- **Extensibility**: Easy to extend and integrate with other parts of your application
- **Low Memory Footprint**: Efficient memory usage, ideal for high-concurrency scenarios
- **Cross-Platform**: Works on any platform supported by Bun
- **Open Source**: MIT licensed for use in both personal and commercial projects

## Installation

Make sure you have Bun installed (version 1.0.0 or later). Then, you can install the package using:

```bash
bun add @thanhhoajs/websocket
```

## Quick Start

Here's a simple example of how to use ThanhHoaWebSocket:

```typescript
import { ThanhHoaWebSocket, RouterHandler } from '@thanhhoajs/websocket';

const ws = new ThanhHoaWebSocket({ port: 3000 });
const router = new RouterHandler();

router.route('chat', {
  onOpen: (ws, query, params) => {
    console.log('New connection');
    ws.send('Welcome to the chat!');
  },
  onMessage: (ws, message) => {
    console.log(`Received: ${message}`);
    ws.send(`You said: ${message}`);
  },
  onClose: (ws, code, reason) => {
    console.log(`Connection closed: ${code} - ${reason}`);
  },
});

ws.group('', router);

console.log(`WebSocket server is running on ws://localhost:${ws.port}`);
```

## Advanced Usage

Here's an example showcasing more advanced features of ThanhHoaWebSocket, including middleware, grouping, pub/sub functionality, and custom data handling:

```typescript
import {
  ThanhHoaWebSocket,
  RouterHandler,
  type WebSocketMiddleware,
  type IThanhHoaWebSocketData,
} from '@thanhhoajs/websocket';
import type { ServerWebSocket } from 'bun';

// Create a new WebSocket server
const ws = new ThanhHoaWebSocket({ port: 3000 });
const router = new RouterHandler();

// Define a middleware
const authMiddleware: WebSocketMiddleware = async (
  ws: ServerWebSocket<IThanhHoaWebSocketData>,
) => {
  const token = ws.data.headers.get('Authorization');
  if (!token) {
    ws.close(1008, 'Unauthorized');
    return;
  }
  // Perform token validation here
  ws.data.custom = { userId: 'user123' }; // Attach custom data
};

// Define route handlers
const chatHandler = {
  handleHeaders: (headers: Headers) => {
    // Validate headers before upgrading to WebSocket
    return headers.has('X-Chat-Version');
  },
  onOpen: (
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    query?: Record<string, string>,
  ) => {
    console.log(`New chat connection. User ID: ${ws.data.custom?.userId}`);
    ws.subscribe('general'); // Subscribe to 'general' topic
    ws.send('Welcome to the chat!');
  },
  onMessage: (
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    message: string | Buffer,
  ) => {
    console.log(`Received: ${message}`);
    ws.publish('general', `User ${ws.data.custom?.userId} says: ${message}`);
  },
  onClose: (
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    code: number,
    reason: string,
  ) => {
    console.log(`Chat connection closed: ${code} - ${reason}`);
  },
};

// Add routes
router.route('chat', authMiddleware, chatHandler);

// Group routes
ws.group('api', authMiddleware, router);

// Global error handling
ws.on('error', (error, ws) => {
  console.error('WebSocket error:', error);
  ws.close(1011, 'Internal Server Error');
});

// Broadcast server status every 5 seconds
setInterval(() => {
  const stats = ws.getStats();
  ws.broadcast(JSON.stringify({ type: 'serverStatus', data: stats }));
}, 5000);

console.log(
  `Advanced WebSocket server is running on ws://localhost:${ws.port}`,
);
```

This advanced example demonstrates:

1. Using middleware for authentication
2. Custom header validation
3. Attaching and using custom data on WebSocket connections
4. Implementing pub/sub with topics
5. Grouping routes with a common prefix
6. Global error handling
7. Broadcasting server statistics to all clients
8. Using the event emitter for custom events

## API Overview

### ThanhHoaWebSocket

The main class for creating and managing a WebSocket server.

- `constructor(options: ThanhHoaWebSocketOptions)`: Creates a new WebSocket server
- `use(middleware: WebSocketMiddleware)`: Adds a global middleware
- `group(prefix: string, ...args: (WebSocketMiddleware | RouterHandler)[])`: Groups routes with a common prefix
- `broadcast(message: string | ArrayBufferView | ArrayBuffer | SharedArrayBuffer, compress?: boolean)`: Sends a message to all connected clients
- `subscribe(ws: ServerWebSocket, topic: string)`: Subscribes a client to a topic
- `publish(ws: ServerWebSocket, topic: string, message: string | Bun.BufferSource, compress?: boolean)`: Publishes a message to a topic

### RouterHandler

Manages WebSocket routes.

- `route(path: string, ...args: (WebSocketMiddleware | IWebSocketRouteHandler)[])`: Adds a new route

## Performance

ThanhHoaWebSocket is built for high performance. In our benchmarks:

```
Time to connect 16 WebSockets: 10.21ms
Time to send and receive 1,000,000 messages: 5849.82ms
```

### Benchmark Details

- **Connections**: 16 WebSocket connections
- **Messages**: 62500 messages per connection (1,000,000 total)
- **Environment**: [R7 8845H, 32GB 7500MHz, AMD Radeon 780M]

### Interpretation

- The library can establish 100 WebSocket connections in just 10.21ms, demonstrating fast connection handling.
- It can process 1,000,000 messages (send and receive) in 5849.82ms, showing high throughput capabilities.

## Author

Nguyen Nhu Khanh <kwalker.nnk@mail.com>

## License

[MIT License](https://github.com/thanhhoajs/websocket?tab=MIT-1-ov-file)
