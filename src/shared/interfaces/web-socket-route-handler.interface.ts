import type { IThanhHoaWebSocketData } from "@thanhhoa/websocket";
import type { ServerWebSocket } from "bun";

/**
 * Defines the interface for a WebSocket route handler.
 */
export interface IWebSocketRouteHandler {
  /**
   * Handles headers before the WebSocket connection is established.
   * @param {Headers} headers - The request Headers object.
   * @returns {boolean | Promise<boolean>} Returns true if the connection is accepted, false otherwise.
   */
  handleHeaders?: (headers: Headers) => boolean | Promise<boolean>;

  /**
   * Called when a WebSocket connection is opened.
   * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The ServerWebSocket object with custom data.
   * @returns {void | Promise<void>}
   */
  onOpen?: (
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
  ) => void | Promise<void>;

  /**
   * Called when a message is received from the client.
   * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The ServerWebSocket object with custom data.
   * @param {string | Buffer} message - The received message, either as a string or Buffer.
   * @returns {void | Promise<void>}
   */
  onMessage?: (
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    message: string | Buffer,
  ) => void | Promise<void>;

  /**
   * Called when the WebSocket connection is closed.
   * @param {ServerWebSocket<IThanhHoaWebSocketData>} ws - The ServerWebSocket object with custom data.
   * @param {number} code - The status code indicating why the connection was closed.
   * @param {string} reason - The reason why the connection was closed.
   * @returns {void | Promise<void>}
   */
  onClose?: (
    ws: ServerWebSocket<IThanhHoaWebSocketData>,
    code: number,
    reason: string,
  ) => void | Promise<void>;
}
