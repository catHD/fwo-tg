import { WebSocketContext } from '@/contexts/webSocket';
import { use } from 'react';

export const useWebSocket = () => {
  const ws = use(WebSocketContext);

  if (!ws) {
    throw new Error('ws must be within WebSocketContext');
  }

  return {
    ws,
  };
};
