import { Logger } from '@thanhhoajs/logger';
import {
  EventEmitter,
  type IThanhHoaWebSocketData,
  type ThanhHoaWebSocketOptions,
  type WebSocketMiddleware,
  Route,
  RouterHandler,
} from '@thanhhoajs/websocket';
import type { Server, ServerWebSocket, WebSocketServeOptions } from 'bun';

/**
 * Main class for managing the WebSocket server.
 * @extends EventEmitter
 */
export class ThanhHoaWebSocket extends EventEmitter {
  private options: WebSocketServeOptions<IThanhHoaWebSocketData>;
  private server: Server;
  private routes: Map<string, Route> = new Map();
  private globalMiddlewares: Set<WebSocketMiddleware> = new Set();

  /**
   * Creates a new instance of ThanhHoaWebSocket.
   * @param {ThanhHoaWebSocketOptions} [options={}] - Options for the WebSocket server.
   */
  constructor(options: ThanhHoaWebSocketOptions = {}) {
    super();
    this.options = {
      port: options.port || 3001,
      fetch: this.handleUpgrade.bind(this),
      websocket: {
        message: this.handleMessage.bind(this),
        open: this.handleOpen.bind(this),
        close: this.handleClose.bind(this),
        drain: this.handleDrain.bind(this),
        ...options.websocket,
      },
    };
    this.server = Bun.serve(this.options);
  }

  /**
   * Adds a global middleware.
   * @param {WebSocketMiddleware} middleware - The middleware to add.
   */
  use(middleware: WebSocketMiddleware): void {
    this.globalMiddlewares.add(middleware);
  }

  private async applyMiddlewares(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    middlewares: Set<WebSocketMiddleware>,
  ): Promise<boolean> {
    for (const middleware of middlewares) {
      await middleware(ws);
    }
    return true;
  }

