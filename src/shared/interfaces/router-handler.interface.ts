import type {
  IWebSocketRouteHandler,
  Route,
  WebSocketMiddleware,
} from '@thanhhoajs/websocket';

export interface IRouterHandler {
  /**
   * Adds a new route.
   * @param {string} path - The path of the route.
   * @param {...(WebSocketMiddleware | IWebSocketRouteHandler)} args - Middlewares and route handler.
   */
  route(
    path: string,
    ...args: (WebSocketMiddleware | IWebSocketRouteHandler)[]
  ): void;

  /**
   * Gets all registered routes.
   * @returns {Map<string, Route>} Map of routes.
   */
  getRoutes(): Map<string, Route>;
}
