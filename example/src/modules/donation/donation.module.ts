import { RouterHandler, type ThanhHoaWebSocket } from '@thanhhoajs/websocket';

import { donationHandlers } from './donation.handler';
import { donationAuthMiddleware } from './donation.middlewares';

export function donationModule(ws: ThanhHoaWebSocket) {
  const router = new RouterHandler();

  router.route('', donationAuthMiddleware, donationHandlers);

  ws.group('donation', router);
}
