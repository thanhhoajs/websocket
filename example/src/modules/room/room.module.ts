import { type ThanhHoaWebSocket, RouterHandler } from '@thanhhoajs/websocket';

import { roomRateLimitMiddleware } from './room.middleware';
import { eventHandlers, chatHandlers } from './room.handler';

export function roomModule(ws: ThanhHoaWebSocket) {
  const router = new RouterHandler();
  router.route('chat', chatHandlers);
  router.route('event', roomRateLimitMiddleware, eventHandlers);

  ws.group('room', router);
}
