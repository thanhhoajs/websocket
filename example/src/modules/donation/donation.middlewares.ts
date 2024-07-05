import type { WebSocketMiddleware } from '@thanhhoajs/websocket';

export const donationAuthMiddleware: WebSocketMiddleware = (ws) => {
  const donationToken = ws.data.query?.donationToken;
  if (!donationToken) {
    ws.close(1008, 'Donation authentication required');
    return;
  }

  // Verify donation token here
};
