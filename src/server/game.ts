import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { orderSchema } from '@fwo/schemas';
import { characterMiddleware, userMiddleware, gameMiddleware } from '@/server/middlewares';
import { HTTPException } from 'hono/http-exception';

export const game = new Hono()
  .use(userMiddleware, characterMiddleware, gameMiddleware)
  .post('/order', zValidator('json', orderSchema), async (c) => {
    const player = c.get('player');
    const game = c.get('game');
    const order = c.req.valid('json');

    try {
      game.orders.orderAction({
        initiator: player.id,
        ...order,
      });
    } catch (e) {
      console.log(e);
      throw new HTTPException(400);
    }

    c.status(200);
  });