  private async handleUpgrade(
    req: Request,
    server: Server,
  ): Promise<Response | undefined> {
    const url = new URL(req.url);
    const pathname = url.pathname.replace(/^\/+|\/+$/g, '');

    let matchedRoute: Route | undefined;
    let params: Record<string, string> = {};
    for (const [routePath, route] of this.routes) {
      const match = this.matchRoute(pathname, routePath);
      if (match) {
        matchedRoute = route;
        params = match;
        break;
      }
    }

    if (!matchedRoute) {
      return new Response('Not Found', { status: 404 });
    }

    if (matchedRoute.handleHeaders) {
      const headersValid = await matchedRoute.handleHeaders(req.headers);
      if (!headersValid) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const data: IThanhHoaWebSocketData = {
      routeHandler: matchedRoute,
      path: pathname,
      query: Object.fromEntries(url.searchParams),
      params,
      headers: req.headers,
      custom: {},
    };

    return server.upgrade(req, { data })
      ? undefined
      : new Response('Upgrade failed', { status: 500 });
  }

  private matchRoute(
    pathname: string,
    routePath: string,
  ): Record<string, string> | null {
    const pathnameSegments = pathname.split('/');
    const routeSegments = routePath.split('/');

    if (pathnameSegments.length !== routeSegments.length) {
      return null;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < routeSegments.length; i++) {
      if (routeSegments[i].startsWith(':')) {
        const paramName = routeSegments[i].slice(1);
        params[paramName] = pathnameSegments[i];
      } else if (routeSegments[i] !== pathnameSegments[i]) {
        return null;
      }
    }

    return params;
  }

  private async handleOpen(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
  ): Promise<void> {
    const { routeHandler, query, params } = ws.data;
    if (
      await this.applyMiddlewares(
        ws,
        new Set([
          ...this.globalMiddlewares,
          ...(routeHandler.middlewares || []),
        ]),
      )
    ) {
      await routeHandler.onOpen?.(ws, query, params);
    }
    this.emit('open', ws.data, ws);
  }

  private async handleMessage(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    message: string | Buffer,
  ): Promise<void> {
    const { routeHandler } = ws.data;
    if (
      await this.applyMiddlewares(
        ws,
        new Set([
          ...this.globalMiddlewares,
          ...(routeHandler.middlewares || []),
        ]),
      )
    ) {
      await routeHandler.onMessage?.(ws, message);
    }
    this.emit('message', { ...ws.data, message }, ws);
  }

  private async handleClose(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    code: number,
    reason: string,
  ): Promise<void> {
    const { routeHandler } = ws.data;
    await routeHandler.onClose?.(ws, code, reason);
    this.emit('close', { ...ws.data, code, reason }, ws);
  }

  private handleDrain(ws: ServerWebSocket<IThanhHoaWebSocketData>): void {
    this.emit('drain', ws.data, ws);
  }

  /**
   * Groups routes with a common prefix.
   * @param {string} prefix - The prefix for the group of routes.
   * @param {...(WebSocketMiddleware | RouterHandler)} args - Middlewares and RouterHandler.
   */
  group(
    prefix: string,
    ...args: (WebSocketMiddleware | RouterHandler)[]
  ): void {
    const handler = args.pop() as RouterHandler;
    const groupMiddlewares = new Set(args as WebSocketMiddleware[]);

    for (const [routePath, route] of handler.getRoutes()) {
      const fullPath = prefix ? `${prefix}/${routePath}` : routePath;
      const allMiddlewares = new Set([
        ...groupMiddlewares,
        ...route.middlewares,
      ]);
      this.routes.set(
        fullPath.replace(/^\/+|\/+$/g, ''),
        new Route(fullPath, route.handler, allMiddlewares),
      );
    }
  }

  /**
   * Sends a broadcast message to all connections.
   * @param {string | ArrayBufferView | ArrayBuffer | SharedArrayBuffer} message - The message to send.
   * @param {boolean} [compress] - Whether to compress the message.
   */
  broadcast(
    message: string | ArrayBufferView | ArrayBuffer | SharedArrayBuffer,
    compress?: boolean,
  ): void {
    this.server.publish('broadcast', message, compress);
  }

  /**
   * Subscribes to a topic.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {string} topic - The topic to subscribe to.
   */
  subscribe(ws: ServerWebSocket<IThanhHoaWebSocketData>, topic: string): void {
    ws.subscribe(topic);
  }

  /**
   * Unsubscribes from a topic.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {string} topic - The topic to unsubscribe from.
   */
  unsubscribe(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    topic: string,
  ): void {
    ws.unsubscribe(topic);
  }

  /**
   * Publishes a message to a topic.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {string} topic - The topic to publish to.
   * @param {string | Bun.BufferSource} message - The message to publish.
   * @param {boolean} [compress] - Whether to compress the message.
   */
  publish(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    topic: string,
    message: string | Bun.BufferSource,
    compress?: boolean,
  ): void {
    ws.publish(topic, message, compress);
  }

  /**
   * Checks if a client is subscribed to a topic.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {string} topic - The topic to check.
   * @returns {boolean} - Whether the client is subscribed to the topic.
   */
  isSubscribed(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    topic: string,
  ): boolean {
    return ws.isSubscribed(topic);
  }

  /**
   * Sends a message to a client.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {string | Bun.BufferSource} message - The message to send.
   * @param {boolean} [compress] - Whether to compress the message.
   * @returns {number} - The number of bytes sent.
   */
  send(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    message: string | Bun.BufferSource,
    compress?: boolean,
  ): number {
    return ws.send(message, compress);
  }

  /**
   * Cork the WebSocket connection.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {() => T} callback - The callback to execute.
   * @returns {T} - The result of the callback.
   */
  cork<T>(ws: ServerWebSocket<IThanhHoaWebSocketData>, callback: () => T): T {
    return ws.cork(callback);
  }

  /**
   * Close the WebSocket connection.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {number} [code] - The close code to send.
   * @param {string} [reason] - The close reason to send.
   * @returns {void}
   */
  close(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    code?: number,
    reason?: string,
  ): void {
    ws.close(code, reason);
  }

  /**
   * Stops the WebSocket server.
   * @return {void} No return value.
   */
  stop(): void {
    this.server.stop();
  }

  /**
   * Returns the hostname of the server.
   * @return {string} The hostname of the server.
   */
  get hostname(): string {
    return this.server.hostname;
  }

  /**
   * Returns the port number of the server.
   * @return {number} The port number of the server.
   */
  get port(): number {
    return this.server.port;
  }

  /**
   * Returns the number of pending WebSocket connections.
   * @return {number} The number of pending WebSocket connections.
   */
  get pendingWebSockets(): number {
    return this.server.pendingWebSockets;
  }

  /**
   * Returns a boolean indicating whether the server is in development mode.
   * @return {boolean} True if the server is in development mode, false otherwise.
   */
  get development(): boolean {
    return this.server.development;
  }

  /**
   * Returns statistics about the WebSocket server.
   * @return {object} An object containing the number of pending connections and the route count.
   */
  getStats(): object {
    return {
      pendingConnections: this.pendingWebSockets,
      routeCount: this.routes.size,
    };
  }

  /**
   * Prints the server information to the console.
   */
  logger(): void {
    const logger = Logger.get('THANHHOA WEBSOCKET');
    const space = ' ';
    const indentTwoSpaces = space.repeat(2);
    const indentThreeSpaces = space.repeat(4);

    logger.success('ThanhHoaWebSocket Server Information');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Server Details
    logger.info('📡 Server Details:');
    logger.info(
      `${indentTwoSpaces}🔗 Listening on: ${this.hostname}:${this.port}`,
    );
    logger.info(
      `${indentTwoSpaces}🛠️ Development mode: ${this.development ? 'Enabled' : 'Disabled'}`,
    );
    logger.info('');

    // Defined Routes
    logger.info('🛣️ Defined Routes:');
    for (const [path, route] of this.routes) {
      logger.info(`${indentTwoSpaces}📍 ${path}`);
    }
    logger.info('');

    // Global Middlewares
    logger.info('🔗 Global Middlewares:');
    logger.info(`${indentTwoSpaces}📊 Count: ${this.globalMiddlewares.size}`);
    logger.info('');

    // Server Options
    logger.info('⚙️ Server Options:');
    logger.info(`${indentTwoSpaces}🔢 Port: ${this.options.port}`);
    if (this.options.websocket) {
      logger.info(`${indentTwoSpaces}🔌 WebSocket handlers:`);
      logger.info(
        `${indentThreeSpaces}📨 message: ${typeof this.options.websocket.message === 'function' ? '✅ Defined' : '❌ Not defined'}`,
      );
      logger.info(
        `${indentThreeSpaces}🔓 open: ${typeof this.options.websocket.open === 'function' ? '✅ Defined' : '❌ Not defined'}`,
      );
      logger.info(
        `${indentThreeSpaces}🔒 close: ${typeof this.options.websocket.close === 'function' ? '✅ Defined' : '❌ Not defined'}`,
      );
      logger.info(
        `${indentThreeSpaces}🚰 drain: ${typeof this.options.websocket.drain === 'function' ? '✅ Defined' : '❌ Not defined'}`,
      );
    }

    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
}
