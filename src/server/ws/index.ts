import { type Context, Hono } from 'hono';
import { createBunWebSocket } from 'hono/bun';
import type { ServerWebSocket } from 'bun';
import { userMiddleware, characterMiddleware, type CharacterEnv } from '@/server/middlewares';
import { WebSocketRouter } from './router';
import { WebSocketHelper } from '@/helpers/webSocketHelper';

const { upgradeWebSocket } = createBunWebSocket<ServerWebSocket>();

export const ws = new Hono()
  .use(userMiddleware)
  .use(characterMiddleware)
  .get(
    '/',
    upgradeWebSocket((c: Context<CharacterEnv>) => {
      const webSocketHelper = new WebSocketHelper();

      const router = new WebSocketRouter(webSocketHelper, c.get('character'));

      return {
        async onOpen(_, ws) {
          if (ws.raw) {
            webSocketHelper.setWs(ws.raw);
            router.onOpen();
          }
        },
        onMessage({ data }) {
          const message = WebSocketHelper.read(data);

          if (message) {
            router.onMessage(message);
          }
        },
        onClose() {
          router.onClosed();
        },
      };
    }),
  );
