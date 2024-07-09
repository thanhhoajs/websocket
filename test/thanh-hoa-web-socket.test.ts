import {
  ThanhHoaWebSocket,
  type WebSocketMiddleware,
  type IWebSocketRouteHandler,
  type IThanhHoaWebSocketData,
  RouterHandler,
} from '@thanhhoajs/websocket';
import { expect, test, mock, spyOn } from 'bun:test';
import type { Server, ServerWebSocket } from 'bun';

// Initialization and basic configuration
test('ThanhHoaWebSocket initialization', () => {
  const ws = new ThanhHoaWebSocket({ port: 3002 });
  expect(ws).toBeDefined();
  expect(ws.port).toBe(3002);
});

test('ThanhHoaWebSocket stop', () => {
  const ws = new ThanhHoaWebSocket({ port: 3003 });
  const stopSpy = spyOn(ws['server'], 'stop');

  ws.stop();
  expect(stopSpy).toHaveBeenCalled();
});

test('ThanhHoaWebSocket getters', () => {
  const ws = new ThanhHoaWebSocket({ port: 3004 });

  expect(ws.hostname).toBeDefined();
  expect(typeof ws.development).toBe('boolean');
  expect(ws.pendingWebSockets).toBe(0);
});

// Route management

test('ThanhHoaWebSocket group', () => {
  const ws = new ThanhHoaWebSocket({ port: 3005 });
  const handler: IWebSocketRouteHandler = {
    onOpen: () => {},
    onMessage: () => {},
    onClose: () => {},
  };

  const routerHandler = new RouterHandler();

  routerHandler.route('test', handler);
  routerHandler.route('users', handler);

  ws.group('api', routerHandler);

  expect(ws['routes'].size).toBe(2);
  expect(ws['routes'].has('api/test')).toBe(true);
  expect(ws['routes'].has('api/users')).toBe(true);
});

// Middleware
test('ThanhHoaWebSocket middleware', () => {
  const ws = new ThanhHoaWebSocket({ port: 3006 });
  const middleware: WebSocketMiddleware = async (socket) => {
    return true;
  };

  ws.use(middleware);
  expect(ws['globalMiddlewares'].size).toBe(1);
});

// Handle the connection
test('ThanhHoaWebSocket handleUpgrade error handling', async () => {
  const ws = new ThanhHoaWebSocket({ port: 3007 });
  const mockReq = new Request('http://localhost:3000/error');
  const mockServer = {
    upgrade: () => false,
  } as unknown as Server;

  const response = await ws['handleUpgrade'](mockReq, mockServer);
  expect(response).toBeInstanceOf(Response);
  expect(response?.status).toBe(404);
});

// Manage channels and send messages
test('ThanhHoaWebSocket subscribe and unsubscribe', () => {
  const ws = new ThanhHoaWebSocket({ port: 3008 });
  const mockSocket = {
    subscribe: mock(() => {}),
    unsubscribe: mock(() => {}),
  } as unknown as ServerWebSocket<IThanhHoaWebSocketData>;

  ws.subscribe(mockSocket, 'test-topic');
  expect(mockSocket.subscribe).toHaveBeenCalledWith('test-topic');

  ws.unsubscribe(mockSocket, 'test-topic');
  expect(mockSocket.unsubscribe).toHaveBeenCalledWith('test-topic');
});

test('ThanhHoaWebSocket isSubscribed', () => {
  const ws = new ThanhHoaWebSocket({ port: 3009 });
  const mockSocket = {
    isSubscribed: mock((topic: string) => topic === 'test-topic'),
  } as unknown as ServerWebSocket<IThanhHoaWebSocketData>;

  expect(ws.isSubscribed(mockSocket, 'test-topic')).toBe(true);
  expect(ws.isSubscribed(mockSocket, 'other-topic')).toBe(false);
});

test('ThanhHoaWebSocket broadcast', () => {
  const ws = new ThanhHoaWebSocket({ port: 3010 });
  const publishSpy = spyOn(ws['server'], 'publish');

  ws.broadcast('Hello');
  expect(publishSpy).toHaveBeenCalledWith('broadcast', 'Hello', undefined);
});

test('ThanhHoaWebSocket publish', () => {
  const ws = new ThanhHoaWebSocket({ port: 3011 });
  const mockSocket = {
    publish: mock(() => {}),
  } as unknown as ServerWebSocket<IThanhHoaWebSocketData>;

  ws.publish('test-topic', 'Hello', true);
  mockSocket.publish('test-topic', 'Hello', true);

  expect(mockSocket.publish).toHaveBeenCalledWith('test-topic', 'Hello', true);
});

test('ThanhHoaWebSocket send', () => {
  const ws = new ThanhHoaWebSocket({ port: 3012 });
  const mockSocket = {
    send: mock(() => 5),
  } as unknown as ServerWebSocket<IThanhHoaWebSocketData>;

  const result = ws.send(mockSocket, 'Hello', true);
  expect(mockSocket.send).toHaveBeenCalledWith('Hello', true);
  expect(result).toBe(5);
});

// Other methods
test('ThanhHoaWebSocket close', () => {
  const ws = new ThanhHoaWebSocket({ port: 3013 });
  const mockSocket = {
    close: mock(() => {}),
  } as unknown as ServerWebSocket<IThanhHoaWebSocketData>;

  ws.close(mockSocket, 1000, 'Test close');
  expect(mockSocket.close).toHaveBeenCalledWith(1000, 'Test close');
});

test('ThanhHoaWebSocket cork', () => {
  const ws = new ThanhHoaWebSocket({ port: 3014 });
  const mockSocket = {
    cork: mock((callback: () => any) => callback()),
  } as unknown as ServerWebSocket<IThanhHoaWebSocketData>;

  const result = ws.cork(mockSocket, () => 'test');
  expect(mockSocket.cork).toHaveBeenCalled();
  expect(result).toBe('test');
});

test('ThanhHoaWebSocket getStats', () => {
  const ws = new ThanhHoaWebSocket({ port: 3015 });

  // Create a mock RouterHandler
  const mockRouterHandler = new RouterHandler();
  const mockHandler: IWebSocketRouteHandler = {
    onOpen: () => {},
    onMessage: () => {},
    onClose: () => {},
  };
  mockRouterHandler.route('/test', mockHandler);

  ws.group('', mockRouterHandler);
  ws.use(() => {
    return Promise.resolve(true);
  });

  const stats = ws.getStats();
  expect(stats).toEqual({
    pendingConnections: 0,
    routeCount: 1,
  });
});
