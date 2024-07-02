import type { IWebSocketRouteHandler } from '@thanhhoajs/websocket';

/**
 * Defines the interface for custom Thanh Hoa WebSocket data.
 */
export interface IThanhHoaWebSocketData {
  /**
   * The route handler for the WebSocket.
   */
  routeHandler: IWebSocketRouteHandler;

  /**
   * The path of the WebSocket route.
   */
  path: string;

  /**
   * The query parameters of the WebSocket route.
   */
  query?: Record<string, string>;
}
