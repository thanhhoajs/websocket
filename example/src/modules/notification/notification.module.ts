import { RouterHandler, type ThanhHoaWebSocket } from '@thanhhoajs/websocket';

import { notificationHandlers } from './notification.handler';

export function notificationModule(ws: ThanhHoaWebSocket) {
  const router = new RouterHandler();

  router.route('', notificationHandlers);

  ws.group('notification', router);
}
