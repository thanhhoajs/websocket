import {
  type WebSocketMiddleware,
  type IWebSocketRouteHandler,
  Route,
} from '@thanhhoajs/websocket';

/**
 * Manages WebSocket routes.
 */
export class RouterHandler {
  private routes: Map<string, Route> = new Map();

  /**
   * Adds a new route.
   * @param {string} path - The path of the route.
   * @param {...(WebSocketMiddleware | IWebSocketRouteHandler)} args - Middlewares and route handler.
   */
  route(
    path: string,
    ...args: (WebSocketMiddleware | IWebSocketRouteHandler)[]
  ): void {
    const handler = args.pop() as IWebSocketRouteHandler;
    const middlewares = new Set(args as WebSocketMiddleware[]);
    this.routes.set(path, new Route(path, handler, middlewares));
  }

  /**
   * Gets all registered routes.
   * @returns {Map<string, Route>} Map of routes.
   */
  getRoutes(): Map<string, Route> {
    return this.routes;
  }
}
