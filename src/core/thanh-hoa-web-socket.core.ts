import {
  EventEmitter,
  type IThanhHoaWebSocketData,
  type ThanhHoaWebSocketOptions,
  type IWebSocketRouteHandler,
  type WebSocketMiddleware,
} from '@thanhhoajs/websocket';
import type { Server, ServerWebSocket, WebSocketServeOptions } from 'bun';

/**
 * ThanhHoaWebSocket class extends EventEmitter to provide WebSocket functionality
 */
export class ThanhHoaWebSocket extends EventEmitter {
  private options: WebSocketServeOptions<IThanhHoaWebSocketData>;
  private server: Server | null = null;
  private routes: Map<string, IWebSocketRouteHandler> = new Map();
  private middlewares: WebSocketMiddleware[] = [];

  /**
   * Initializes a new instance of ThanhHoaWebSocket
   * @param {ThanhHoaWebSocketOptions} options - Configuration options for the WebSocket server
   * @example
   * const ws = new ThanhHoaWebSocket({
   *   port: 3001,
   *   websocket: {
   *     perMessageDeflate: true,
   *     idleTimeout: 60,
   *     maxPayloadLength: 1024 * 1024,
   *   }
   * });
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
        perMessageDeflate: options.websocket?.perMessageDeflate ?? true,
        ...options.websocket,
      },
    };
  }

  /**
   * Handles WebSocket upgrade requests
   * @param {Request} req - The incoming HTTP request
   * @param {Server} server - The Bun server instance
   * @returns {Promise<Response | undefined>} A response if the upgrade fails, undefined if successful
   */
  private async handleUpgrade(
    req: Request,
    server: Server,
  ): Promise<Response | undefined> {
    try {
      const url = new URL(req.url);
      let routeHandler = this.routes.get(url.pathname);

      if (!routeHandler && (url.pathname === '/' || url.pathname === '')) {
        routeHandler = this.routes.get('');
      }

      if (routeHandler) {
        if (routeHandler.handleHeaders) {
          const headersValid = await routeHandler.handleHeaders(req.headers);
          if (!headersValid) {
            return new Response('Unauthorized', { status: 401 });
          }
        }

        const data: IThanhHoaWebSocketData = {
          routeHandler,
          path: url.pathname,
        };

        // Extract query parameters
        if (url.search) {
          const query: Record<string, string> = {};
          url.searchParams.forEach((value, key) => {
            query[key] = value;
          });
          data.query = query;
        }

        const upgraded = server.upgrade<IThanhHoaWebSocketData>(req, { data });
        if (upgraded) return;
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Error during WebSocket upgrade:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  /**
   * Handles the opening of a WebSocket connection
   * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The WebSocket connection
   * @returns {Promise<void>}
   */
  private async handleOpen(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
  ): Promise<void> {
    let index = 0;
    const runMiddleware = async () => {
      if (index < this.middlewares.length) {
        await this.middlewares[index++](ws, runMiddleware);
      } else {
        const { routeHandler, path, query } = ws.data;
        routeHandler.onOpen?.(ws, query);
        this.emit('open', { path, remoteAddress: ws.remoteAddress, query }, ws);
      }
    };
    await runMiddleware();
  }

  /**
   * Handles incoming messages on a WebSocket connection
   * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The WebSocket connection
   * @param {string | Buffer} message - The received message
   */
  private handleMessage(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    message: string | Buffer,
  ): void {
    const { routeHandler, path } = ws.data;
    routeHandler.onMessage?.(ws, message);
    this.emit('message', { path, message }, ws);
  }

  /**
   * Handles the closing of a WebSocket connection
   * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The WebSocket connection
   * @param {number} code - The close code
   * @param {string} reason - The reason for closing
   */
  private handleClose(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    code: number,
    reason: string,
  ): void {
    const { routeHandler, path } = ws.data;
    routeHandler.onClose?.(ws, code, reason);
    this.emit('close', { path, code, reason }, ws);
  }

  /**
   * Handles the drain event of a WebSocket connection
   * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The WebSocket connection
   */
  private handleDrain(ws: ServerWebSocket<IThanhHoaWebSocketData>): void {
    this.emit('drain', { path: ws.data.path }, ws);
  }

  /**
   * Adds a middleware to the WebSocket server
   * @param {WebSocketMiddleware} middleware - The middleware function to add
   * @example
   * ws.use(async (socket, next) => {
   *   console.log("New connection from", socket.remoteAddress);
   *   await next();
   * });
   */
  use(middleware: WebSocketMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Adds a route handler for a specific path
   * @param {string} path - The path to handle
   * @param {IWebSocketRouteHandler} handler - The handler for the route
   * @example
   * ws.addRoute("/chat", {
   *   onOpen: (socket) => console.log("New connection"),
   *   onMessage: (socket, message) => console.log("Received:", message)
   * });
   */
  addRoute(path: string, handler: IWebSocketRouteHandler): void {
    this.routes.set(path, handler);
  }

  /**
   * Adds multiple route handlers for a specific prefix
   * @param {string} prefix - The prefix to handle
   * @param {Record<string, IWebSocketRouteHandler>} routes - The handlers for the routes
   * @example
   * ws.addRoutes("/chat", {
   *   "/users": {
   *     onOpen: (socket) => console.log("New connection"),
   *     onMessage: (socket, message) => console.log("Received:", message)
   *   }
   * });
   */
  addRoutes(prefix: string, routes: Record<string, IWebSocketRouteHandler>) {
    for (const [path, handler] of Object.entries(routes)) {
      this.addRoute(`${prefix}${path}`, handler);
    }
  }

  /**
   * Removes a route handler for a specific path
   * @param {string} path - The path to remove the handler for
   */
  removeRoute(path: string): void {
    this.routes.delete(path);
  }

  /**
   * Removes all route handlers
   */
  clearRoutes(): void {
    this.routes.clear();
  }

  /**
   * Removes all middleware
   */
  clearMiddleware(): void {
    this.middlewares = [];
  }

  /**
   * Broadcasts a message to all connected clients
   * @param {string | Uint8Array} message - The message to broadcast
   * @param {boolean} [compress] - Whether to compress the message
   * @example
   * ws.broadcast("Hello everyone!");
   */
  broadcast(message: string | Uint8Array, compress?: boolean): void {
    this.server?.publish('broadcast', message, compress);
  }

  /**
   * Subscribes a client to a topic
   * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The WebSocket connection
   * @param {string} topic - The topic to subscribe to
   * @example
   * ws.subscribe(clientSocket, "news-updates");
   */
  subscribe(ws: ServerWebSocket<IThanhHoaWebSocketData>, topic: string): void {
    ws.subscribe(topic);
  }

  /**
   * Unsubscribes a client from a topic
   * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The WebSocket connection
   * @param {string} topic - The topic to unsubscribe from
   */
  unsubscribe(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    topic: string,
  ): void {
    ws.unsubscribe(topic);
  }

  /**
   * Publishes a message to a topic
   * @param {string} topic - The topic to publish to
   * @param {string | Uint8Array} message - The message to publish
   * @param {boolean} [compress] - Whether to compress the message
   * @example
   * ws.publish("news-updates", "Breaking news!");
   */
  publish(
    topic: string,
    message: string | Uint8Array,
    compress?: boolean,
  ): void {
    this.server?.publish(topic, message, compress);
  }

  /**
   * Checks if a client is subscribed to a topic
   * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The WebSocket connection
   * @param {string} topic - The topic to check
   * @returns {boolean} True if subscribed, false otherwise
   */
  isSubscribed(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    topic: string,
  ): boolean {
    return ws.isSubscribed(topic);
  }

  /**
   * Sends a message to a specific client
   * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The WebSocket connection
   * @param {string | Uint8Array} message - The message to send
   * @param {boolean} [compress] - Whether to compress the message
   * @returns {number} The number of bytes sent
   * @example
   * const bytesSent = ws.send(clientSocket, "Hello ThanhHoa!");
   */
  send(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    message: string | Uint8Array,
    compress?: boolean,
  ): number {
    return ws.send(message, compress);
  }

  /**
   * Executes a callback in a corked context for batched sends
   * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The WebSocket connection
   * @param {Function} callback - The callback to execute
   * @returns {T} The result of the callback
   */
  cork<T>(ws: ServerWebSocket<IThanhHoaWebSocketData>, callback: () => T): T {
    return ws.cork(callback);
  }

  /**
   * Closes a WebSocket connection
   * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The WebSocket connection to close
   * @param {number} [code] - The close code
   * @param {string} [reason] - The reason for closing
   */
  close(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    code?: number,
    reason?: string,
  ): void {
    ws.close(code, reason);
  }

  /**
   * Starts the WebSocket server
   * @returns {Server} The Bun server instance
   */
  listen(): Server {
    this.server = Bun.serve(this.options);
    return this.server;
  }

  /**
   * Stops the WebSocket server
   */
  stop(): void {
    this.server?.stop();
    this.server = null;
  }

  /**
   * Gets the hostname of the server
   * @returns {string | undefined} The hostname
   */
  get hostname(): string | undefined {
    return this.server?.hostname;
  }

  /**
   * Gets the port of the server
   * @returns {number | undefined} The port
   */
  get port(): number | undefined {
    return this.server?.port;
  }

  /**
   * Gets the number of pending WebSocket connections
   * @returns {number} The number of pending connections
   */
  get pendingWebSockets(): number {
    return this.server?.pendingWebSockets || 0;
  }

  /**
   * Gets whether the server is in development mode
   * @returns {boolean | undefined} True if in development mode, false otherwise
   */
  get development(): boolean | undefined {
    return this.server?.development;
  }

  /**
   * Gets statistics about the WebSocket server
   * @returns {object} An object containing server statistics
   */
  getStats(): object {
    return {
      pendingConnections: this.pendingWebSockets,
      routeCount: this.routes.size,
      middlewareCount: this.middlewares.length,
    };
  }
}
