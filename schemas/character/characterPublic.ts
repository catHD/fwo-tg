import type { z } from 'zod';
import { characterSchema } from './characterSchema';

export const characterPublicSchema = characterSchema.pick({
  name: true,
  lvl: true,
  class: true,
  clan: true,
});

export type CharacterPublic = z.infer<typeof characterPublicSchema>;
