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

    const roomId = params?.roomId;
    if (roomId) {
      ws.send('Hi, welcome to room!');
      const chatTopic = `chat:${roomId}`;

      ws.subscribe(chatTopic);
      ws.data.custom = { chatTopic };
    } else {
      console.error('No roomId provided');
      ws.close(1000, 'No roomId provided');
    }
  },
  onMessage: (
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    message: string | Buffer,
  ) => {
    const chatTopic = ws.data.custom?.chatTopic;

    if (chatTopic) {
      ws.publish(chatTopic, message);
    } else {
      console.error('No chatTopic found');
    }
  },
  onClose: (ws, code, reason) => {
    const chatTopic = ws.data.custom?.chatTopic;

    if (chatTopic) {
      ws.unsubscribe(chatTopic);
    }
  },
};
