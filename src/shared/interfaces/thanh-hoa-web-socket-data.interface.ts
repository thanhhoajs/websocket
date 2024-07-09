import type { IWebSocketRouteHandler } from '@thanhhoajs/websocket';

/**
 * Data structure for WebSocket connection.
 */
export interface IThanhHoaWebSocketData {
  routeHandler: IWebSocketRouteHandler;
  path: string;
  query?: Record<string, string>;
  params?: Record<string, string>;
  headers: Headers;
  custom?: Record<string, any>;
  clientId: string;
}
