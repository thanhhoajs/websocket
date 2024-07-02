<p align="center">
  <img src="https://drive.google.com/uc?export=view&id=1_M5tYoaKfXpqsOAPQl3WVWs9u5NWrG76" alt="ThanhHoa Logo" width="300"/>
</p>

# @thanhhoajs/websocket

@thanhhoajs/websocket is a powerful WebSocket library built on top of Bun's native WebSocket implementation.

## Features

- Automatic WebSocket upgrade handling
- Routing support
- Middleware
- Publish/Subscribe
- Message compression
- Backpressure handling
- Full TypeScript support

## Installation

```bash
bun add @thanhhoajs/websocket
```

## Basic Usage

```typescript
import { ThanhHoaWebSocket } from '@thanhhoajs/websocket';

const ws = new ThanhHoaWebSocket({ port: 3000 });

ws.addRoute('/chat', {
  onOpen: (socket) => console.log('New connection'),
  onMessage: (socket, message) => console.log('Received:', message),
});

ws.listen();
```

## API

### Initialization

```typescript
const ws = new ThanhHoaWebSocket(options: ThanhHoaWebSocketOptions);
```

### Adding a route

```typescript
ws.addRoute(path: string, handler: IWebSocketRouteHandler): void;
```

### Adding middleware

```typescript
ws.use(middleware: WebSocketMiddleware): void;
```

### Sending a message

```typescript
ws.send(ws: ServerWebSocket<IThanhHoaWebSocketData>, message: string | Uint8Array, compress?: boolean): number;
```

### Broadcasting

```typescript
ws.broadcast(message: string | Uint8Array, compress?: boolean): void;
```

### Publish/Subscribe

```typescript
ws.subscribe(ws: ServerWebSocket<IThanhHoaWebSocketData>, topic: string): void;
ws.publish(topic: string, message: string | Uint8Array, compress?: boolean): void;
```

## Example

```typescript
import { ThanhHoaWebSocket } from '@thanhhoajs/websocket';

const ws = new ThanhHoaWebSocket({ port: 3000 });

ws.use(async (socket, next) => {
  console.log('New connection from', socket.remoteAddress);
  await next();
});

ws.addRoute('/chat', {
  onOpen: (socket) => console.log('New connection'),
  onMessage: (socket, message) => {
    console.log('Received:', message);
    ws.broadcast(`User said: ${message}`);
  },
});

ws.listen();
console.log(`Server is listening at http://localhost:${ws.port}`);
```

## Benchmark

We conducted a benchmark to test the performance of ThanhHoaWebSocket. Here are the results:

```
Time to connect 100 WebSockets: 31.94ms
Time to send and receive 100000 messages: 687.35ms
```

### Benchmark Details

- **Connections**: 100 WebSocket connections
- **Messages**: 1000 messages per connection (100,000 total)
- **Environment**: [R7 8845H, 32GB 7500MHz, AMD Radeon 780M]

### Interpretation

- The library can establish 100 WebSocket connections in just 31.94ms, demonstrating fast connection handling.
- It can process 100,000 messages (send and receive) in 687.35ms, showing high throughput capabilities.

## License

[MIT License](https://github.com/thanhhoajs/websocket?tab=MIT-1-ov-file)
