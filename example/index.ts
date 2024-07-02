import {
  ThanhHoaWebSocket,
  type WebSocketMiddleware,
  type IThanhHoaWebSocketData,
} from '@thanhhoajs/websocket';
import type { ServerWebSocket } from 'bun';

// Middleware example
const loggingMiddleware: WebSocketMiddleware = async (ws, next) => {
  console.log(`New connection from ${ws.remoteAddress}`);
  next();
  console.log(`Connection closed from ${ws.remoteAddress}`);
};

// Initialize ThanhHoaWebSocket with options
const wss = new ThanhHoaWebSocket({
  port: 3001,
  websocket: {
    perMessageDeflate: true,
    idleTimeout: 60,
    maxPayloadLength: 1024 * 1024, // 1 MB
  },
});

// Add middleware
wss.use(loggingMiddleware);

// Add default route
wss.addRoutes('', {
  '/event': {
    onOpen: () => {
      console.log('New event connection from event route');
    },
  },
  '': {
    onOpen: (ws) => {
      wss.subscribe(ws, 'broadcast');
      console.log('New event connection from default route');
    },
  },
});

// Add chat route with authentication and query handling
wss.addRoute('/chat', {
  handleHeaders: (headers) => {
    const authToken = headers.get('Authorization');
    const xToken = headers.get('X-Token');

    return authToken === 'valid-token' && xToken === 'valid-x-token';
  },
  onOpen: (ws, query) => {
    console.log('New chat connection');
    console.log('Query parameters:', query); // Log query parameters

    // Subscribe to chat channel
    // wss.subscribe(ws, 'chat');

    // Example of using query parameters
    if (query && query.room) {
      console.log(`User joined room: ${query.room}`);
      // Subscribe to room-specific channel
      wss.subscribe(ws, `chat:${query.room}`);
    }
  },
  onMessage: async (ws, message) => {
    console.log('Received chat message:', message.toString());
    wss.publish('chat', message, true); // Compress the message

    // Example of using query parameters in message handling
    const query = (ws as ServerWebSocket<IThanhHoaWebSocketData>).data.query;
    if (query && query.room) {
      wss.publish(`chat:${query.room}`, message, true);
    }
  },
  onClose: (ws, code, reason) => {
    console.log(`Chat connection closed: code=${code}, reason=${reason}`);
    wss.unsubscribe(ws, 'chat');

    // Unsubscribe from room-specific channel if applicable
    const query = (ws as ServerWebSocket<IThanhHoaWebSocketData>).data.query;
    if (query && query.room) {
      wss.unsubscribe(ws, `chat:${query.room}`);
    }
  },
});

// Event listeners
wss.on('open', ({ path, remoteAddress, query }, ws) => {
  console.log(`New connection on path: ${path} from ${remoteAddress}`);
  console.log('Query parameters:', query);
});

wss.on('message', ({ path, message }, ws) => {
  console.log(`Received message on path ${path}:`, message.toString());
});

wss.on('close', ({ path, code, reason }, ws) => {
  console.log(
    `Connection closed on path ${path}: code=${code}, reason=${reason}`,
  );
});

wss.on('drain', ({ path }, ws) => {
  console.log(`WebSocket on path ${path} is ready to receive more data`);
});

// Start the server
const server = wss.listen();

console.log(`Server running at ${server.hostname}:${server.port}`);

// Example of broadcasting a message to all clients
setInterval(() => {
  wss.broadcast('Hello everyone!');
}, 10000);

// Example of getting server statistics
setInterval(() => {
  console.log('Server stats:', wss.getStats());
}, 30000);

// Example of room-specific message
setInterval(() => {
  wss.publish('chat:room1', 'Hello Room 1!', true);
}, 15000);

// Example of using cork for batched sends (if applicable)
// Note: This example assumes that there's a way to iterate over connected clients
// If there isn't, this part may need to be removed or adjusted
wss.on('open', (_, ws) => {
  setInterval(() => {
    wss.cork(ws as ServerWebSocket<IThanhHoaWebSocketData>, () => {
      wss.send(ws as ServerWebSocket<IThanhHoaWebSocketData>, 'Message 1');
      wss.send(ws as ServerWebSocket<IThanhHoaWebSocketData>, 'Message 2');
      wss.send(ws as ServerWebSocket<IThanhHoaWebSocketData>, 'Message 3');
    });
  }, 20000);
});
