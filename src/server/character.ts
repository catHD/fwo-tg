import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createCharacter, removeCharacter } from '@/api/character';
import { CharacterService } from '@/arena/CharacterService';
import { profsData } from '@/data/profs';
import { characterAttributesSchema, createCharacterSchema } from '@fwo/schemas';
import { characterMiddleware, userMiddleware } from './middlewares';

export const character = new Hono()
  .use(userMiddleware)
  .post('/', zValidator('json', createCharacterSchema), async (c) => {
    const createCharacterDto = await c.req.valid('json');
    const user = c.get('user');
    await createCharacter({
      owner: user.id.toString(),
      nickname: createCharacterDto.name,
      prof: createCharacterDto.class,
      harks: profsData[createCharacterDto.class].hark,
      magics: profsData[createCharacterDto.class].mag,
      sex: 'm',
    });
    const character = await CharacterService.getCharacter(user.id.toString());

    return c.json(character.toObject(), 200);
  })
  .use(characterMiddleware)
  .get('/', async (c) => {
    const character = c.get('character');

    return c.json(character.toObject(), 200);
  })
  .delete('/', async (c) => {
    const character = c.get('character');
    await removeCharacter(character.owner);

    return c.json({}, 200);
  })
  .patch('/attributes', zValidator('json', characterAttributesSchema), async (c) => {
    const character = c.get('character');
    const harks = c.req.valid('json');
    // fixme validate harks and bonus
    await character.submitIncreaseHarks({ ...harks, free: 0 });
    await character.save({ harks, bonus: 0 });

    return c.json(character.toObject(), 200);
  });
