import type { WebSocketMiddleware } from '@thanhhoajs/websocket';

export const donationAuthMiddleware: WebSocketMiddleware = async (ws) => {
  const donationToken = ws.data.query?.donationToken;
  if (!donationToken) {
    ws.close(1008, 'Donation authentication required');
    return false;
  }

  // Verify donation token here
  return true;
};
