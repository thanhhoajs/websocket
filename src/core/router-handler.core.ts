import {
  type WebSocketMiddleware,
  type IWebSocketRouteHandler,
  Route,
  type IRouterHandler,
} from '@thanhhoajs/websocket';

/**
 * Manages WebSocket routes.
 */
export class RouterHandler implements IRouterHandler {
  private routes: Map<string, Route> = new Map();

  route(
    path: string,
    ...args: (WebSocketMiddleware | IWebSocketRouteHandler)[]
  ): void {
    const handler = args.pop() as IWebSocketRouteHandler;
    const middlewares = new Set(args as WebSocketMiddleware[]);
    this.routes.set(path, new Route(path, handler, middlewares));
  }

  getRoutes(): Map<string, Route> {
    return this.routes;
  }
}
