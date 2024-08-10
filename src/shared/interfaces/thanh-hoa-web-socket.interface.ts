import {
  type IThanhHoaWebSocketData,
  type WebSocketMiddleware,
  RouterHandler,
} from '@thanhhoajs/websocket';
import type { ServerWebSocket } from 'bun';

export interface IThanhHoaWebSocket {
  /**
   * Adds a global middleware.
   * @param {WebSocketMiddleware} middleware - The middleware to add.
   */
  use(middleware: WebSocketMiddleware): void;

  /**
   * Groups routes with a common prefix.
   * @param {string} prefix - The prefix for the group of routes.
   * @param {...(WebSocketMiddleware | RouterHandler)} args - Middlewares and RouterHandler.
   */
  group(prefix: string, ...args: (WebSocketMiddleware | RouterHandler)[]): void;

  /**
   * Sends a broadcast message to all connections.
   * @param {string | ArrayBufferView | ArrayBuffer | SharedArrayBuffer} message - The message to send.
   * @param {boolean} [compress] - Whether to compress the message.
   */
  broadcast(
    message: string | ArrayBufferView | ArrayBuffer | SharedArrayBuffer,
    compress?: boolean,
  ): void;

  /**
   * Subscribes to a topic.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {string} topic - The topic to subscribe to.
   */
  subscribe(ws: ServerWebSocket<IThanhHoaWebSocketData>, topic: string): void;

  /**
   * Unsubscribes from a topic.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {string} topic - The topic to unsubscribe from.
   */
  unsubscribe(ws: ServerWebSocket<IThanhHoaWebSocketData>, topic: string): void;

  /**
   * Publishes a message to a topic.
   * @param {string} topic - The topic to publish to.
   * @param {string | Bun.BufferSource} message - The message to publish.
   * @param {boolean} [compress] - Whether to compress the message.
   */
  publish(
    topic: string,
    message: string | Bun.BufferSource,
    compress?: boolean,
  ): void;

  /**
   * Checks if a client is subscribed to a topic.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {string} topic - The topic to check.
   * @returns {boolean} - Whether the client is subscribed to the topic.
   */
  isSubscribed(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    topic: string,
  ): boolean;

  /**
   * Sends a message to a client.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {string | Bun.BufferSource} message - The message to send.
   * @param {boolean} [compress] - Whether to compress the message.
   * @returns {number} - The number of bytes sent.
   */
  send(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    message: string | Bun.BufferSource,
    compress?: boolean,
  ): number;

  /**
   * Cork the WebSocket connection.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {() => T} callback - The callback to execute.
   * @returns {T} - The result of the callback.
   */
  cork<T>(ws: ServerWebSocket<IThanhHoaWebSocketData>, callback: () => T): T;

  /**
   * Close the WebSocket connection.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {number} [code] - The close code to send.
   * @param {string} [reason] - The close reason to send.
   * @returns {void}
   */
  close(
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    code?: number,
    reason?: string,
  ): void;

  /**
   * Stops the WebSocket server.
   * @return {void} No return value.
   */
  stop(): void;

  /**
   * Returns the hostname of the server.
   * @return {string} The hostname of the server.
   */
  get hostname(): string;

  /**
   * Returns the port number of the server.
   * @return {number} The port number of the server.
   */
  get port(): number;

  /**
   * Returns the number of pending WebSocket connections.
   * @return {number} The number of pending WebSocket connections.
   */
  get pendingWebSockets(): number;

  /**
   * Returns a boolean indicating whether the server is in development mode.
   * @return {boolean} True if the server is in development mode, false otherwise.
   */
  get development(): boolean;

  /**
   * Returns statistics about the WebSocket server.
   * @return {object} An object containing the number of pending connections and the route count.
   */
  getStats(): object;

  /**
   * Prints the server information to the console.
   */
  logger(): void;
}
