import type { WebSocketMiddleware } from '@thanhhoajs/websocket';

import { rateLimitMiddleware } from '../../shared/middlewares/rate-limit.middleware';

export const roomRateLimitMiddleware: WebSocketMiddleware = rateLimitMiddleware(
  5,
  10000,
);
