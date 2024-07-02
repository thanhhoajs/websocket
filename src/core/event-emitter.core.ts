import type {
  EventHandler,
  IEventEmitter,
  IThanhHoaWebSocketData,
} from '@thanhhoajs/websocket';
import type { ServerWebSocket } from 'bun';

/**
 * EventEmitter class implements the IEventEmitter interface
 * Provides methods for handling and emitting events
 */
export class EventEmitter implements IEventEmitter {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  /**
   * Adds an event listener for the specified event
   * @param {string} event - The name of the event to listen for
   * @param {EventHandler<T>} listener - The callback function to execute when the event is emitted
   * @template T - The type of data that will be passed to the event handler
   * @example
   * emitter.on('message', (data, ws) => {
   *   console.log('Received message:', data);
   * });
   */
  on<T = any>(event: string, listener: EventHandler<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as EventHandler);
  }

  /**
   * Emits an event with the given name and data
   * @param {string} event - The name of the event to emit
   * @param {T} data - The data to pass to the event handlers
   * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The WebSocket connection associated with this event
   * @template T - The type of data being emitted
   * @example
   * emitter.emit('message', 'Hello, world!', websocketConnection);
   */
  emit<T = any>(
    event: string,
    data: T,
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data, ws));
    }
  }

  /**
   * Removes a specific listener for the specified event
   * @param {string} event - The name of the event to remove the listener from
   * @param {EventHandler<T>} listener - The callback function to remove
   * @template T - The type of data that the event handler was expecting
   * @example
   * const messageHandler = (data, ws) => {
   *   console.log('Received message:', data);
   * };
   * emitter.on('message', messageHandler);
   * // Later, when you want to remove the listener:
   * emitter.off('message', messageHandler);
   */
  off<T = any>(event: string, listener: EventHandler<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener as EventHandler);
    }
  }
}
