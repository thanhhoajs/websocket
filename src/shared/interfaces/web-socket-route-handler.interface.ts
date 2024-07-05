import type {
  IThanhHoaWebSocketData,
  WebSocketMiddleware,
} from '@thanhhoajs/websocket';
import type { ServerWebSocket } from 'bun';

/**
 * Interface for WebSocket route handler.
 */
export interface IWebSocketRouteHandler {
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
  middlewares?: Set<WebSocketMiddleware>;
}
