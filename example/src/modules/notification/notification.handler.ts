import type {
  IThanhHoaWebSocketData,
  IWebSocketRouteHandler,
} from '@thanhhoajs/websocket';
import type { ServerWebSocket } from 'bun';

export const notificationHandlers: IWebSocketRouteHandler = {
  onOpen: (ws, query, params) => {
    console.log('New notification connection opened', { query, params });
    ws.subscribe('notification');
  },
  onMessage: (
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    message: string | Buffer,
  ) => {
    console.log('Received notification message:', message);

    // Handle notification logic here
  },
  onClose: (ws, code, reason) => {
    console.log('Notification connection closed', { code, reason });
    ws.unsubscribe('notification');
  },
};
