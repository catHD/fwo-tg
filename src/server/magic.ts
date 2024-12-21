import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import MagicService from '@/arena/MagicService';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';

export const magic = new Hono()
  .use(userMiddleware, characterMiddleware)
  .patch('/:lvl', zValidator('param', z.object({ lvl: z.number({ coerce: true }) })), async (c) => {
    const character = c.get('character');
    const { lvl } = c.req.valid('param');

    const magic = await MagicService.learnMagic(character, lvl);
    return c.json({ name: magic.name });
  })
  .get('/', zValidator('query', z.object({ ids: z.string().array() })), async (c) => {
    const { ids } = c.req.valid('query');
    const magics = MagicService.getMagicListByIds(ids);

    return c.json(magics);
  })
  .get('/available', (c) => {
    const character = c.get('character');
    const magics = MagicService.getMagicListByProf(character.prof);

    return c.json(magics);
  })
  .get('/:id', (c) => {
    const id = c.req.param('id');
    const magic = MagicService.getMagicById(id);

    return c.json(magic);
  });
