import type { WebSocketMiddleware } from '@thanhhoajs/websocket';

export const authMiddleware: WebSocketMiddleware = async (ws) => {
  try {
    const authHeader = ws.data.headers.get('Authorization');
    if (!authHeader) {
      ws.close(1008, 'Authentication required');
      return;
    }

    // Process token from header
    const token = authHeader.split(' ')[1]; // Suppose format is "Bearer <token>"

    // Perform token validation here
    // ...

    // If authentication is successful, save user information into custom data
    ws.data.custom!.user = { id: '123', username: 'username' };
  } catch (error) {
    console.error('Authentication failed:', error);
    ws.close(1008, 'Authentication failed');
  }
};
