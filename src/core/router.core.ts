import type { ServerWebSocket } from 'bun';
import type {
  IWebSocketRouteHandler,
  WebSocketMiddleware,
  IThanhHoaWebSocketData,
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
    this.handleHeaders = handler.handleHeaders;
    this.onOpen = handler.onOpen;
    this.onMessage = handler.onMessage;
    this.onClose = handler.onClose;
    this.middlewares = new Set([
      ...(handler.middlewares || []),
      ...middlewares,
    ]);
  }

  handleHeaders?: (headers: Headers) => boolean | Promise<boolean>;
  onOpen?: (
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    query?: Record<string, string>,
    params?: Record<string, string>,
  ) => void | Promise<void>;
  onMessage?: (
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    message: string | Buffer,
  ) => void | Promise<void>;
  onClose?: (
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    code: number,
    reason: string,
  ) => void | Promise<void>;
}
