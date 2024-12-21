import { Hono } from 'hono';
import SkillService from '@/arena/SkillService';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';

export const skill = new Hono()
  .use(characterMiddleware, userMiddleware)
  .patch('/:id', async (c) => {
    const character = c.get('character');
    const { id } = c.req.param();

    // @ts-expect-error fixme
    await SkillService.learn(character, id);
    return c.status(200);
  });
