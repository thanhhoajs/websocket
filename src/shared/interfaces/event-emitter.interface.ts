import type {
  EventHandler,
  IThanhHoaWebSocketData,
} from '@thanhhoajs/websocket';
import type { ServerWebSocket } from 'bun';

/**
 * Interface for EventEmitter.
 */
export interface IEventEmitter {
  on<T = any>(event: string, listener: EventHandler<T>): void;

  emit<T = any>(
    event: string,
    data: T,
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
  ): void;
}
