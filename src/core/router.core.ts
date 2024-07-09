import type {
  IWebSocketRouteHandler,
  WebSocketMiddleware,
} from '@thanhhoajs/websocket';

/**
 * Represents a WebSocket route.
 * @implements {IWebSocketRouteHandler}
 */
export class Route implements IWebSocketRouteHandler {
  /**
   * Creates a new instance of Route.
   * @param {string} path - The path of the route.
   * @param {IWebSocketRouteHandler} handler - The route handler.
   * @param {Set<WebSocketMiddleware>} [middlewares=new Set()] - Set of middlewares.
   */
  constructor(
    public path: string,
    public handler: IWebSocketRouteHandler,
    public middlewares: Set<WebSocketMiddleware> = new Set(),
  ) {
    this.onOpen = handler.onOpen;
    this.onMessage = handler.onMessage;
    this.onClose = handler.onClose;
    this.middlewares = new Set([
      ...(handler.middlewares || []),
      ...middlewares,
    ]);
  }

  onOpen?: IWebSocketRouteHandler['onOpen'];
  onMessage?: IWebSocketRouteHandler['onMessage'];
  onClose?: IWebSocketRouteHandler['onClose'];
}
