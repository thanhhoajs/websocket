import type {
  IThanhHoaWebSocketData,
  IWebSocketRouteHandler,
} from '@thanhhoajs/websocket';
import type { ServerWebSocket } from 'bun';

export const donationHandlers: IWebSocketRouteHandler = {
  onOpen: (ws, query, params) => {
    console.log('New donation connection opened', { query, params });
    ws.subscribe('donation');
  },
  onMessage: (
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    message: string | Buffer,
  ) => {
    console.log('Received donation message:', message);

    // Handle donation logic here
    ws.publish('donation', `Donation update: ${message}`);
  },
  onClose: (ws, code, reason) => {
    console.log('Donation connection closed', { code, reason });
    ws.unsubscribe('donation');
  },
};
