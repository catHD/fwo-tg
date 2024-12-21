import type { Context } from 'hono';

export function getToken(c: Context) {
  const authorization = c.req.header('authorization');
  if (authorization) {
    return authorization;
  }

  const protocol = c.req.header('sec-websocket-protocol');
  if (protocol) {
    return decodeURIComponent(protocol);
  }
}
