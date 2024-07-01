import type {
  EventHandler,
  IThanhHoaWebSocketData,
} from "@thanhhoajs/websocket";
import type { ServerWebSocket } from "bun";

/**
 * Interface for a basic event emitter.
 */
export interface IEventEmitter {
  /**
   * Registers an event listener for the specified event.
   * @param {string} event - The name of the event.
   * @param {EventHandler<T>} listener - The callback function to be executed when the event is emitted.
   * @template T - The type of data passed to the event handler.
   */
  on<T = any>(event: string, listener: EventHandler<T>): void;

  /**
   * Emits an event with the specified data and WebSocket connection.
   * @param {string} event - The name of the event to emit.
   * @param {T} data - The data to be passed to the event handlers.
   * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The WebSocket connection associated with the event.
   * @template T - The type of data being emitted.
   */
  emit<T = any>(
    event: string,
    data: T,
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
  ): void;

  /**
   * Removes an event listener for the specified event.
   * @param {string} event - The name of the event.
   * @param {EventHandler<T>} listener - The callback function to be removed.
   * @template T - The type of data passed to the event handler.
   */
  off<T = any>(event: string, listener: EventHandler<T>): void;
}
