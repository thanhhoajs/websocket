import {
  ThanhHoaWebSocket,
  type WebSocketMiddleware,
} from '@thanhhoajs/websocket';
import { expect, test, mock } from 'bun:test';

// Initialization and basic configuration
test('ThanhHoaWebSocket initialization', () => {
  const ws = new ThanhHoaWebSocket({ port: 3002 });
  expect(ws).toBeDefined();
  expect(ws.port).toBe(undefined);
});

test('ThanhHoaWebSocket listen and stop', () => {
  const ws = new ThanhHoaWebSocket({ port: 3003 });
  const server = ws.listen();
  expect(server).toBeDefined();
  expect(ws.port).toBe(3003);

  ws.stop();
  expect(ws['server']).toBeNull();
});

test('ThanhHoaWebSocket getters', () => {
  const ws = new ThanhHoaWebSocket({ port: 3004 });
  ws.listen();

  expect(ws.hostname).toBeDefined();
  expect(typeof ws.development).toBe('boolean');
});

// Route management
test('ThanhHoaWebSocket addRoute and removeRoute', () => {
  const ws = new ThanhHoaWebSocket();
  const handler = {
    onOpen: () => {},
    onMessage: () => {},
    onClose: () => {},
  };

  ws.addRoute('/test', handler);
  expect(ws['routes'].size).toBe(1);
  expect(ws['routes'].get('/test')).toBe(handler);

  ws.removeRoute('/test');
  expect(ws['routes'].size).toBe(0);
});

test('ThanhHoaWebSocket addRoutes', () => {
  const ws = new ThanhHoaWebSocket();
  const handlers = {
    '/users': {
      onOpen: () => {},
      onMessage: () => {},
    },
    '/chat': {
      onOpen: () => {},
      onClose: () => {},
    },
  };

  ws.addRoutes('/api', handlers);
  expect(ws['routes'].size).toBe(2);
  expect(ws['routes'].has('/api/users')).toBe(true);
  expect(ws['routes'].has('/api/chat')).toBe(true);
});

test('ThanhHoaWebSocket clearRoutes', () => {
  const ws = new ThanhHoaWebSocket();
  ws.addRoute('/test1', {});
  ws.addRoute('/test2', {});
  expect(ws['routes'].size).toBe(2);

  ws.clearRoutes();
  expect(ws['routes'].size).toBe(0);
});

// Middleware
test('ThanhHoaWebSocket middleware', () => {
  const ws = new ThanhHoaWebSocket();
  const middleware: WebSocketMiddleware = async (socket, next) => {
    next();
  };

  ws.use(middleware);
  expect(ws['middlewares'].length).toBe(1);

  ws.clearMiddleware();
  expect(ws['middlewares'].length).toBe(0);
});

// Connection handling
test('ThanhHoaWebSocket handleUpgrade error handling', async () => {
  const ws = new ThanhHoaWebSocket();
  const mockReq = new Request('http://localhost:3000/error');
  const mockServer = {
    upgrade: () => {
      throw new Error('Upgrade failed');
    },
  } as any;

  const response = await ws['handleUpgrade'](mockReq, mockServer);
  expect(response).toBeInstanceOf(Response);
  expect((response as Response).status).toBe(404);
});

// Manage channels and send messages
test('ThanhHoaWebSocket subscribe and unsubscribe', () => {
  const ws = new ThanhHoaWebSocket();
  const mockSocket = {
    subscribe: mock(() => {}),
    unsubscribe: mock(() => {}),
  } as any;

  ws.subscribe(mockSocket, 'test-topic');
  expect(mockSocket.subscribe).toHaveBeenCalledWith('test-topic');

  ws.unsubscribe(mockSocket, 'test-topic');
  expect(mockSocket.unsubscribe).toHaveBeenCalledWith('test-topic');
});

test('ThanhHoaWebSocket isSubscribed', () => {
  const ws = new ThanhHoaWebSocket();
  const mockSocket = {
    isSubscribed: mock((topic: string) => topic === 'test-topic'),
  } as any;

  expect(ws.isSubscribed(mockSocket, 'test-topic')).toBe(true);
  expect(ws.isSubscribed(mockSocket, 'other-topic')).toBe(false);
});

test('ThanhHoaWebSocket broadcast', () => {
  const ws = new ThanhHoaWebSocket();
  ws.listen();

  const publishMock = mock(() => {});
  ws['server'] = { publish: publishMock } as any;

  ws.broadcast('Hello');
  expect(publishMock).toHaveBeenCalledWith('broadcast', 'Hello', undefined);
});

test('ThanhHoaWebSocket publish', () => {
  const ws = new ThanhHoaWebSocket({
    port: 3005,
  });
  ws.listen();

  const publishMock = mock(() => {});
  ws['server'] = { publish: publishMock } as any;

  ws.publish('test-topic', 'Hello', true);
  expect(publishMock).toHaveBeenCalledWith('test-topic', 'Hello', true);
});

test('ThanhHoaWebSocket send', () => {
  const ws = new ThanhHoaWebSocket();
  const mockSocket = {
    send: mock(() => 5),
  } as any;

  const result = ws.send(mockSocket, 'Hello', true);
  expect(mockSocket.send).toHaveBeenCalledWith('Hello', true);
  expect(result).toBe(5);
});

// Other methods
test('ThanhHoaWebSocket close', () => {
  const ws = new ThanhHoaWebSocket();
  const mockSocket = {
    close: mock(() => {}),
  } as any;

  ws.close(mockSocket, 1000, 'Test close');
  expect(mockSocket.close).toHaveBeenCalledWith(1000, 'Test close');
});

test('ThanhHoaWebSocket cork', () => {
  const ws = new ThanhHoaWebSocket();
  const mockSocket = {
    cork: mock((callback: () => any) => callback()),
  } as any;

  const result = ws.cork(mockSocket, () => 'test');
  expect(mockSocket.cork).toHaveBeenCalled();
  expect(result).toBe('test');
});

test('ThanhHoaWebSocket getStats', () => {
  const ws = new ThanhHoaWebSocket();
  ws.addRoute('/test', {});
  ws.use(() => {});

  const stats = ws.getStats();
  expect(stats).toEqual({
    pendingConnections: 0,
    routeCount: 1,
    middlewareCount: 1,
  });
});
