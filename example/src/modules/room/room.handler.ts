import type {
  IThanhHoaWebSocketData,
  IWebSocketRouteHandler,
} from '@thanhhoajs/websocket';
import type { ServerWebSocket } from 'bun';

export const eventHandlers: IWebSocketRouteHandler = {
  onOpen: (ws, query, params) => {
    console.log('Room onOpen called', { query, params });
    ws.send('Hi, welcome to room!');
    ws.subscribe('event');
  },
  onMessage: (
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    message: string | Buffer,
  ) => {
    ws.publish('event', message);
  },
  onClose: (ws, code, reason) => {
    ws.unsubscribe('event');
  },
};

export const chatHandlers: IWebSocketRouteHandler = {
  onOpen: (ws, query, params) => {
    console.log('Room onOpen called', { query, params });
    ws.send('Hi, welcome to room!');
    ws.subscribe('chat');
  },
  onMessage: (
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    message: string | Buffer,
  ) => {
    ws.publish('chat', message);
  },
  onClose: (ws, code, reason) => {
    ws.unsubscribe('chat');
  },
};
