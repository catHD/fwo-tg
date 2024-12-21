import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { hc } from 'hono/client';
import type { Server } from '@fwo/server';

const { initDataRaw } = retrieveLaunchParams();

export const token = `tma ${initDataRaw}`;

const createWebSocket = (url: string | URL) => {
  return new WebSocket(url, [encodeURIComponent(token)]);
};

export const client = hc<Server>('http://192.168.10.39:3000', {
  webSocket: createWebSocket,
  headers: {
    Authorization: token,
  },
});
