import type { IThanhHoaWebSocketData } from '@thanhhoajs/websocket';
import type {
  ServerWebSocket,
  WebSocketHandler,
  WebSocketServeOptions,
} from 'bun';

/**
 * Type for event handler function.
 */
export type EventHandler<T = any> = (
  data: T,
  ws: ServerWebSocket<IThanhHoaWebSocketData>,
) => void;

/**
 * Options for ThanhHoaWebSocket.
 */
export type ThanhHoaWebSocketOptions = Partial<
  Omit<WebSocketServeOptions<IThanhHoaWebSocketData>, 'fetch' | 'websocket'>
> & {
  websocket?: Partial<WebSocketHandler<IThanhHoaWebSocketData>>;
};

/**
 * Type for WebSocket middleware.
 */
export type WebSocketMiddleware = (
  ws: ServerWebSocket<IThanhHoaWebSocketData>,
) => void | Promise<void>;
