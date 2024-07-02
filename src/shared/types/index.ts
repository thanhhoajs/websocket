import type { IThanhHoaWebSocketData } from '@thanhhoajs/websocket';
import type {
  ServerWebSocket,
  WebSocketHandler,
  WebSocketServeOptions,
} from 'bun';

/**
 * Type definition for an event handler function.
 * @template T - The type of data passed to the event handler.
 */
export type EventHandler<T = any> = (
  data: T,
  ws: ServerWebSocket<IThanhHoaWebSocketData>,
) => void;

/**
 * Custom options type for Thanh Hoa WebSocket configuration.
 * Extends WebSocketServeOptions but omits 'fetch' and 'websocket' properties.
 */
export type ThanhHoaWebSocketOptions = Partial<
  Omit<WebSocketServeOptions<IThanhHoaWebSocketData>, 'fetch' | 'websocket'>
> & {
  /**
   * Optional partial WebSocketHandler for custom WebSocket behavior.
   */
  websocket?: Partial<WebSocketHandler<IThanhHoaWebSocketData>>;
};

/**
 * Type definition for a WebSocket middleware function.
 * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The WebSocket connection.
 * @param {() => void} next - The function to call to pass control to the next middleware.
 * @returns {void | Promise<void>}
 */
export type WebSocketMiddleware = (
  ws: ServerWebSocket<IThanhHoaWebSocketData>,
  next: () => void,
) => void | Promise<void>;
