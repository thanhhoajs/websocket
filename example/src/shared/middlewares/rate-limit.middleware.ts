import type {
  IThanhHoaWebSocketData,
  WebSocketMiddleware,
} from '@thanhhoajs/websocket';
import type { ServerWebSocket } from 'bun';

export const rateLimitMiddleware = (
  limit: number,
  timeWindow: number,
): WebSocketMiddleware => {
  const userMessageCounts = new Map<
    string,
    { count: number; lastReset: number }
  >();

  return (ws: ServerWebSocket<IThanhHoaWebSocketData>) => {
    const userId =
      (ws.data.custom?.user as { id: string } | undefined)?.id ||
      ws.remoteAddress;
    const now = Date.now();

    if (!userMessageCounts.has(userId)) {
      userMessageCounts.set(userId, { count: 0, lastReset: now });
    }

    const userCount = userMessageCounts.get(userId)!;

    if (now - userCount.lastReset > timeWindow) {
      userCount.count = 0;
      userCount.lastReset = now;
    }

    if (userCount.count >= limit) {
      ws.send('Rate limit exceeded. Please wait before sending more messages.');
      return;
    }

    userCount.count++;
  };
};
