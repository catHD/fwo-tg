import { client } from '@/client';
import { WebSocketHelper } from '@/helpers/webSocketHelper';
import type { PropsWithChildren } from 'react';
import { createContext, useRef } from 'react';

export const WebSocketContext = createContext<WebSocketHelper | undefined>(undefined);

export const WebSocketProvider = ({ children }: PropsWithChildren) => {
  const ws = client.ws.$ws();

  const wsRef = useRef(new WebSocketHelper(ws));

  return <WebSocketContext value={wsRef.current}>{children}</WebSocketContext>;
};
